import {
    Entity,
    Column,
    BaseEntity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    JoinColumn,
} from "typeorm";
import { Record } from "./Record.js";
import { Check } from "./Check.js";

@Entity()
export class Image extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    path!: string;

    @Column()
    name!: string;

    @ManyToOne(() => Record, record => record.images, { nullable: true })
    @JoinColumn({ name: "recordId" })
    record!: Record;

    @ManyToOne(() => Check, check => check.images, { nullable: true })
    @JoinColumn({ name: "checkId" })
    check!: Check;

    @UpdateDateColumn({ nullable: true, default: null })
    updatedAt!: Date;

    @DeleteDateColumn({ nullable: true, default: null })
    deletedAt!: Date;
}