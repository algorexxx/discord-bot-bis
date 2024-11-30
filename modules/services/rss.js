const Parser = require("rss-parser");
const { MessageEmbed } = require('discord.js');
const { findAll, getCollection } = require("./mongodbService");

const COLLECTION_NAME = "rssfeeds";

async function rss(client){
  let configs = await findAll(COLLECTION_NAME);

  for (let i = 0; i<configs.length; i++){
    const config = configs[i];
    setTimeout(() => {  getFeed(config, client); }, i*20000);
  }
}

async function getFeed(config, client) {
  const rssData = getCollection(config.database);

  let parser = new Parser({
    customFields: {
      item: [
        ['media:thumbnail', 'thumbnail'],
      ]
    }
  });

  (async () => {
    let feed = await parser.parseURL(config.feed);

    for (i = 0; i < 10; i++) {
      let found = await rssData.findOne({ url: feed.items[i].link });

      if (!found) {
        await rssData.updateOne(
          { url: feed.items[i].link },
          { $set: { url: feed.items[i].link } },
          { upsert: true }
        );
        let channel = await client.channels.fetch(config.channelId);
        channel.send({embeds: [redditEmbed(config, feed.items[i])]});
      }
    }
  })();
}

function redditEmbed(config, item) {
  var expression = /(.*)(submitted by.*\])/gi;
  var match = expression.exec(item.contentSnippet);
  if (match) {
    if (match[1].length > 1000) {
      var content = match[1].substring(0, 1000) + "...";
    } else if (match[1].length > 5) {
      var content = match[1];
    }
  }

  let thumbnailUrl = ((item.thumbnail || {})['$'] || {}).url || "";
  if (thumbnailUrl.length > 0){
    thumb_url = thumbnailUrl;
  } else {
    thumb_url = config.thumbnail;
  }
  
  const embed = new MessageEmbed()
    .setColor('#03D3D4')
    .setTitle(item.title.length > 255 ? item.title.substring(0,250) + "..." : item.title)
    .setURL(item.link)
    .setAuthor({ name: config.title, iconURL: config.iconUrl, url: config.url })
    .setThumbnail(thumb_url)
    .setTimestamp(item.isoDate)
    .setFooter({ text: "Added by " + item.author, iconURL: config.iconUrl });

  if (content) embed.setDescription(content);
    return embed;
}

module.exports = rss;
