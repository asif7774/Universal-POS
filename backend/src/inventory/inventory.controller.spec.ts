import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../common/guards';
import { ExecutionContext } from '@nestjs/common';

describe('InventoryController', () => {
  let controller: InventoryController;
  let service: InventoryService;

  const mockInventoryService = {
    getInventory: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockResolvedValue({ id: 'p1' }),
    updateStock: vi.fn().mockResolvedValue({ success: true }),
    deleteItem: vi.fn().mockResolvedValue({ success: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        {
          provide: InventoryService,
          useValue: mockInventoryService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = { tenantId: 'test-tenant' };
          return true;
        },
      })
      .compile();

    controller = module.get<InventoryController>(InventoryController);
    service = module.get<InventoryService>(InventoryService);
  });

  it('should call update when PUT /inventory/:id is called', async () => {
    const body = { name: 'New Name' };
    await controller.update('p1', { user: { tenantId: 'test-tenant' } }, body);
    expect(service.update).toHaveBeenCalledWith('p1', 'test-tenant', body);
  });

  it('should call updateStock when PUT /inventory/:id/stock is called', async () => {
    const body = { sizes: { 'M': { total: 10, available: 10, out: 0 } } };
    await controller.updateStock('p1', { user: { tenantId: 'test-tenant' } }, body);
    expect(service.updateStock).toHaveBeenCalledWith('p1', 'test-tenant', body.sizes);
  });

  it('should call deleteItem when DELETE /inventory/:id is called', async () => {
    await controller.delete('p1', { user: { tenantId: 'test-tenant' } });
    expect(service.deleteItem).toHaveBeenCalledWith('p1', 'test-tenant');
  });
});
