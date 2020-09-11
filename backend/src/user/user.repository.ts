import { EntityRepository, Repository } from 'typeorm';
import { ConflictException, InternalServerErrorException, Logger, HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserEntity } from './user.entity';
import { UserDTOFull, UserDTO, UserRO } from './user.dto';


@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {
  logger = new Logger('UserRepository');


  async validateUserPassword(authCredentalsDTO: UserDTO): Promise<UserRO> {
    this.logger.verbose(`validateUserPassword: ${JSON.stringify(authCredentalsDTO)}`);
    const {email, password} = authCredentalsDTO;

    const user = await this.findOne({ email });
    this.logger.verbose(`validateUserPassword user: ${JSON.stringify(user)}`);

    if (user && await user.validatePassword(password)) {
      return new UserRO(user);
    } else {
      return null;
    }

  }

  


}
