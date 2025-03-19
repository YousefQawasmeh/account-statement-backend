import cron from 'node-cron';
import { Reminder } from '../db/entity/Reminder';
import { sendWhatsAppMsg_API } from './whatsapp';
import { getUsersWithMismatchedTotal } from '../controlers';

const sendReminders = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to midnight for accurate comparison

    const reminders = await Reminder.find();

    for (const reminder of reminders) {
        if (reminder.dueDate) {
            const reminderDate = new Date(reminder.dueDate);
            reminderDate.setHours(0, 0, 0, 0);

            if (reminderDate.getTime() === today.getTime()) {
                // await sendWhatsAppMsg_API(reminder.user.phone, reminder.note);
                await sendWhatsAppMsg_API("972566252561", reminder.note);
                await sendWhatsAppMsg_API("972599252561", reminder.note);
                // console.log(`Sent reminder to ${reminder.user.phone}`);
            }
        }
    }
}

const checkUsersWithMismatchedTotal = async () => {
    const usersWithMismatchedTotal = await getUsersWithMismatchedTotal();
    if (usersWithMismatchedTotal.length > 0) {
        // await sendWhatsAppMsg_API("972566252561", 'Users with mismatched total: ' + JSON.stringify(usersWithMismatchedTotal));
        await sendWhatsAppMsg_API("972566252561", `There are ${usersWithMismatchedTotal.length} Users with mismatched total`);
    }
}

const initializeRemindersCron = () => {

    // Runs every day at 6 AM
    cron.schedule('0 6 * * *', async () => {
        console.log('Running reminder cron job');
        try {
            await sendReminders();
            console.log('Reminder cron job finished');
        } catch (error) {
            console.error('Error running reminder cron job:', error);
        }
    });

    // Runs every day at 6 PM
    cron.schedule('0 18 * * *', async () => {
        console.log('Running reminder cron job');
        try {
            await sendReminders();
            console.log('Reminder cron job finished');
        } catch (error) {
            console.error('Error running reminder cron job:', error);
        }
    });

    // Runs every day at 6 PM
    cron.schedule('0 18 * * *', async () => {
        console.log('Running Check Users With Mismatched Total reminder cron job');
        try {
            await checkUsersWithMismatchedTotal();
            console.log('Check Users With Mismatched Total Reminder cron job finished');
        } catch (error) {
            console.error('Error running reminder cron job:', error);
        }
    });
}

export { initializeRemindersCron }