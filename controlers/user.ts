import { User } from '../db/entity/User.js';
export const getNewCardId = async (cardType: number) => {
  const minCardId = 10000 * cardType;
  const maxCardId = await User.maximum('cardId', {
    type: { id: cardType }
  });

  return (maxCardId && maxCardId > minCardId ? maxCardId : minCardId) + 1;
}

export const getAllUsers = async () => {
  const users = await User.find();
  return users
}

export const getUser = async (findOneBy: { cardId: number } | { id: string }) => {
  const user = await User.findOne({ where: { ...findOneBy }, relations: ['records', 'type'] });
  return user
}

export const updateUser = async (findOneBy: { cardId: number } | { id: string }, data: any) => {
  try {
    const user = await User.findOneBy(findOneBy);
    if (user) {
      if (data.name !== undefined) user.name = data.name;
      if (data.subName !== undefined) user.subName = data.subName;
      if (data.phone !== undefined) user.phone = data.phone;
      if (data.phone2 !== undefined) user.phone2 = data.phone2;
      if (data.notes !== undefined) user.notes = data.notes;
      if (data.active !== undefined) user.active = data.active;
      if (data.limit !== undefined) user.limit = data.limit;
      // if (data.type !== undefined) {
      //   const userType = await UserType.findOneBy({ id: data.type });
      //   user.type = userType
      // };
      return user.save();
    }
  }
  catch (error) {
    console.error(error);
    throw ("Something went wrong, " + error);
  }
  return null
}

export const createUser = async (data: any) => {
  try {
    const newCardId = await getNewCardId(data.type);
    const newUser = new User();
    newUser.name = data.name;
    newUser.subName = data.subName;
    newUser.phone = data.phone;
    newUser.phone2 = data.phone2;
    newUser.notes = data.notes;
    newUser.cardId = newCardId;
    // newUser.cardId = data.cardId;
    newUser.active = !!data.active;
    newUser.limit = data.limit;
    newUser.type = data.type;
    newUser.currency = data.currency;

    return newUser.save()
  } catch (error) {
    console.error(error);
    throw ("Something went wrong, " + error);
  }
}

export default { createUser, getNewCardId }