import { User } from '../db/entity/User.js';


export const getUsersWithMismatchedTotal = async () => {
  const usersWithMismatchedTotal = await User.createQueryBuilder('user')
    .innerJoin('user.records', 'record')
    .select('user.id, user.cardId, user.name, user.subName, user.total, SUM(record.amount) as totalRecordsAmount')
    .groupBy('user.id')
    .having('SUM(record.amount) <> user.total')
    .getRawMany();

  return usersWithMismatchedTotal
}


export const getOverdueUsersByDays = async (days: number) => {
    // Find users with total > 0 whose latest record date is older than X days
    const threshold = new Date();
    threshold.setHours(0, 0, 0, 0);
    threshold.setDate(threshold.getDate() - days);

    const overdueUsers = await User.createQueryBuilder('user')
        .leftJoin('user.records', 'record', 'record.amount < 0') // نربط فقط سجلات الدفعات
        .select('user.id', 'id')
        .addSelect('user.name', 'name')
        .addSelect('user.phone', 'phone')
        .addSelect('user.total', 'total')
        .addSelect('user.currency', 'currency')
        .addSelect('MAX(record.date)', 'lastPaymentDate')
        .where('user.total > 0') // شرط وجود ذمة
        .groupBy('user.id')
        .addGroupBy('user.name')
        .addGroupBy('user.phone')
        .addGroupBy('user.total')
        .having('MAX(record.date) IS NULL') // ما دفع ولا مرة
        .orHaving('MAX(record.date) <= :threshold', { threshold: threshold.toISOString() }) // آخر دفعة قبل 35 يوم
        .getRawMany();

    return overdueUsers;
}