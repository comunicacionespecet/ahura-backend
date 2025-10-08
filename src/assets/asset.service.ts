import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, SortOrder, Types } from 'mongoose';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { Asset, AssetDocument } from './schemas/asset.schema';
import { CatalogService } from '../catalogs/catalog.service';
import { FindAssetsQueryDto } from './dto/find-assets.query.dto';

@Injectable()
export class AssetService {
  constructor(
    @InjectModel(Asset.name) private assetModel: Model<AssetDocument>,
    private readonly catalogs: CatalogService,
  ) {}

  async create(createAssetDto: CreateAssetDto): Promise<Asset> {
    try {
      // 1) valida enums con catálogo
      await this.catalogs.validateAssetEnums(createAssetDto);

      // 2) normaliza opcionales para evitar undefined vs string
      const payload: Partial<Asset> = {
        ...createAssetDto,
        publishDate: new Date(createAssetDto.publishDate),
        description: createAssetDto.description ?? '',
        image: createAssetDto.image ?? '',
        activeKnowledgeType: createAssetDto.activeKnowledgeType ?? '',
        format: createAssetDto.format ?? '',
        fileUri: createAssetDto.fileUri ?? '',
        relatedIds: createAssetDto.relatedIds ?? [],
        keywords: createAssetDto.keywords ?? [],
        responsibleOwner: createAssetDto.responsibleOwner ?? '',
        confidentiality: createAssetDto.confidentiality ?? false,
        criticality: createAssetDto.criticality ?? 'leve',
        status: createAssetDto.status ?? 'en curso',
        origin: createAssetDto.origin ?? 'interno',
        howIsItStored: createAssetDto.howIsItStored ? {
          pecetKnowledge: createAssetDto.howIsItStored.pecetKnowledge ?? '',
          centralicedRepositories: createAssetDto.howIsItStored.centralicedRepositories ?? '',
        } : undefined,
        legalRegulations: createAssetDto.legalRegulations ? {
          copyright: createAssetDto.legalRegulations.copyright ?? '',
          patents: createAssetDto.legalRegulations.patents ?? '',
          tradeSecrets: createAssetDto.legalRegulations.tradeSecrets ?? '',
          industrialDesigns: createAssetDto.legalRegulations.industrialDesigns ?? '',
          brands: createAssetDto.legalRegulations.brands ?? '',
          industrialIntellectualProperty: createAssetDto.legalRegulations.industrialIntellectualProperty ?? '',
        } : undefined,
      };

      const created = new this.assetModel(payload);
      return await created.save();
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new BadRequestException(error?.message ?? 'Error creating asset');
    }
  }

  async update(id: string, updateAssetDto: UpdateAssetDto): Promise<Asset> {
    try {
      // valida solo lo que venga
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await this.catalogs.validateAssetEnums(updateAssetDto as any);

      const updated = await this.assetModel
        .findOneAndUpdate({ id }, updateAssetDto, { new: true })
        .exec();
      if (!updated)
        throw new NotFoundException(`Asset with id ${id} not found`);
      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error updating asset');
    }
  }

