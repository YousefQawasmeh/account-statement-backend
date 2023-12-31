import {
    Entity,
    Column,
    BaseEntity,
    PrimaryColumn,
    OneToMany
} from "typeorm";
import { Record } from "./Record.js";

@Entity()
export class RecordType extends BaseEntity {
    @PrimaryColumn()
    id!: number;

    @OneToMany(() => Record, (record: Record) => record.type)
    records!: Record[];

    @Column({ length: 15, })
    title!: string;

}