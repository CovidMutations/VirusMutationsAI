import { EntityRepository, Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { UserEntity } from './user.entity';
import { UserRO } from './user.dto';


@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {
  logger = new Logger('UserRepository');

  async validateUserPassword(email: string, password: string): Promise<UserRO> {
    const user = await this.findOne({ email });
    this.logger.verbose(`validateUserPassword user: ${JSON.stringify(user)}`);

    if (user && await user.validatePassword(password)) {
      return new UserRO(user);
    } else {
      return null;
    }
  }
}
