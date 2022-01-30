const {getUser} = require("../services/userService");

async function statsUpdate(db, client) {
  const userData = db.get("users");

  const guild = await client.guilds.fetch("426479768947654659");
  const members = await guild.members.fetch();

  const memberIds = Array.from(members.keys());

  for (let i = 0; i<memberIds.length; i++){
    const member = members.get(memberIds[i]);
    const user = await getUser(member.user.id, userData);

    if (user.active) {
      user.gold += 10;
      user.active = false;
    }

    if (member.voice.channel) {
      if (member.voice.channelID != "436459953570578432") {
        console.log(user.id + " -  was given 20 for being in voice chat.");
        user.gold += 20;
        user.online_mins += 3;
      }
    }

    await userData.update(
      { id: member.user.id },
      { $set: user },
      { upsert: true }
    );
  }
}

module.exports = statsUpdate;
