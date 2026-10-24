import {
    Entity,
    Column,
    BaseEntity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";

export enum EmployeeRole {
    ADMIN = "admin",
    EDITOR = "editor",
    VIEWER = "viewer",
}

@Entity()
export class Employee extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ length: 50, nullable: false, unique: true })
    username!: string;

    @Column({ nullable: false })
    password!: string;

    @Column({
        type: "enum",
        enum: EmployeeRole,
        default: EmployeeRole.VIEWER,
    })
    role!: EmployeeRole;

    @Column({ default: true })
    active!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
