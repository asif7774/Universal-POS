import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { db } from '../db';
import { orders, customers } from '../db/schema';

// Mock the DB
vi.mock('../db', () => ({
  db: {
    select: vi.fn(),
  },
}));

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrdersService],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findRecent', () => {
    it('should map Guest when customer is null', async () => {
      const mockDbResult = [
        {
          order: { id: '1', orderNo: 'ORD-1' },
          customer: null, // Left join result for Guest
        },
      ];

      const selectMock = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockDbResult),
      };

      (db.select as any).mockReturnValue(selectMock);

      const result = await service.findRecent('tenant-1', 5);

      expect(result[0].customerName).toBe('Guest');
      expect(result[0].id).toBe('1');
    });

    it('should map customer name when customer is present', async () => {
      const mockDbResult = [
        {
          order: { id: '2', orderNo: 'ORD-2' },
          customer: { firstName: 'John', lastName: 'Doe' },
        },
      ];

      const selectMock = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockDbResult),
      };

      (db.select as any).mockReturnValue(selectMock);

      const result = await service.findRecent('tenant-1', 5);

      expect(result[0].customerName).toBe('John Doe');
    });
  });
});
