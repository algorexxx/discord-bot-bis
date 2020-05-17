const statsEmbed = require("./statsEmbed");

async function stats(message, args, user, db, req, fs, client) {
  const userData = db.get("users");

  let stats_user;
  if (!args[1]) {
    stats_user = user;
  } else {
    let user_id = (
      await message.guild.members.fetch({ query: args[1], limit: 1 })
    )
      .keys()
      .next().value;

    if (!user_id) {
      message.channel.send("Invalid nickname plz try again.");
      return;
    }

    stats_user = await userData.findOne({ id: user_id });
    if (!stats_user) {
      message.channel.send("No stats for this user, maybe inactive.");
      return;
    }
  }

  message.channel.send(await statsEmbed(stats_user, client));
}

module.exports = stats;