  private escapeRegex(input: string) {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private parseSort(sort?: string): Record<string, SortOrder> {
    if (!sort) return { publishDate: -1 as SortOrder };
    return sort.split(',').reduce(
      (acc, field) => {
        field = field.trim();
        if (!field) return acc;
        if (field.startsWith('-')) acc[field.substring(1)] = -1;
        else acc[field] = 1;
        return acc;
      },
      {} as Record<string, 1 | -1>,
    );
  }

  async findAll(
    query?: FindAssetsQueryDto,
    userRole?: string,
  ): Promise<{ items: Asset[]; page: number; limit: number; total: number }> {
    try {
      const q = query || ({} as FindAssetsQueryDto);
      const filter: FilterQuery<AssetDocument> = {};

      // Filter confidential assets based on user role
      const isAdmin = userRole === 'administrador' || userRole === 'super_administrador';
      if (!isAdmin) {
        // Non-admin users can only see non-confidential assets
        filter.$or = [
          { confidentiality: false },
          { confidentiality: { $exists: false } },
        ];
      }

      // ===== Campos base =====
      if (q.title)
        filter.title = { $regex: this.escapeRegex(q.title), $options: 'i' };
      if (q.description)
        filter.description = {
          $regex: this.escapeRegex(q.description),
          $options: 'i',
        };
      if (q.knowledgeType) filter.knowledgeType = q.knowledgeType;
      if (q.activeKnowledgeType)
        filter.activeKnowledgeType = q.activeKnowledgeType;
      if (q.format) filter.format = q.format;
      if (q.status) filter.status = q.status;
      if (q.criticality) filter.criticality = q.criticality;
      if (q.origin) filter.origin = q.origin;
      if (q.ownerId) filter.ownerId = q.ownerId;
      if (q.responsibleOwner)
        filter.responsibleOwner = {
          $regex: this.escapeRegex(q.responsibleOwner),
          $options: 'i',
        };
      if (q.confidentiality !== undefined)
        filter.confidentiality = q.confidentiality;

      // Rango publishDate
      if (q.publishFrom || q.publishTo) {
        filter.publishDate = {};
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (q.publishFrom) filter.publishDate.$gte = new Date(q.publishFrom);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (q.publishTo) filter.publishDate.$lte = new Date(q.publishTo);
      }

      // Arrays de búsqueda
      if (q.keywords?.length) {
        filter.keywords = { $all: q.keywords };
      }
      if (q.ids?.length) {
        // si almacenan _id de Mongo
        filter._id = {
          $in: q.ids.map((id) => {
            try {
              return new Types.ObjectId(id);
            } catch {
              return id;
            }
          }),
        };
      }
      if (q.businessIds?.length) {
        filter.id = { $in: q.businessIds };
      }

      // ===== SUBNIVELES =====

      // availability.*
      if (q.availabilityAccessibility !== undefined) {
        filter['availability.accessibility'] = q.availabilityAccessibility;
      }
      if (q.availabilityLocation) {
        filter['availability.location'] = {
          $regex: this.escapeRegex(q.availabilityLocation),
          $options: 'i',
        };
      }

      // classificationLevel.level
      if (q.classificationLevelLevel) {
        filter['classificationLevel.level'] = q.classificationLevelLevel;
      }

      // howIsItStored.*
      if (q.howPecetKnowledge) {
        filter['howIsItStored.pecetKnowledge'] = {
          $regex: this.escapeRegex(q.howPecetKnowledge),
          $options: 'i',
        };
      }
      if (q.howCentralicedRepositories) {
        filter['howIsItStored.centralicedRepositories'] = {
          $regex: this.escapeRegex(q.howCentralicedRepositories),
          $options: 'i',
        };
      }

      // legalRegulations.* (regex i para flexibilidad)
      if (q.legalCopyright) {
        filter['legalRegulations.copyright'] = {
          $regex: this.escapeRegex(q.legalCopyright),
          $options: 'i',
        };
      }
      if (q.legalPatents) {
        filter['legalRegulations.patents'] = {
          $regex: this.escapeRegex(q.legalPatents),
          $options: 'i',
        };
      }
      if (q.legalTradeSecrets) {
        filter['legalRegulations.tradeSecrets'] = {
          $regex: this.escapeRegex(q.legalTradeSecrets),
          $options: 'i',
        };
      }
      if (q.legalIndustrialDesigns) {
        filter['legalRegulations.industrialDesigns'] = {
          $regex: this.escapeRegex(q.legalIndustrialDesigns),
          $options: 'i',
        };
      }
      if (q.legalBrands) {
        filter['legalRegulations.brands'] = {
          $regex: this.escapeRegex(q.legalBrands),
          $options: 'i',
        };
      }
      if (q.legalIndustrialIntellectualProperty) {
        filter['legalRegulations.industrialIntellectualProperty'] = {
          $regex: this.escapeRegex(q.legalIndustrialIntellectualProperty),
          $options: 'i',
        };
      }

      // Atajo: buscar en TODOS los subcampos legales
      const legalOrConditions: any[] = [];
      if (q.legalAny) {
        const rx = { $regex: this.escapeRegex(q.legalAny), $options: 'i' };
        legalOrConditions.push(
          { 'legalRegulations.copyright': rx },
          { 'legalRegulations.patents': rx },
          { 'legalRegulations.tradeSecrets': rx },
          { 'legalRegulations.industrialDesigns': rx },
          { 'legalRegulations.brands': rx },
          { 'legalRegulations.industrialIntellectualProperty': rx },
        );
      }

      // ===== Búsqueda global 'q' =====
      const searchOrConditions: any[] = [];
      if (q.q) {
        const r = { $regex: this.escapeRegex(q.q), $options: 'i' };
        searchOrConditions.push(
          { title: r },
          { description: r },
          { keywords: { $elemMatch: r } },
        );
      }

      // Combine all $or conditions with confidentiality filter
      const allOrConditions = [...legalOrConditions, ...searchOrConditions];

      if (allOrConditions.length > 0) {
        if (!isAdmin) {
          // For non-admin: (confidentiality filter) AND (search conditions)
          filter.$and = [
            {
              $or: [
                { confidentiality: false },
                { confidentiality: { $exists: false } },
              ],
            },
            { $or: allOrConditions },
          ];
          // Remove the initial $or set for confidentiality
          delete filter.$or;
        } else {
          // For admin: just apply search conditions
          filter.$or = allOrConditions;
        }
      }

      // (Fallback ultra-minimalista): si te llegan keys con notación de puntos
      // desde el front (y no usas whitelist estricto), mapéalas tal cual.
      for (const [k, v] of Object.entries(q as Record<string, any>)) {
        if (k.includes('.') && v !== undefined && v !== '') {
          // Ej: "legalRegulations.copyright=Creative Commons"
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          filter[k] = v;
        }
      }

      // Paginación y orden
      const page = Math.max(1, q.page || 1);
      const limit = Math.min(100, Math.max(1, q.limit || 20));
      const skip = (page - 1) * limit;
      const sort = this.parseSort(q.sort);

      const [items, total] = await Promise.all([
        this.assetModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
        this.assetModel.countDocuments(filter),
      ]);

      return { items, page, limit, total };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error fetching assets');
    }
  }

  async findOne(id: string, userRole?: string): Promise<Asset> {
    try {
      const asset = await this.assetModel.findOne({ id }).exec();
      if (!asset) throw new NotFoundException(`Asset with id ${id} not found`);

      // Check if user has permission to view confidential asset
      const isAdmin = userRole === 'administrador' || userRole === 'super_administrador';
      if (asset.confidentiality && !isAdmin) {
        throw new NotFoundException(`Asset with id ${id} not found`);
      }

      return asset;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error fetching asset');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.assetModel.findOneAndDelete({ id }).exec();
      if (!result) throw new NotFoundException(`Asset with id ${id} not found`);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error deleting asset');
    }
  }
}
