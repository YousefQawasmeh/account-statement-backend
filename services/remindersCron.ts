import cron from 'node-cron';
import { Reminder } from '../db/entity/Reminder';
import { sendWhatsAppMsg_API } from './whatsapp';
import { getUsersWithMismatchedTotal, getOverdueUsersByDays, sendRemindersToOverdueUsers } from '../controlers';

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
    // here will find all users with mismatched total and send them a whatsapp message and also fix the total in the db
    console.log('Users with mismatched total:', usersWithMismatchedTotal);
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

    // Runs every day at 6:5 PM
    cron.schedule('5 18 * * *', async () => {
        console.log('Running Check Users With Mismatched Total reminder cron job');
        try {
            await checkUsersWithMismatchedTotal();
            console.log('Check Users With Mismatched Total Reminder cron job finished');
        } catch (error) {
            console.error('Error running reminder cron job:', error);
        }
    });

    // // Runs every month on the 5th at 11:00 - send WhatsApp to users overdue 35+ days
    // cron.schedule('0 11 5 * *', async () => {
    //     console.log('Running monthly overdue (35+ days) reminder cron job (5th of month)');
    //     try {
    //         const overdueUsers = await getOverdueUsersByDays(35);
    //         await sendRemindersToOverdueUsers(overdueUsers);
    //         console.log('Monthly overdue reminder cron job finished');
    //     } catch (error) {
    //         console.error('Error running monthly overdue reminder cron job:', error);
    //     }
    // });

    // // Runs every month on the 15th at 11:00 - send WhatsApp to users overdue 65+ days
    // cron.schedule('0 11 15 * *', async () => {
    //     console.log('Running monthly overdue (65+ days) reminder cron job (15th of month)');
    //     try {
    //         const overdueUsers = await getOverdueUsersByDays(65);
    //         await sendRemindersToOverdueUsers(overdueUsers);
    //         console.log('Monthly overdue reminder cron job finished');
    //     } catch (error) {
    //         console.error('Error running monthly overdue reminder cron job:', error);
    //     }
    // });

    // // Runs every month on the 25th at 11:00 - send WhatsApp to users overdue 95+ days
    // cron.schedule('0 11 25 * *', async () => {
    //     console.log('Running monthly overdue (95+ days) reminder cron job (25th of month)');
    //     try {
    //         const overdueUsers = await getOverdueUsersByDays(95);
    //         await sendRemindersToOverdueUsers(overdueUsers);
    //         console.log('Monthly overdue reminder cron job finished');
    //     } catch (error) {
    //         console.error('Error running monthly overdue reminder cron job:', error);
    //     }
    // });

}

export { initializeRemindersCron }