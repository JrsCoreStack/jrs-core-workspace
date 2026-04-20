import { Controller, Get, Post, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiExcludeController } from '@nestjs/swagger';
import { SalesSyncService } from './sales-sync.service';
import { AuthGuard } from 'src/guards/auth.guard';

@ApiExcludeController()
@ApiTags('Sincronizaùùo de Vendas')
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
      message: 'SincronizaÁ„o iniciada manualmente',
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
        message: 'saleId deve ser um n˙mero v·lido',
      };
    }

    if (!productId) {
      return {
        success: false,
        message: 'productId È obrigatÛrio (ex: OTICKET_EVENTOS)',
      };
    }

    if (!referenceType) {
      return {
        success: false,
        message: 'referenceType È obrigatÛrio (ex: TICKET_ONLINE_SALE)',
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
