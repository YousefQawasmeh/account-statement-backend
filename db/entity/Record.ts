import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    BaseEntity,
    CreateDateColumn,
    ManyToOne,
    UpdateDateColumn,
    DeleteDateColumn
} from "typeorm";
import { User } from "./User.js";
import { RecordType } from "./RecordType.js";

@Entity()
export class Record extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User, user => user.records,
        {
            eager: false,
            onDelete: 'CASCADE', // SET NULL// RESTRICT
            onUpdate: 'CASCADE'
        }
    )
    user!: string;

    @ManyToOne(() => RecordType, type => type.records,
        {
            eager: false,
            onDelete: 'CASCADE', // SET NULL// RESTRICT
            onUpdate: 'CASCADE'
        }
    )
    type!: string;

    // @Column({ length: 50, })
    // title!: string;

    @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP()" })
    date!: Date;

    @CreateDateColumn({
        type: 'timestamp',
        default: () => "CURRENT_TIMESTAMP()"
    })
    createdAt!: Date;

    @UpdateDateColumn({
        type: 'timestamp',
        default: () => "CURRENT_TIMESTAMP()"
    })
    UpdatedAt!: Date;

    @DeleteDateColumn({
        type: 'timestamp',
        default: () => "CURRENT_TIMESTAMP()"
    })
    DeletedAt!: Date;

    @Column({ default: false })
    isDeleted!: boolean;

    @Column({ default: 0 })
    amount!: number;

    @Column({ nullable: true, length: 256 })
    notes!: string;

}