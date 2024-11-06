import {
    Entity,
    Column,
    BaseEntity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    DeleteDateColumn,
} from "typeorm";
import { Record } from "./Record.js";
import { Bank } from "./Bank.js";

@Entity()
export class Check extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    checkNumber!: string;

    @Column()
    amount!: number;

    @ManyToOne(() => Record, record => record.checks)
    record!: Record;

    @ManyToOne(() => Bank, bank => bank.checks, { eager: true })
    bank!: Bank;

    @Column({ default: true })
    available!: boolean;
    
    @Column()
    dueDate!: Date

    @Column( { nullable: true, length: 256 })
    notes!: string

    @UpdateDateColumn({ nullable: true, default: null })
    updatedAt!: Date;

    @DeleteDateColumn({ nullable: true, default: null })
    deletedAt!: Date;
}
