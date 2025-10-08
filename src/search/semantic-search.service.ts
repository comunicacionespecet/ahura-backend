import { Injectable } from '@nestjs/common';
import { ElasticsearchConfig } from './elasticsearch.config';

export interface SearchResult {
  id: string;
  text: string;
  metadata: any;
  score?: number;
}

@Injectable()
export class SemanticSearchService {
  constructor(private readonly esConfig: ElasticsearchConfig) {}

  async search(queryEmbedding: number[], topK: number = 10): Promise<SearchResult[]> {
    const client = this.esConfig.getClient();
    const indexName = this.esConfig.getIndexName();

    const response = await client.search({
      index: indexName,
      size: topK,
      query: {
        script_score: {
          query: { match_all: {} },
          script: {
            source: "cosineSimilarity(params.query_vector, 'embedding') + 1.0",
            params: { query_vector: queryEmbedding },
          },
        },
      },
      _source: ['text', 'metadata'],
    });

    const hits = response.hits.hits;
    return hits.map((hit: any) => ({
      id: hit._id,
      text: hit._source.text,
      metadata: hit._source.metadata,
      score: hit._score,
    }));
  }

  async countDocuments(): Promise<number> {
    const client = this.esConfig.getClient();
    const indexName = this.esConfig.getIndexName();

    const response = await client.count({ index: indexName });
    return response.count;
  }

  async getLatestDocuments(count: number = 3): Promise<SearchResult[]> {
    const client = this.esConfig.getClient();
    const indexName = this.esConfig.getIndexName();

    const response = await client.search({
      index: indexName,
      size: count,
      sort: [{ 'metadata.uploaded_at': { order: 'desc' } }],
      _source: ['text', 'metadata'],
    });

    const hits = response.hits.hits;
    return hits.map((hit: any) => ({
      id: hit._id,
      text: hit._source.text,
      metadata: hit._source.metadata,
    }));
  }
}
