import { Injectable } from '@nestjs/common';
import { ElasticsearchConfig } from './elasticsearch.config';

export interface DocumentMetadata {
  filename: string;
  source_url?: string;
  s3_key?: string;
  uploaded_at?: Date;
  [key: string]: any;
}

@Injectable()
export class DocumentIndexingService {
  constructor(private readonly esConfig: ElasticsearchConfig) {}

  async indexDocument(
    docId: string,
    text: string,
    embedding: number[],
    metadata: DocumentMetadata,
  ): Promise<void> {
    const client = this.esConfig.getClient();
    const indexName = this.esConfig.getIndexName();

    await client.index({
      index: indexName,
      id: docId,
      document: {
        text,
        embedding,
        metadata: {
          ...metadata,
          uploaded_at: metadata.uploaded_at || new Date(),
        },
      },
    });
  }

  async getDocumentById(docId: string): Promise<any> {
    const client = this.esConfig.getClient();
    const indexName = this.esConfig.getIndexName();

    try {
      const result = await client.get({
        index: indexName,
        id: docId,
      });
      return result;
    } catch (error) {
      throw new Error(`Document not found: ${docId}`);
    }
  }

  async deleteDocument(docId: string): Promise<void> {
    const client = this.esConfig.getClient();
    const indexName = this.esConfig.getIndexName();

    await client.delete({
      index: indexName,
      id: docId,
    });
  }
}
