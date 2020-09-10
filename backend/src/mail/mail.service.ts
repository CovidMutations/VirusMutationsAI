import { Injectable, Logger} from '@nestjs/common';
import * as  nodemailer from 'nodemailer';
import { MailModel} from '../model/mail.dto';
import * as config from 'config';
const mailConfig = config.get('mail');

@Injectable()
export class MailService {
  private logger = new Logger('MailService');

  transporter = nodemailer.createTransport({
    service: mailConfig.service,
    auth: {
      user: mailConfig.email,
      pass: mailConfig.pass
    }
  });

  constructor() { }

  send(mailOptions?: any) {

    let _mailOptions = new MailModel({
      from: mailConfig.email,
      subject: mailConfig.subject,
      ...mailOptions
    });

    this.transporter.sendMail(_mailOptions, (error, info) =>{
      if (error) {
        this.logger.error(`Error: ${error}`);
      } else {
        this.logger.verbose(`Email sent: ${info.response}`);
      }
    });
  }

}
