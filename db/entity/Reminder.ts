import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, BaseEntity } from "typeorm"
import { User } from "./User"

@Entity()
export class Reminder extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ nullable: true })
    note!: string

    @Column()
    dueDate!: Date

    @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP()' })
    createdAt!: Date;

    @ManyToOne(() => User, user => user.reminders, { eager: true })
    user!: User

}
