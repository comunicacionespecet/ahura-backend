import {
  Controller,
  UseInterceptors,
  Post,
  Get,
  Query,
  UploadedFile,
  ParseFilePipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiQuery,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiSecurity,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { ApikeyGuard } from '../auth/guards/apikey.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(ApikeyGuard)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}
  @Post()
  @Roles('administrador', 'super_administrador')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir un archivo' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Archivo subido exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'File uploaded successfully' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Archivo inválido o faltante' })
  @ApiInternalServerErrorResponse({ description: 'Error interno del servidor' })
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('api-key')
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // Add your validation logic here
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const result = await this.uploadService.upload(file.originalname, file.buffer, file.mimetype);
    return {
      success: true,
      message: 'File uploaded successfully',
      originalName: file.originalname,
      sanitizedName: result.fileName,
      eTag: result.eTag,
    };
  }

  @Get('download')
  @Roles('usuario', 'administrador', 'super_administrador')
  @ApiOperation({ summary: 'Obtener URL de descarga de un archivo' })
  @ApiQuery({ name: 'key', description: 'Clave del archivo a descargar' })
  @ApiResponse({
    status: 200,
    description: 'URL de descarga generada',
    schema: {
      type: 'object',
      properties: {
        downloadUrl: {
          type: 'string',
          example: 'https://s3.amazonaws.com/bucket/file.pdf',
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Archivo no encontrado' })
  @ApiInternalServerErrorResponse({ description: 'Error interno del servidor' })
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('api-key')
  download(@Query('key') key: string) {
    return this.uploadService.getDownloadUrl(key);
  }

  @Get('preview')
  @Roles('usuario', 'administrador', 'super_administrador')
  @ApiOperation({ summary: 'Obtener URL de vista previa de un archivo' })
  @ApiQuery({ name: 'key', description: 'Clave del archivo para vista previa' })
  @ApiResponse({
    status: 200,
    description: 'URL de vista previa generada',
    schema: {
      type: 'object',
      properties: {
        previewUrl: {
          type: 'string',
          example: 'https://s3.amazonaws.com/bucket/file.pdf',
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Archivo no encontrado' })
  @ApiInternalServerErrorResponse({ description: 'Error interno del servidor' })
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('api-key')
  preview(@Query('key') key: string) {
    return this.uploadService.getPreviewUrl(key);
  }
}
