// upload.service.ts
import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class UploadService {
  private client: S3Client;
  private bucket: string;

  constructor(private readonly config: ConfigService) {
    this.client = new S3Client({
      region: this.config.getOrThrow('AWS_S3_REGION'),
      credentials: {
        accessKeyId: this.config.getOrThrow('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.config.getOrThrow('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.bucket = this.config.getOrThrow('AWS_S3_BUCKET');
  }

  /**
   * Sanitizes filename by removing accents and special characters
   * @param filename - Original filename
   * @returns Sanitized filename safe for S3
   */
  private sanitizeFilename(filename: string): string {
    // Extract extension
    const lastDotIndex = filename.lastIndexOf('.');
    const name = lastDotIndex !== -1 ? filename.substring(0, lastDotIndex) : filename;
    const extension = lastDotIndex !== -1 ? filename.substring(lastDotIndex) : '';

    // Normalize accents (NFD = decomposed form)
    // Then remove combining diacritical marks
    const normalized = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    // Replace spaces and special characters with hyphens
    // Allow only alphanumeric, hyphens, and underscores
    const sanitized = normalized
      .replace(/\s+/g, '-')           // spaces to hyphens
      .replace(/[^a-zA-Z0-9_-]/g, '') // remove special chars
      .replace(/-+/g, '-')            // multiple hyphens to single
      .replace(/^-|-$/g, '');         // trim hyphens from edges

    return sanitized + extension.toLowerCase();
  }

  // ⬇️ PASA también el mimetype (file.mimetype)
  async upload(fileName: string, file: Buffer, mime?: string) {
    // Sanitize filename before uploading to S3
    const sanitizedFileName = this.sanitizeFilename(fileName);

    const put = await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: sanitizedFileName,
        Body: file,
        ContentType: mime ?? 'application/octet-stream',
        // ContentDisposition: 'inline', // opcional como default en el objeto
        // ACL: 'private' (recomendado)
      }),
    );
    return {
      fileName: sanitizedFileName,
      eTag: put.ETag,
      status: put.$metadata.httpStatusCode,
    };
  }

  // 🔽 Forzar DESCARGA
  async getDownloadUrl(key: string, expiresIn = 900) {
    // Sanitize the key to match how it was stored
    const sanitizedKey = this.sanitizeFilename(key);

    const cmd = new GetObjectCommand({
      Bucket: this.bucket,
      Key: sanitizedKey,
      ResponseContentDisposition: `attachment; filename="${encodeURIComponent(key)}"; filename*=UTF-8''${encodeURIComponent(key)}`,
    });
    const url = await getSignedUrl(this.client, cmd, { expiresIn });
    return { url };
  }

  // 🔽 PREVISUALIZACIÓN (inline)
  async getPreviewUrl(key: string, expiresIn = 900) {
    // Sanitize the key to match how it was stored
    const sanitizedKey = this.sanitizeFilename(key);

    // (Opcional) leer el ContentType real del objeto
    let contentType = 'application/octet-stream';
    try {
      const head = await this.client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: sanitizedKey }),
      );
      if (head.ContentType) contentType = head.ContentType;
    } catch {
      // si falla HeadObject, seguimos con octet-stream
    }

    const cmd = new GetObjectCommand({
      Bucket: this.bucket,
      Key: sanitizedKey,
      ResponseContentDisposition: `inline; filename="${encodeURIComponent(key)}"; filename*=UTF-8''${encodeURIComponent(key)}`,
      ResponseContentType: contentType,
    });
    const url = await getSignedUrl(this.client, cmd, { expiresIn });
    return { url };
  }
}
