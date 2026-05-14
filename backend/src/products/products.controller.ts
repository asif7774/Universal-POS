import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards';
import { ProductsService } from './products.service';
import { IsString, IsNumber, IsBoolean, IsOptional, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';

class CreateProductDto {
  @IsString() sku!: string;
  @IsString() name!: string;
  @IsOptional() @IsString() description?: string;
  @IsEnum(['rental', 'sale', 'service']) type!: 'rental' | 'sale' | 'service';
  @IsString() category!: string;
  @IsOptional() @IsNumber() @Type(() => Number) @Min(0) salePrice?: number;
  @IsOptional() @IsNumber() @Type(() => Number) @Min(0) rentalRatePerDay?: number;
  @IsBoolean() taxable!: boolean;
  @IsBoolean() trackInventory!: boolean;
}

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(
    @Request() req: { user: { tenantId: string } },
    @Query('category') category?: string,
  ) {
    return this.productsService.findAll(req.user.tenantId, category);
  }

  @Get('categories')
  async getCategories(@Request() req: { user: { tenantId: string } }) {
    return this.productsService.getCategories(req.user.tenantId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.productsService.findById(id, req.user.tenantId);
  }

  @Post()
  async create(
    @Body() body: CreateProductDto,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.productsService.create({ ...body, tenantId: req.user.tenantId, isActive: true });
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<CreateProductDto>,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.productsService.update(id, req.user.tenantId, body);
  }

  @Delete(':id')
  async deactivate(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    const ok = await this.productsService.deactivate(id, req.user.tenantId);
    return { success: ok };
  }
}
