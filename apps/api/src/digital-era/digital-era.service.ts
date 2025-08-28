import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateDigitalEraDto } from './dto/create-digital-era.dto';
import { UpdateDigitalEraDto } from './dto/update-digital-era.dto';

@Injectable()
export class DigitalEraService {
  constructor(private prisma: PrismaService) {}

  async create(createDigitalEraDto: CreateDigitalEraDto) {
    return this.prisma.digitalEra.create({
      data: createDigitalEraDto,
    });
  }

  async findAll() {
    return this.prisma.digitalEra.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  async findAllAdmin() {
    return this.prisma.digitalEra.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    return this.prisma.digitalEra.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateDigitalEraDto: UpdateDigitalEraDto) {
    return this.prisma.digitalEra.update({
      where: { id },
      data: updateDigitalEraDto,
    });
  }

  async remove(id: string) {
    return this.prisma.digitalEra.delete({
      where: { id },
    });
  }

  async reorder(ids: string[]) {
    const updates = ids.map((id, index) =>
      this.prisma.digitalEra.update({
        where: { id },
        data: { order: index + 1 },
      }),
    );

    await this.prisma.$transaction(updates);
    return { message: 'Reorder successful' };
  }

  async getStats() {
    const totalQuotes = await this.prisma.digitalEra.count();
    const activeQuotes = await this.prisma.digitalEra.count({
      where: { isActive: true },
    });

    return {
      totalQuotes,
      activeQuotes,
      inactiveQuotes: totalQuotes - activeQuotes,
    };
  }
}
