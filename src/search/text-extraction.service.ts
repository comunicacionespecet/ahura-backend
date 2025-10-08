import { Injectable } from '@nestjs/common';
import * as mammoth from 'mammoth';

@Injectable()
export class TextExtractionService {
  async extractTextFromFile(filename: string, buffer: Buffer): Promise<string> {
    const lowerFilename = filename.toLowerCase();

    if (lowerFilename.endsWith('.pdf')) {
      return this.extractFromPdf(buffer);
    } else if (lowerFilename.endsWith('.docx')) {
      return this.extractFromDocx(buffer);
    } else {
      throw new Error(`Unsupported file format: ${filename}`);
    }
  }

  private async extractFromPdf(buffer: Buffer): Promise<string> {
    // Usar require para pdf-parse debido a problemas con import ESM
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(buffer);
    return data.text;
  }

  private async extractFromDocx(buffer: Buffer): Promise<string> {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
}
