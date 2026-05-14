import { Injectable } from '@nestjs/common';
import { db } from '../db';
import { users } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export type UserRole = 'owner' | 'manager' | 'cashier';

export interface User {
  id: string;
  tenantId: string;
  storeId: string | null;
  name: string;
  email: string;
  passwordHash: string;
  pinHash: string | null;
  role: string;
  isActive: boolean;
  createdAt: Date;
}

@Injectable()
export class UsersService {
  async findByEmail(email: string): Promise<User | undefined> {
    const res = await db.select().from(users).where(and(eq(users.email, email.toLowerCase()), eq(users.isActive, true))).limit(1);
    return res[0] as User | undefined;
  }

  async findByPin(pin: string): Promise<User | undefined> {
    const res = await db.select().from(users).where(and(eq(users.pinHash, pin), eq(users.isActive, true))).limit(1);
    return res[0] as User | undefined;
  }

  async findById(id: string): Promise<Omit<User, 'passwordHash' | 'pinHash'> | undefined> {
    const res = await db.select().from(users).where(eq(users.id, id)).limit(1);
    const user = res[0] as User | undefined;
    if (!user) return undefined;
    const { passwordHash: _pw, pinHash: _pin, ...safe } = user;
    return safe;
  }

  async findAllByTenant(tenantId: string): Promise<Omit<User, 'passwordHash' | 'pinHash'>[]> {
    const res = await db.select().from(users).where(eq(users.tenantId, tenantId));
    return res.map(({ passwordHash: _pw, pinHash: _pin, ...u }) => u as Omit<User, 'passwordHash' | 'pinHash'>);
  }
}
