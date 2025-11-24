import { Request, Response } from 'express';
import { Reminder } from '../db/entity/Reminder';
import { User } from '../db/entity/User';
import { In } from 'typeorm';
import { sendWhatsAppMsg_API } from '../services/whatsapp';

export const getReminders = async (req: Request, res: Response) => {
    try {
        const reminders = await Reminder.find();
        res.json(reminders);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

export const getReminder = async (req: Request, res: Response) => {
    try {
        const reminder = await Reminder.findOneBy({ id: parseInt(req.params.id) });
        if (!reminder) {
            return res.status(404).send("Reminder not found");
        }
        res.json(reminder);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

export const createReminder = async (req: Request, res: Response) => {
    try {
        const newReminder = new Reminder();
        if (!req.body.dueDate)
            res.status(400).send("Due date is required");
        if (!req.body.note)
            res.status(400).send("Note is required");

        newReminder.dueDate = new Date(req.body.dueDate);
        newReminder.note = req.body.note;

        if (req.body.user) {
            const user = await User.findOneBy({ id: req.body.user });
            if (user) {
                newReminder.user = user;
            }
        }
        const result = await newReminder.save();
        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

export const updateReminder = async (req: Request, res: Response) => {
    try {
        const reminder = await Reminder.findOneBy({ id: parseInt(req.params.id) });
        if (!reminder) {
            return res.status(404).send("Reminder not found");
        }
        Reminder.merge(reminder, req.body);
        const result = await Reminder.save(reminder);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

export const deleteReminder = async (req: Request, res: Response) => {
    try {
        const reminder = await Reminder.findOneBy({ id: parseInt(req.params.id) });
        if (!reminder) {
            return res.status(404).send("Reminder not found");
        }
        await Reminder.remove(reminder);
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

export const sendRemindersToOverdueUsers = async (overdueUsers: any[]) => {
    await sendWhatsAppMsg_API("0566252561", `starting sending overdue messages`);
    await sendWhatsAppMsg_API("0599252561", `starting sending overdue messages`);

    for (const u of overdueUsers) {
        const phone = u.phone;
        if (!phone) {
            try {
                await sendWhatsAppMsg_API("0566252561", `${u.name || ''} has overdue balance of ${u.total} but no phone number available.`);
                await sendWhatsAppMsg_API("0599252561", `${u.name || ''} has overdue balance of ${u.total} but no phone number available.`);
            }
            catch (err) {
                console.error('Failed sending overdue message to admin for user without phone', { name: u.name, userId: u.id, err });
            }
            continue; // skip users without phone

        }
        const msg = `السيد ${u.name || ''} المحترم، نود تذكيرك بضرورة الإسراع بتسديد المبلغ المستحق عليك لحساب سوبر ماركت أبو دعجان وقيمته ${u.total} ${u.currency || ''} شكرًا لتعاونكم معنا.`;
        try {
            await sendWhatsAppMsg_API(phone, msg);
            console.log(`Sent overdue message to ${phone}`);
        } catch (err) {
            console.error('Failed sending overdue message to', phone, err);
        }
    }

    await sendWhatsAppMsg_API("0566252561", `Sent overdue messages to ${overdueUsers.length} users.`);
    await sendWhatsAppMsg_API("0599252561", `Sent overdue messages to ${overdueUsers.length} users.`);
}
export const sendRemindersToOverdueUsersByIDs = async (req: Request, res: Response) => {
    const { usersIDs } = req.body;
    User.findBy({ id: In(usersIDs) })
        .then(users => {
            sendRemindersToOverdueUsers(users);
            console.log(`Sending reminders to users: ${users.map(u => u.id).join(", ")}`);
        })
        .catch(error => {
            console.error("Error fetching users for reminders:", error);
        });
}