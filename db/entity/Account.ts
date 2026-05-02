import {
    Entity,
    Column,
    BaseEntity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";

export enum AccountRole {
    ADMIN = "admin",
    EDITOR = "editor",
    VIEWER = "viewer",
}

@Entity()
export class Account extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ length: 50, nullable: false, unique: true })
    username!: string;

    @Column({ nullable: false })
    password!: string;

    @Column({
        type: "enum",
        enum: AccountRole,
        default: AccountRole.VIEWER,
    })
    role!: AccountRole;

    @Column({ default: true })
    active!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
