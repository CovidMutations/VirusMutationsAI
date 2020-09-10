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

  @Column('text')
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


  async validatePassword(pass: string): Promise<boolean> {
    console.log(pass, this.password)
    return await bcrypt.compare(pass + jwtConfig.secret, this.password); ///hash === this.password;
  }
 
}
