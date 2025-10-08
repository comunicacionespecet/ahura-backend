import { Client } from '@elastic/elasticsearch';
import { ConfigService } from '@nestjs/config';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class ElasticsearchConfig implements OnModuleInit {
  private client: Client;
  private readonly indexName: string;

  constructor(private readonly configService: ConfigService) {
    this.client = new Client({
      node: this.configService.get<string>('ELASTICSEARCH_URL', 'http://localhost:9200'),
    });
    this.indexName = this.configService.get<string>('ES_INDEX', 'documents');
  }

  async onModuleInit() {
    await this.createIndex();
  }

  getClient(): Client {
    return this.client;
  }

  getIndexName(): string {
    return this.indexName;
  }

  async createIndex() {
    try {
      const exists = await this.client.indices.exists({ index: this.indexName });
      if (!exists) {
        await this.client.indices.create({
          index: this.indexName,
          mappings: {
            properties: {
              text: { type: 'text' },
              embedding: {
                type: 'dense_vector',
                dims: 384, // dimension para all-MiniLM-L6-v2
                index: true,
                similarity: 'cosine',
              },
              metadata: {
                type: 'object',
                properties: {
                  filename: { type: 'keyword' },
                  source_url: { type: 'keyword' },
                  s3_key: { type: 'keyword' },
                  uploaded_at: { type: 'date' },
                },
              },
            },
          },
        });
        console.log(`Index '${this.indexName}' created successfully`);
      }
    } catch (error) {
      console.error('Error creating Elasticsearch index:', error);
    }
  }
}
