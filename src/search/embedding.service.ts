import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class EmbeddingService {
  private readonly embeddingApiUrl: string;

  constructor(private readonly configService: ConfigService) {
    // URL del servicio Python que genera embeddings
    this.embeddingApiUrl = this.configService.get<string>(
      'EMBEDDING_API_URL',
      'http://localhost:8000/generate-embedding',
    );
  }

  /**
   * Genera embedding para el texto dado usando el servicio Python
   * @param text Texto a convertir en embedding
   * @returns Array de números que representa el embedding
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await axios.post(this.embeddingApiUrl, { text });
      return response.data.embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }
}
