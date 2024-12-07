const statsEmbed = require("../utilities/statsEmbed");
const { getUser } = require("../services/userService");
const settings = require('../../botSettings');

async function getStats(userName, message, client) {
  const guild = await client.guilds.fetch(settings.GUILD_ID);
  const userId = await getUserId(userName, message, guild);
  
  const user = await getUser(userId);
  if (!user) {
    message.channel.send("No stats for this user, maybe inactive.");
    return;
  }
  const discordUser = await guild.members.fetch(userId);
  return { embeds: [await statsEmbed(discordUser.displayName, discordUser.displayAvatarURL(), user, guild.channels)] };
}

async function getUserId(userName, message, guild) {
  if (userName) {
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
