import { Test, TestingModule } from '@nestjs/testing';
import { RentalsController } from './rentals.controller';
import { RentalsService } from './rentals.service';
import { JwtAuthGuard } from '../common/guards';
import { ExecutionContext } from '@nestjs/common';

describe('RentalsController', () => {
  let controller: RentalsController;
  let service: RentalsService;

  const mockRentalsService = {
    findUpcoming: vi.fn().mockResolvedValue([{ id: '1', status: 'booked' }]),
    findById: vi.fn().mockResolvedValue({ id: '1', status: 'booked' }),
    findAll: vi.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RentalsController],
      providers: [
        {
          provide: RentalsService,
          useValue: mockRentalsService,
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

    controller = module.get<RentalsController>(RentalsController);
    service = module.get<RentalsService>(RentalsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call findUpcoming when GET /upcoming is called', async () => {
    const req = { user: { tenantId: 'test-tenant' } };
    const result = await controller.findUpcoming(req, '3');
    expect(service.findUpcoming).toHaveBeenCalledWith('test-tenant', 3);
    expect(result).toEqual([{ id: '1', status: 'booked' }]);
  });

  it('should call findById when GET /:id is called', async () => {
    const req = { user: { tenantId: 'test-tenant' } };
    const result = await controller.findOne('123', req);
    expect(service.findById).toHaveBeenCalledWith('123', 'test-tenant');
    expect(result).toEqual({ id: '1', status: 'booked' });
  });
});
