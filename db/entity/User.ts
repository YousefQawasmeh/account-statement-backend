import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Record } from "./Record.js";
import { UserType } from "./UserType.js";


@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ nullable: false, unique: true })
    cardId!: number;

    @Column({ length: 70, nullable: false })
    name!: string;
    
    @Column({ length: 70, nullable: true })
    subName!: string;

    @Column({ length: 20, nullable: true })
    phone!: string;

    @Column({ length: 512, nullable: true })
    notes!: string;

    // @Column({ length: 50, nullable: false })
    // password!: string;

    @Column()
    active: boolean = true;

    @Column({ default: 0 })
    limit!: number;

    @Column( "float" , { default: 0 })
    total!: number;

    @OneToMany(() => Record, (record: Record) => record.user)
    records!: Record[];

    @ManyToOne(() => UserType, type => type.users,
        {
            eager: true,
            onDelete: 'CASCADE', // SET NULL// RESTRICT
            onUpdate: 'CASCADE'
        }
    )
    type!: UserType;

}