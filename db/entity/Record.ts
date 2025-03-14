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
    JoinColumn,
    OneToMany
} from "typeorm";
import { User } from "./User.js";
import { RecordType } from "./RecordType.js";
import { Check } from "./Check.js";
import { Image } from "./Image.js";

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

    @UpdateDateColumn({ nullable: true, default: null })
    updatedAt!: Date;

    @DeleteDateColumn({ nullable: true, default: null })
    deletedAt!: Date;

    @Column("float", { default: 0 })
    amount!: number;

    @Column({ nullable: true, length: 256 })
    notes!: string;

    @OneToMany(() => Check, (check: Check) => check.fromRecord, { eager: true })
    checksFrom!: Check[];

    @OneToMany(() => Check, check => check.toRecord, { eager: true })
    checksTo!: Check[];

    @OneToMany(() => Image, image => image.record, { eager: true })
    images!: Image[];

    @BeforeInsert()
    async beforeInsert() {
        try {
            await this.updateTotal();
        } catch (err) {
            throw (err);
        }
    }

    @BeforeUpdate()
    async beforeUpdate() {
        try {
            const originalRecord = await Record.findOne({ where: { id: this.id }, relations: ['user'] });
            if (originalRecord) {
                await this.updateTotal(originalRecord);
            }
        } catch (err) {
            throw (err);
        }
    }

    private async updateTotal(previousRecord?: Record) {
        const saveNewUserTotal = async (user: User, total: number) => {
            user.total = total;
            await user.save();
        }

        const recordToUpdate: Record = previousRecord || this;
        const user = await User.findOne({ where: { id: recordToUpdate.user.id } });
        if (!user) {
            throw ("user not found");
        }

        if (!previousRecord) {
            await saveNewUserTotal(user, user.total + +this.amount);
            return;
        }

        if (previousRecord.deletedAt !== null) {
            throw ("it's not accepted to update a deleted record");
        }

        if (this.deletedAt !== null) {
            const recordChecksNotAvailable = await Check.find({ where: { available: false, fromRecord: { id: this.id } } });
            if (recordChecksNotAvailable.length > 0) {
                throw ("it's not accepted to delete a record with checks already assigned to another record");
            }

            this.deletedAt = new Date();
            await saveNewUserTotal(user, user.total - previousRecord.amount);
            await Check.createQueryBuilder()
                .update()
                .set({ toRecord: undefined })
                .where("toRecordId = :recordId", { recordId: this.id })
                .execute();
            await Check.createQueryBuilder()
                .update()
                .set({ deletedAt: new Date(), available: false })
                .where("fromRecordId = :recordId AND toRecordId IS NULL", { recordId: this.id })
                .execute();
            return;
        }

        if (previousRecord.amount !== +this.amount) {
            this.updatedAt = new Date();
            await saveNewUserTotal(user, user.total - (previousRecord?.amount) + (+this.amount));
            return;
        }
    }
}