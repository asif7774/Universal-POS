import { Module } from '@nestjs/common';
import { ReturnsController } from './returns.controller';

@Module({ controllers: [ReturnsController] })
export class ReturnsModule {}