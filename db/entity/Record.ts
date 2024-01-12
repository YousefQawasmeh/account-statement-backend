import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    BaseEntity,
    CreateDateColumn,
    ManyToOne,
    UpdateDateColumn,
    DeleteDateColumn,
    BeforeInsert,
    BeforeUpdate,
    JoinColumn
} from "typeorm";
import { User } from "./User.js";
import { RecordType } from "./RecordType.js";

@Entity()
export class Record extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User, user => user.records)
    @JoinColumn({ name: 'userId' })
    user!: User;

    @ManyToOne(() => RecordType, type => type.records)
    @JoinColumn({ name: 'typeId' })
    type!: RecordType;

    @Column({ default: () => "CURRENT_TIMESTAMP()" })
    date!: Date;

    @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP()' })
    createdAt!: Date;

    @UpdateDateColumn({ default: () => 'CURRENT_TIMESTAMP()' })
    updatedAt!: Date;

    @DeleteDateColumn({ nullable: true, default: null })
    deletedAt!: Date;

    @Column({ default: false })
    isDeleted!: boolean;

    @Column("float", { default: 0 })
    amount!: number;

    @Column({ nullable: true, length: 256 })
    notes!: string;

    @BeforeInsert()
    async beforeInsert() {
        try {
            await this.updateTotal();
        }
        catch (err) {
            throw (err);
        }
    }

    @BeforeUpdate()
    async beforeUpdate() {
        try {
            const originalRecord = await Record.findOne({ where: { id: this.id } });
            if (originalRecord) {
                await this.updateTotal(originalRecord);
            }
        }
        catch (err) {
            throw (err);
        }
    }

    private async updateTotal(previousRecord?: Record) {
        const recordToUpdate: Record = previousRecord || this;
        const user = await User.findOne({ where: { id: recordToUpdate.user.id } });
        if (user) {
            user.total = user.total - (previousRecord?.amount || 0) + recordToUpdate.amount;
            await user.save();
        }
    }
}