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
    .leftJoin('user.records', 'record')
    .select('user.id', 'id')
    .addSelect('user.name', 'name')
    .addSelect('user.phone', 'phone')
    .addSelect('user.phone2', 'phone2')
    .addSelect('user.total', 'total')
    .addSelect('user.currency', 'currency')
    .addSelect('MAX(CASE WHEN record.amount < 0 THEN record.date END)', 'lastPaymentDate')
    .addSelect('MAX(CASE WHEN record.amount > 0 THEN record.date END)', 'lastPurchaseDate')
    .where('user.total > 0')
    .andWhere('user.typeId = 1') // الزبائن فقط بدون التجار
    .groupBy('user.id')
    .having(`(
      MAX(CASE WHEN record.amount < 0 THEN record.date END) IS NULL
      OR MAX(CASE WHEN record.amount < 0 THEN record.date END) <= NOW() - INTERVAL '${days} days'
  )`)
    .andHaving(`MAX(CASE WHEN record.amount > 0 THEN record.date END) <= NOW() - INTERVAL '${days} days'`)
    .getRawMany();

  return overdueUsers;
}