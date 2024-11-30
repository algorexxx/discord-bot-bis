const { getUser, updateUser } = require("../services/userService");

async function incrementMessageCount(message) {
  const user = await getUser(message.author.id);

  if (!user.textChannels) {
    user.textChannels = {};
  }

  user.textChannels[message.channelId] = (user.textChannels[message.channelId] || 0) + 1;

  await updateUser(user.id, user);
}

module.exports = incrementMessageCount;