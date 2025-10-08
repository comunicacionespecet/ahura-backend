import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchDocumentsDto {
  @ApiProperty({
    description: 'Query text to search for',
    example: '¿Cómo funciona la autenticación?',
  })
  @IsString()
  @IsNotEmpty()
  query: string;

  @ApiProperty({
    description: 'Number of top results to return',
    example: 10,
    required: false,
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  top_k?: number = 10;
}

export class UploadLinkDto {
  @ApiProperty({
    description: 'URL of the document to download and index',
    example: 'https://example.com/document.pdf',
  })
  @IsString()
  @IsNotEmpty()
  url: string;
}
