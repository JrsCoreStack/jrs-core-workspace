import { Controller, Get, Post, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SalesSyncService } from './sales-sync.service';
import { AuthGuard } from 'src/guards/auth.guard';

@ApiTags('Sincroniza��o de Vendas')
@ApiBearerAuth()
@Controller('sales-sync')
// @UseGuards(AuthGuard)
export class SalesSyncController {
  constructor(private readonly salesSyncService: SalesSyncService) {}

  @Post('sync')
  async forceSync(
    @Query('productId') productId?: string,
    @Query('referenceType') referenceType?: string,
  ) {
    await this.salesSyncService.forceSync(productId, referenceType);
    return {
      message: 'Sincronização iniciada manualmente',
      productId: productId || 'all',
      referenceType: referenceType || 'all',
    };
  }

  @Post('sync/:saleId')
  async syncSpecificSale(
    @Param('saleId') saleId: string,
    @Query('productId') productId: string,
    @Query('referenceType') referenceType: string,
  ) {
    const saleIdNumber = parseInt(saleId, 10);
    
    if (isNaN(saleIdNumber)) {
      return {
        success: false,
        message: 'saleId deve ser um número válido',
      };
    }

    if (!productId) {
      return {
        success: false,
        message: 'productId é obrigatório (ex: OTICKET_EVENTOS)',
      };
    }

    if (!referenceType) {
      return {
        success: false,
        message: 'referenceType é obrigatório (ex: TICKET_ONLINE_SALE)',
      };
    }

    const result = await this.salesSyncService.syncSpecificSale(
      saleIdNumber,
      productId,
      referenceType,
    );

    return result;
  }

  @Get('products')
  async getProducts() {
    const products = this.salesSyncService.getConfiguredProducts();
    return {
      products,
    };
  }

  @Get('status')
  async getStatus() {
    const status = await this.salesSyncService.getSyncStatus();
    return {
      status: 'ok',
      syncs: status,
    };
  }
}
