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

