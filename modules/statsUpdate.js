async function statsUpdate(db, req, fs, client) {
  const userData = db.get("users");

  // Runs every 3 minutes 20 gold
  client.guilds.cache
    .get("426479768947654659")
    .members.cache.forEach(async function (member) {
      let mem = await userData.findOne({ id: member.user.id });
      if (!mem) {
        mem = {
          id: member.user.id,
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
          active: false,
        };
      }

      if (mem.active) {
        mem.gold += 10;
        mem.active = false;
      }

      if (member.voice.channel) {
        if (member.voice.channelID != "436459953570578432") {
          console.log(mem.id + " -  was given 20 for being in voice chat.");
          mem.gold += 20;
          mem.online_mins += 3;
        }
      }

      await userData.update(
        { id: member.user.id },
        { $set: mem },
        { upsert: true }
      );
    });
}

module.exports = statsUpdate;
