const { findOne, updateOne, getCollection } = require("./mongodbService");

const COLLECTION_NAME = "users";

const defaultUser = {
  gold: 1000,
  online_mins: 0,
  music_reqs: 0,
  music_skips: 0,
  music_stops: 0,
  eb_added: 0,
  eb_watched: 0,
  heb_added: 0,
  heb_watched: 0,
  coinflips_won: 0,
  coinflips_lost: 0,
  fun_added: 0,
  fun_watched: 0,
  blackjack_hands: 0,
  blackjack_wins: 0,
  blackjack_bjs: 0,
  blackjack_ties: 0,
  active: true,
};

async function createNewUser(userId) {
  const user = defaultUser;
  user.id = userId;

  await updateOneUser(userId, user);

  return user;
}

async function getUser(userId) {
  const user = await findOneUser(userId);
  if (user) {
    await updateOneUser(userId, { active: true });
    return user;
  }

  return await createNewUser(userId);
}

async function updateUser(userId, updatedUser) {
  await updateOneUser(userId, updatedUser);
}

async function incrementUser(userId, inc) {
  const collection = await getCollection(COLLECTION_NAME)
  await collection.updateOne({ id: userId }, { $inc: inc });
}

async function findOneUser(id) {
  return findOne({ id: id }, COLLECTION_NAME);
}

async function updateOneUser(id, set) {
  return updateOne({ id: id }, set, COLLECTION_NAME);
}

async function incrementMessageCount(userId, channelId) {
  const user = await getUser(userId);

  if (!user.textChannels) {
    user.textChannels = {};
  }

  user.textChannels[channelId] = (user.textChannels[channelId] || 0) + 1;

  await updateUser(user.id, user);
}

module.exports = {
  defaultUser: defaultUser,
  createNewUser: createNewUser,
  getUser: getUser,
  updateUser: updateUser,
  incrementUser: incrementUser,
  incrementMessageCount: incrementMessageCount
};