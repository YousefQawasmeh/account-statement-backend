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

    @UpdateDateColumn({ nullable: true, default: null })
    updatedAt!: Date;

    @DeleteDateColumn({ nullable: true, default: null })
    deletedAt!: Date;

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
            const originalRecord = await Record.findOne({ where: { id: this.id }, relations: ['user'] });
            if (originalRecord) {
                await this.updateTotal(originalRecord);
            }
        }
        catch (err) {
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

        if(!previousRecord) {
            saveNewUserTotal(user, user.total + +this.amount);
            return;
        }

        if(previousRecord.deletedAt !== null) {
            throw ("it's not accepted to update a deleted record");
        }

        if(this.deletedAt !== null) {
            this.deletedAt = new Date();
            saveNewUserTotal(user, user.total - previousRecord.amount);
            return;
        }

        if (previousRecord.amount !== +this.amount){
            this.updatedAt = new Date();
            saveNewUserTotal(user, user.total - (previousRecord?.amount) + (+this.amount));
            return;
        }
    }
    
}