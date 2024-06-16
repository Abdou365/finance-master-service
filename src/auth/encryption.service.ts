import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class Encryption {
  private saltRounds = 12;
  private salt = bcrypt.genSaltSync(this.saltRounds);

  encrypt(data: string): string {
    return bcrypt.hashSync(data, this.salt);
  }

  compare(data: string, encryptedData: string): boolean {
    return bcrypt.compareSync(data, encryptedData);
  }
}
