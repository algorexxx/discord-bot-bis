const statsEmbed = require("../utilities/statsEmbed");
const { getUser } = require("../services/userService");
const settings = require('../../botSettings');

async function getStats(userName, message, client) {
  const guild = await client.guilds.fetch(settings.GUILD_ID);
  const userId = getUserId(userName, message);
  const user = await getUser(userId);
    if (!user) {
      message.channel.send("No stats for this user, maybe inactive.");
      return;
    }

  return { embeds: [await statsEmbed(dUser.displayName, dUser.displayAvatarURL(), stats_user, guild.channels)] };
}

async function getUserId(userName, message){
  if (userName){
    const users = await guild.members.fetch({ query: userName, limit: 1 });
    const userId = users.keys().next().value;

    if (!userId) {
      message.channel.send("Invalid nickname plz try again.");
      return;
    }

    return userId;
  }

  return message.author.id;
}

module.exports = getStats;
