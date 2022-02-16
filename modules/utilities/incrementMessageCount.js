const {getUser} = require("../services/userService");

async function incrementMessageCount(message, db) {
  const userData = db.get("users");
  const user = await getUser(message.author.id, userData);

  if (!user.textChannels){
    user.textChannels = {};
  }

  user.textChannels[message.channelId] = (user.textChannels[message.channelId] || 0) + 1;
  
  await userData.update(
    { id: message.author.id },
    { $set: user },
    { upsert: true }
  );
}

module.exports = incrementMessageCount;