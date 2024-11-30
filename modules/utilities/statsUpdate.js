const {getUser, updateUser} = require("../services/userService");
const inactivityVoiceChannelId = "436459953570578432";

async function statsUpdate(client) {
  const guild = await client.guilds.fetch("426479768947654659");
  const members = await guild.members.fetch();

  const memberIds = Array.from(members.keys());

  for (let i = 0; i<memberIds.length; i++){
    const member = members.get(memberIds[i]);
    const user = await getUser(member.user.id);
    const currentVoiceChannelId = member.voice.channelId;

    if (user.active) {
      user.gold += 10;
      user.active = false;
    }

    if (member.voice.channel) {
      if (currentVoiceChannelId != inactivityVoiceChannelId) {
        console.log(user.id + " -  was given 20 gold for being in voice chat.");
        user.gold += 20;
        user.online_mins += 3;
        if (!user.voiceChannels){
          user.voiceChannels = {};
        }
        user.voiceChannels[currentVoiceChannelId] = (user.voiceChannels[currentVoiceChannelId] || 0) + 3;
      }
    }
    
    await updateUser(user.id, user);
  }
}

module.exports = statsUpdate;
