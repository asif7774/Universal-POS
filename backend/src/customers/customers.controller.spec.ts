import { Test, TestingModule } from '@nestjs/testing';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../common/guards';
import { ExecutionContext } from '@nestjs/common';

describe('CustomersController', () => {
  let controller: CustomersController;
  let service: CustomersService;

  const mockCustomersService = {
    updateMeasurement: vi.fn().mockResolvedValue({ id: 'm1', customerId: 'c1' }),
    deleteMeasurement: vi.fn().mockResolvedValue(undefined),
    saveMeasurement: vi.fn().mockResolvedValue({ id: 'm1' }),
    findAll: vi.fn().mockResolvedValue([]),
    findById: vi.fn().mockResolvedValue({ id: 'c1' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        {
          provide: CustomersService,
          useValue: mockCustomersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = { tenantId: 'test-tenant', id: 'u1' };
          return true;
        },
      })
      .compile();

    controller = module.get<CustomersController>(CustomersController);
    service = module.get<CustomersService>(CustomersService);
  });

  it('should call updateMeasurement when PUT /customers/:id/measurements/:mid is called', async () => {
    const req = { user: { tenantId: 'test-tenant' } };
    const body = { chest: '40' };
    const result = await controller.updateMeasurement('c1', 'm1', req, body);
    expect(service.updateMeasurement).toHaveBeenCalledWith('m1', 'c1', 'test-tenant', body);
    expect(result).toEqual({ id: 'm1', customerId: 'c1' });
  });

  it('should call deleteMeasurement when DELETE /customers/:id/measurements/:mid is called', async () => {
    const req = { user: { tenantId: 'test-tenant' } };
    await controller.deleteMeasurement('c1', 'm1', req);
    expect(service.deleteMeasurement).toHaveBeenCalledWith('m1', 'c1', 'test-tenant');
  });
});
