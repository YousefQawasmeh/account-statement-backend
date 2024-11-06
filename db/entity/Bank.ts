import {
    Entity,
    Column,
    BaseEntity,
    OneToMany,
} from "typeorm";
import { Check } from "./Check.js";

@Entity()
export class Bank extends BaseEntity {
    @Column({ primary: true })
    id!: number;

    @Column()
    name!: string;

    @OneToMany(() => Check, (check: Check) => check.bank)
    checks!: Check[]

}
