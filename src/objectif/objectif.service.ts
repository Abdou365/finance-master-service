import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { groupBy, partition, sumBy } from 'lodash';
import { UpdateObjcetifDto } from './dto/update-objcetif.dto';
import { computeObjectif } from './objectif.utils';

@Injectable()
export class ObjectifService {
  private objeectif = new PrismaClient().objectif;
  private db = new PrismaClient();

  async create(upsertData: Prisma.ObjectifUpsertArgs) {
    const res = await this.objeectif.upsert(upsertData);
    return res;
  }

  async findAll(where: Prisma.ObjectifWhereInput) {
    const rawObjectifs = await this.objeectif.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { title: 'asc' }],
    });

    if (rawObjectifs.length === 0) {
      return [];
    }

    const items = await this.db.item.findMany({
      where: { status: 'published', accountId: rawObjectifs[0].accountId },
      select: {
        id: true,
        category: true,
        value: true,
        date: true,
        isExpense: true,
      },
    });

    const objectifs = computeObjectif(rawObjectifs, items);
    const [completed, opened] = partition(
      objectifs,
      (objectif) => objectif.progress === 100,
    );

    return {
      objectifs,
      summary: {
        completed: completed.length,
        opened: opened.length,
        total: objectifs.length,
        progress: sumBy(objectifs, 'progress') / (objectifs.length || 1),
      },
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} objcetif`;
  }

  update(id: number, updateObjcetifDto: UpdateObjcetifDto) {
    return `This action updates a #${id} objcetif`;
  }

  remove(id: number) {
    return `This action removes a #${id} objcetif`;
  }
}
