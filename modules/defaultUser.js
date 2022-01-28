const defaultUser = {
    id: interaction.user.id,
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

  async function createNewUser(userData){
      const user = defaultUser;

      await userData.update(
        { id: interaction.user.id },
        { $set: user },
        { upsert: true }
      );

      return user;
  }

  module.exports = {defaultUser: defaultUser, createNewUser: createNewUser};