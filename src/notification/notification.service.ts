import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(destination: string, subject: string, text: string) {
    await this.mailerService.sendMail({
      to: destination,
      subject,
      text,
    });
  }
}
