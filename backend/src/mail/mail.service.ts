import { Injectable, Logger} from '@nestjs/common';
import * as  nodemailer from 'nodemailer';
import { MailModel} from '../model/mail.dto';
import * as config from 'config';
const mailConfig = config.get('mail');

@Injectable()
export class MailService {
  private logger = new Logger('MailService');
  userTokens = '';
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: mailConfig.email,
      pass: mailConfig.pass,
    }
  });

  constructor() { 

  }

  send(mailOptions?: any) {

    let _mailOptions = new MailModel({
      from: mailConfig.email,
      subject: mailConfig.subject,
      ...mailOptions
    });
    console.log(_mailOptions)

    this.transporter.sendMail(_mailOptions, (error, info) =>{
      if (error) {
        this.logger.error(`${error}`);
      } else {
        this.logger.verbose(`Email sent: ${info.response}`);
      }
    });
  }

}
