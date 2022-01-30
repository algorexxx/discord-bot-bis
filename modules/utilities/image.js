const { MessageEmbed } = require('discord.js');

async function imageEmbed(image, owner, category, iconurl) {
  return new MessageEmbed()
    .setColor('#D0021B')
    .setAuthor({ name: category, iconURL: iconurl })
    .setDescription("")
    .setImage(image.url)
    .setFooter({ text: "ID: " + image.id + " | Added by: " + owner, iconURL: iconurl });
}

module.exports = imageEmbed;
