import { Request, Response } from 'express';
import { Reminder } from '../db/entity/Reminder';
import { User } from '../db/entity/User';

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
