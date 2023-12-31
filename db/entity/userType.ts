import {
    Entity,
    Column,
    BaseEntity,
    PrimaryColumn,
    OneToMany
} from "typeorm";
import { User } from "./User.js";

@Entity()
export class UserType extends BaseEntity {
    @PrimaryColumn()
    id!: number;

    @OneToMany(() => User, (user: User) => user.type)
    users!: User[];

    @Column({ length: 15, })
    title!: string;

}