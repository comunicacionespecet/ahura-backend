import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SearchController } from './search.controller';
import { ElasticsearchConfig } from './elasticsearch.config';
import { TextExtractionService } from './text-extraction.service';
import { EmbeddingService } from './embedding.service';
import { DocumentIndexingService } from './document-indexing.service';
import { SemanticSearchService } from './semantic-search.service';
import { DocumentStorageService } from './document-storage.service';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [ConfigModule, UploadModule],
  controllers: [SearchController],
  providers: [
    ElasticsearchConfig,
    TextExtractionService,
    EmbeddingService,
    DocumentIndexingService,
    SemanticSearchService,
    DocumentStorageService,
  ],
  exports: [
    ElasticsearchConfig,
    TextExtractionService,
    EmbeddingService,
    DocumentIndexingService,
    SemanticSearchService,
    DocumentStorageService,
  ],
})
export class SearchModule {}
