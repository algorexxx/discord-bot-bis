const Parser = require("rss-parser");
const { MessageEmbed } = require('discord.js');

async function rss(db, client) {
  const rssData = db.get("csgoreddit");

  let parser = new Parser();
  (async () => {
    let feed = await parser.parseURL(
      "https://www.reddit.com/r/GlobalOffensive/.rss"
    );

    for (i = 0; i < 10; i++) {
      let found = await rssData.findOne({ url: feed.items[i].link });

      if (!found) {
        await rssData.update(
          { url: feed.items[i].link },
          { $set: { url: feed.items[i].link } },
          { upsert: true }
        );
        let channel = await client.channels.fetch("434294330971389952");
        channel.send({embeds: [redditEmbed(feed.items[i])]});
      }
    }
  })();
}

function redditEmbed(item) {
  var expression = /(.*)(submitted by.*\])/gi;
  var match = expression.exec(item.contentSnippet);
  if (match) {
    if (match[1].length > 1000) {
      var content = match[1].substring(0, 1000) + "...";
    } else if (match[1].length > 5) {
      var content = match[1];
    }
  }

  var expression = /(<img src=\\?")(https?:\/\/.*\.thumbs.*?\.(jpg|gif|jpeg))/gi;
  var match = expression.exec(item.content);

  if (match) {
    thumb_url = match[2];
  } else {
    thumb_url =
      "https://seeklogo.com/images/C/Counter-Strike-logo-EAC70C9C3A-seeklogo.com.png";
  }
  
  const embed = new MessageEmbed()
    .setColor('#03D3D4')
    .setTitle(item.title.substring(0,250) + "...")
    .setURL(item.link)
    .setAuthor({ name: 'CS:GO Reddit: New & Hot', iconURL: 'https://b.thumbs.redditmedia.com/g5eFUVT_1xS2OUI_uYxOGlZAsYHkLrq2Hhsz8Fnloes.png', url: 'https://www.reddit.com/r/GlobalOffensive/' })
    .setThumbnail(thumb_url)
    .setTimestamp(item.isoDate)
    .setFooter({ text: "Added by " + item.author, iconURL: 'https://b.thumbs.redditmedia.com/g5eFUVT_1xS2OUI_uYxOGlZAsYHkLrq2Hhsz8Fnloes.png' });

  if (content) embed.setDescription(content);
    return embed;
}

module.exports = rss;
