const { MessageEmbed } = require('discord.js');

function statsEmbed(statsUserName, statsUserAvatarUrl, user) {
    return new MessageEmbed()
      .setColor('#57A500')
      .setTitle(statsUserName + "'s stats")
      .setAuthor({ name: "Stats machine <3", iconURL: "http://files.softicons.com/download/system-icons/phuzion-icons-by-kyo-tux/png/256/Stats.png" })
      .setDescription("Gold: " + user.gold + "\nHours in voicechat: " + Math.round((user.online_mins / 60 + 0.00001) * 100) / 100)
      .setThumbnail(statsUserAvatarUrl)
      .addFields(
        { name: "Eyebleach", value: "Eyebleach added: " + user.eb_added + "\nEyebleach watched: " + user.eb_watched + "\nHot eyebleach added: " + user.heb_added + "\nHot eyebleach watched: " + user.heb_watched, inline: false },
        { name: 'Music', value: "Music requests: " + user.music_reqs + "\nMusic skips: " + user.music_skips + "\nMusic stops: " + user.music_stops, inline: false },
        { name: 'Gambling', value: "Coinflip wins: " + user.coinflips_won + " of " + Math.round(user.coinflips_won + user.coinflips_lost) + " (" + Math.round((user.coinflips_won * 100)/(user.coinflips_won + user.coinflips_lost)) + "%)\nBlackjack wins: " + user.blackjack_wins + " of " + user.blackjack_hands + " (" + Math.round((user.blackjack_wins * 100) / user.blackjack_hands) + "%)\nBlackjacks: " + user.blackjack_bjs, inline: false },
        { name: 'Mixed', value: "Fun added: " + user.fun_added + "\nFun watched: " + user.fun_watched, inline: false },
    );
}

module.exports = statsEmbed;
