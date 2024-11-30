const statsEmbed = require("../utilities/statsEmbed");
const { getUser } = require("../services/userService");

async function stats(userName, user, client) {
  const guild = await client.guilds.fetch("426479768947654659");
  let stats_user;
  let dUser;
  if (!userName) {
    stats_user = user;
    dUser = await guild.members.fetch(user.id);
  } else {
    const users = await guild.members.fetch({ query: userName, limit: 1 });
    dUser = users.first();
    const userId = users.keys().next().value;

    if (!userId) {
      message.channel.send("Invalid nickname plz try again.");
      return;
    }

    stats_user = await getUser(userId);
    if (!stats_user) {
      message.channel.send("No stats for this user, maybe inactive.");
      return;
    }
  }

  return { embeds: [await statsEmbed(dUser.displayName, dUser.displayAvatarURL(), stats_user, guild.channels)] };
}

module.exports = stats;
