import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { SearchDocumentsDto, UploadLinkDto } from './dto/search.dto';
import { TextExtractionService } from './text-extraction.service';
import { EmbeddingService } from './embedding.service';
import { DocumentIndexingService } from './document-indexing.service';
import { SemanticSearchService } from './semantic-search.service';
import { DocumentStorageService } from './document-storage.service';
import { randomUUID } from 'crypto';
import axios from 'axios';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(
    private readonly textExtraction: TextExtractionService,
    private readonly embedding: EmbeddingService,
    private readonly indexing: DocumentIndexingService,
    private readonly search: SemanticSearchService,
    private readonly storage: DocumentStorageService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload and index a document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    try {
      // 1. Extraer texto del archivo
      const text = await this.textExtraction.extractTextFromFile(
        file.originalname,
        file.buffer,
      );

      // 2. Subir a S3
      const { s3Key, eTag } = await this.storage.uploadDocument(
        file.originalname,
        file.buffer,
        file.mimetype,
      );

      // 3. Generar embedding
      const embeddingVector = await this.embedding.generateEmbedding(text);

      // 4. Indexar en Elasticsearch
      const docId = randomUUID();
      await this.indexing.indexDocument(docId, text, embeddingVector, {
        filename: file.originalname,
        s3_key: s3Key,
        uploaded_at: new Date(),
      });

      return {
        id: docId,
        filename: file.originalname,
        s3_key: s3Key,
        text_preview: text.substring(0, 200) + '...',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error processing document',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('upload-link')
  @ApiOperation({ summary: 'Upload document from URL and index it' })
  async uploadFromLink(@Body() dto: UploadLinkDto) {
    try {
      // 1. Descargar archivo desde URL
      const response = await axios.get(dto.url, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);
      const filename = dto.url.split('/').pop() || 'document';

      // 2. Extraer texto
      const text = await this.textExtraction.extractTextFromFile(filename, buffer);

      // 3. Subir a S3
      const { s3Key } = await this.storage.uploadDocument(
        filename,
        buffer,
        response.headers['content-type'],
      );

      // 4. Generar embedding
      const embeddingVector = await this.embedding.generateEmbedding(text);

      // 5. Indexar en Elasticsearch
      const docId = randomUUID();
      await this.indexing.indexDocument(docId, text, embeddingVector, {
        filename,
        source_url: dto.url,
        s3_key: s3Key,
        uploaded_at: new Date(),
      });

      return {
        id: docId,
        filename,
        source_url: dto.url,
        s3_key: s3Key,
        text_preview: text.substring(0, 200) + '...',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error processing document from URL',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @ApiOperation({ summary: 'Search documents by semantic similarity' })
  async searchDocuments(@Body() dto: SearchDocumentsDto) {
    try {
      // 1. Generar embedding de la query
      const queryEmbedding = await this.embedding.generateEmbedding(dto.query);

      // 2. Buscar documentos similares
      const results = await this.search.search(queryEmbedding, dto.top_k || 10);

      return {
        query: dto.query,
        results,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error searching documents',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('preview/:id')
  @ApiOperation({ summary: 'Get document preview by ID' })
  async previewDocument(@Param('id') id: string) {
    try {
      const doc = await this.indexing.getDocumentById(id);
      const source = doc._source;

      // Si tiene s3_key, generar URL de preview
      let previewUrl: string | null = null;
      if (source.metadata?.s3_key) {
        previewUrl = await this.storage.getDocumentPreviewUrl(source.metadata.s3_key);
      }

      return {
        id,
        text: source.text,
        metadata: source.metadata,
        preview_url: previewUrl,
      };
    } catch (error) {
      throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
    }
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboard() {
    try {
      const total = await this.search.countDocuments();
      const latest = await this.search.getLatestDocuments(3);

      return {
        total,
        latest: latest.map((doc) => ({
          id: doc.id,
          filename: doc.metadata?.filename,
          uploaded_at: doc.metadata?.uploaded_at,
        })),
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error fetching dashboard data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
