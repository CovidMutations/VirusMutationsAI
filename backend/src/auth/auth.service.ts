import { Injectable, Logger, HttpException, HttpStatus, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { UserDTOFull } from '../user/user.dto';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from '../user/user.repository';
import { UserEntity } from '../user/user.entity';
import { MailService} from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import * as config from 'config';
import { OAuth2PasswordRequestDTO, Token, TokenPayload } from './auth.dto';
const jwtConfig = config.get('jwt');
const serverConfig = config.get('server');
const public_url = serverConfig.public_url;

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService');
  constructor(
    private readonly userRepository: UserRepository,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService
  ) { }

  
  async registration(authCredentalsDTO: UserDTOFull): Promise<void> {
     
    this.logger.verbose(`registration: ${JSON.stringify(authCredentalsDTO)}`);
    const {username, password, email} = authCredentalsDTO;

    const user = new UserEntity();
    user.username = username;
    user.salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(password + jwtConfig.secret, user.salt);
    user.email = email;
    user.active = false;
    user.verificationCode = Math.floor(Math.random() * 999999) + 100000;

    try {

     await user.save();
     this.sendCodeVerificationMail(user); 
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException({
          error: 'User already exist',
        });
      } else {
        throw new InternalServerErrorException();
      }
    }

  }

  async confirmCodeVerification(userId: string, code: string): Promise<void> {
    const _user = await this.userRepository.findOne({id: userId});
    if (!_user) {
      throw new HttpException(
        'User not found',
        HttpStatus.BAD_REQUEST,
      );
    }
    if(!_user.active && Number(code) == _user.verificationCode) {
      _user.active = true;
      _user.save();
    }
  }


  async sendCodeVerification(userId: string) {
    const _user = await this.userRepository.findOne({id: userId});
    if (!_user) {
      throw new HttpException(
        'User not found',
        HttpStatus.BAD_REQUEST,
      );
    }
    this.sendCodeVerificationMail(_user);
  }

  private async sendCodeVerificationMail(user: UserEntity) {
    await this.mailService.send({
      to: user.email,
      subject: 'VirusMutationsAI Verification code',
      html: `<p>Verify your account: <a href="${public_url}/auth/confirm-code-verification/${user.id}/${user.verificationCode}" style="color:#178bfe;font-weight:800">Follow this link</a><p>`
    });

  //   ` <table style="background:#fff;border-top-color:#2086e0;border-top-style:solid;border-top-width:2px;margin-top:46px;text-align:center;width:100%"><tbody>
  //   <tr><td style="color:#303030;font-size:20px;font-weight:400;padding-top:120px">Registration Verification Code</td></tr>
  //   <tr><td style="color:#178bfe;font-size:36px;font-weight:800">${user.verificationCode}</td></tr>
  //   <tr><td style="color:#303030;font-size:16px;font-weight:200;padding-top:30px">This code is used to verify your account:</td></tr>
  //   <tr><td style="border-bottom-color:#eee;border-bottom-style:solid;border-bottom-width:1px;color:#303030;font-size:16px;font-weight:400;padding-bottom:108px">
  //     <a href="mailto:${user.email}">${user.email}</a>
  //   </td></tr>
  //   <tr><td style="color:#9b9b9b;font-size:13px;font-weight:200;padding-top:20px">Please return to finish your registration</td></tr>
  // </tbody></table>
  // `

  }

  async login(loginCredentalsDTO: OAuth2PasswordRequestDTO): Promise<Token> {
    this.logger.verbose('login');

    const { username, password } = loginCredentalsDTO;
    const user = await this.userRepository.findOne({ email: username });
    if (!user || !(await user.validatePassword(password))) {
      throw new HttpException(
        'Invalid username/password',
        HttpStatus.BAD_REQUEST,
      );
    }

    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    return {
      access_token: this.jwtService.sign(payload),
      token_type: 'bearer',
    };
  }
}
