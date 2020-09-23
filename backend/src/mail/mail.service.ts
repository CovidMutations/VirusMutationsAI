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
      clientId: mailConfig.clientId,
      clientSecret: mailConfig.clientSecret,
      // pass: mailConfig.pass,
    }
  });

  constructor() { 
    this.transporter.set('oauth2_provision_cb', (user, renew, callback)=>{
      this.logger.verbose(`oauth2_provision_cb: ${user}`);
      let accessToken = this.userTokens[user];
      if(!accessToken){
          return callback(new Error('Unknown user'));
      }else{
          return callback(null, accessToken);
      }
    });
    this.transporter.on('token', token => {
      this.logger.verbose(`token: ${token}`);

      this.userTokens = token;
      console.log('A new access token was generated');
      console.log('User: %s', token.user);
      console.log('Access Token: %s', token.accessToken);
      console.log('Expires: %s', new Date(token.expires));
    });

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
