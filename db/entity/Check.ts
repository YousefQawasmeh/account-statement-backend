import {
    Entity,
    Column,
    BaseEntity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    JoinColumn,
    OneToMany,
} from "typeorm";
import { Record } from "./Record.js";
import { Bank } from "./Bank.js";
import { Image } from "./Image.js";

@Entity()
export class Check extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    checkNumber!: string;

    @Column()
    amount!: number;

    @ManyToOne(() => Record, record => record.checksFrom, { nullable: true })
    @JoinColumn({ name: "fromRecordId" })
    fromRecord!: Record;

    @ManyToOne(() => Record, record => record.checksTo, { nullable: true })
    @JoinColumn({ name: "toRecordId" })
    toRecord!: Record;

    @ManyToOne(() => Bank, bank => bank.checks, { eager: true })
    bank!: Bank;

    @Column({ default: true })
    available!: boolean;

    @Column()
    dueDate!: Date

    @Column({ nullable: true, length: 256 })
    notes!: string

    @Column({
        type: "enum",
        enum: ["شيكل", "دينار", "دولار"],
        default: "شيكل"
    })
    currency!: string;

    @OneToMany(() => Image, image => image.check, { eager: true })
    images!: Image[]

    @UpdateDateColumn({ nullable: true, default: null })
    updatedAt!: Date;

    @DeleteDateColumn({ nullable: true, default: null })
    deletedAt!: Date;
}
