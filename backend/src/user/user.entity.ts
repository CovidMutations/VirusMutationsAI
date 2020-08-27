import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, BaseEntity} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserRO } from './user.dto';
import * as config from 'config';
const jwtConfig = config.get('jwt');


@Entity('user')
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created: Date;

  @Column({
    type: 'text',
    unique: true,
  })
  username: string;

  @Column({
    type: 'text',
    unique: true,
  })
  email: string;

  @Column('text')
  password: string;

  @Column('text')
  salt: string;


 toResponseObject(showToken: boolean = true): UserRO {
   const {id, created, username, email } = this;

   const responceObject: any = {id, created, username, email};

    // if (showToken) {
    //   responceObject.token = token;
    // }
   
    return responceObject;
  } 

   async comparePassword(attempt: string) {
    return await bcrypt.compare(attempt, this.password);
  }

  async validatePassword(pass: string): Promise<boolean> {
    return await bcrypt.compare(pass + (process.env.SECRET || jwtConfig.secret), this.password); ///hash === this.password;
  }
 
}
