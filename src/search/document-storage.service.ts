import { Injectable } from '@nestjs/common';
import { UploadService } from '../upload/upload.service';
import { randomUUID } from 'crypto';

@Injectable()
export class DocumentStorageService {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * Sube un documento a S3 y retorna la key generada
   */
  async uploadDocument(
    filename: string,
    buffer: Buffer,
    mimeType?: string,
  ): Promise<{ s3Key: string; eTag: string | undefined }> {
    const s3Key = `documents/${randomUUID()}-${filename}`;
    const result = await this.uploadService.upload(s3Key, buffer, mimeType);

    return {
      s3Key,
      eTag: result.eTag,
    };
  }

  /**
   * Descarga un documento desde S3 usando la key
   */
  async downloadDocument(s3Key: string): Promise<Buffer> {
    // Necesitaremos agregar este método al UploadService
    // Por ahora retornaremos la URL de preview para descargar
    const { url } = await this.uploadService.getPreviewUrl(s3Key);

    // En producción, mejor usar GetObjectCommand directamente
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Obtiene URL de preview para un documento en S3
   */
  async getDocumentPreviewUrl(s3Key: string, expiresIn = 900): Promise<string> {
    const { url } = await this.uploadService.getPreviewUrl(s3Key, expiresIn);
    return url;
  }

  /**
   * Obtiene URL de descarga para un documento en S3
   */
  async getDocumentDownloadUrl(s3Key: string, expiresIn = 900): Promise<string> {
    const { url } = await this.uploadService.getDownloadUrl(s3Key, expiresIn);
    return url;
  }
}
