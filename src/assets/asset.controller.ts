import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AssetService } from './asset.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { UpdateAssetUserDto } from './dto/update-asset-user.dto';
import { FindAssetsQueryDto } from './dto/find-assets.query.dto';
import { ApikeyGuard } from '../auth/guards/apikey.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PayloadToken } from '../auth/models/token.model';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiSecurity,
} from '@nestjs/swagger';
import { Asset } from './schemas/asset.schema';
import { ApiAuthHeaders } from '../common/decorators/api-headers.decorator';

@ApiTags('assets')
@Controller('assets')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Post()
  @UseGuards(ApikeyGuard, JwtAuthGuard, RolesGuard)
  @Roles('administrador', 'super_administrador')
  @ApiOperation({ summary: 'Crear un nuevo activo de conocimiento' })
  @ApiResponse({
    status: 201,
    description: 'Activo creado exitosamente',
    type: Asset,
  })
  @ApiBadRequestResponse({ description: 'Datos de entrada inválidos' })
  @ApiInternalServerErrorResponse({ description: 'Error interno del servidor' })
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('api-key')
  @ApiAuthHeaders()
  create(@Body() dto: CreateAssetDto) {
    console.log('dto');
    return this.assetService.create(dto);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Obtener todos los activos con filtros',
    description: 'Los usuarios no administradores solo verán activos no confidenciales. Los administradores y super_administradores verán todos los activos.'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de activos',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/Asset' } },
        total: { type: 'number', example: 100 },
        page: { type: 'number', example: 1 },
        totalPages: { type: 'number', example: 5 },
      },
    },
  })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Búsqueda global en título, descripción y keywords',
  })
  @ApiQuery({
    name: 'title',
    required: false,
    description: 'Filtrar por título',
  })
  @ApiQuery({
    name: 'userName',
    required: false,
    description: 'Filtrar por nombre de usuario',
  })
  @ApiQuery({
    name: 'legalAny',
    required: false,
    description: 'Buscar en todos los campos legales',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número de página',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Elementos por página',
    example: 20,
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Ordenamiento (ej: -publishDate,title)',
  })
  @ApiInternalServerErrorResponse({ description: 'Error interno del servidor' })
  findAll(
    @Query() q: FindAssetsQueryDto,
    @CurrentUser() user?: PayloadToken,
  ) {
    return this.assetService.findAll(q, user?.role);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Obtener un activo por ID',
    description: 'Los usuarios no administradores no podrán ver activos confidenciales. Los administradores y super_administradores verán todos los activos.'
  })
  @ApiParam({ name: 'id', description: 'ID único del activo' })
  @ApiResponse({ status: 200, description: 'Activo encontrado', type: Asset })
  @ApiNotFoundResponse({ description: 'Activo no encontrado o sin permisos para verlo' })
  @ApiInternalServerErrorResponse({ description: 'Error interno del servidor' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user?: PayloadToken,
  ) {
    return this.assetService.findOne(id, user?.role);
  }

  @Patch(':id')
  @UseGuards(ApikeyGuard, JwtAuthGuard, RolesGuard)
  @Roles('administrador', 'super_administrador')
  @ApiOperation({ summary: 'Actualizar un activo por ID' })
  @ApiParam({ name: 'id', description: 'ID único del activo' })
  @ApiResponse({
    status: 200,
    description: 'Activo actualizado exitosamente',
    type: Asset,
  })
  @ApiBadRequestResponse({ description: 'Datos de entrada inválidos' })
  @ApiNotFoundResponse({ description: 'Activo no encontrado' })
  @ApiInternalServerErrorResponse({ description: 'Error interno del servidor' })
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('api-key')
  @ApiAuthHeaders()
  update(@Param('id') id: string, @Body() dto: UpdateAssetDto) {
    return this.assetService.update(id, dto);
  }

  @Patch(':id/user-stats')
  @UseGuards(ApikeyGuard, JwtAuthGuard, RolesGuard)
  @Roles('usuario', 'administrador', 'super_administrador')
  @ApiOperation({
    summary: 'Actualizar estadísticas del activo (solo para usuarios)',
  })
  @ApiParam({ name: 'id', description: 'ID único del activo' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas del activo actualizadas exitosamente',
    type: Asset,
  })
  @ApiBadRequestResponse({ description: 'Datos de entrada inválidos' })
  @ApiNotFoundResponse({ description: 'Activo no encontrado' })
  @ApiInternalServerErrorResponse({ description: 'Error interno del servidor' })
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('api-key')
  @ApiAuthHeaders()
  updateUserStats(@Param('id') id: string, @Body() dto: UpdateAssetUserDto) {
    return this.assetService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(ApikeyGuard, JwtAuthGuard, RolesGuard)
  @Roles('administrador', 'super_administrador')
  @ApiOperation({ summary: 'Eliminar un activo por ID' })
  @ApiParam({ name: 'id', description: 'ID único del activo' })
  @ApiResponse({ status: 200, description: 'Activo eliminado exitosamente' })
  @ApiNotFoundResponse({ description: 'Activo no encontrado' })
  @ApiInternalServerErrorResponse({ description: 'Error interno del servidor' })
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('api-key')
  @ApiAuthHeaders()
  remove(@Param('id') id: string) {
    return this.assetService.remove(id);
  }
}
