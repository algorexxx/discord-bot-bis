const Parser = require("rss-parser");

async function rss(db, req, fs, client) {
  const rssData = db.get("csgoreddit");
  // Runs every 10 minutes

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
        let channel = client.channels.cache.get("434294330971389952");
        channel.send(redditEmbed(feed.items[i]));
      }
    }
  })();
}

function redditEmbed(item) {
  console.log("- function redditEmbed start");
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

  var rss_embed = {
    embed: {
      title: item.title,
      url: item.link,
      color: 250836,
      timestamp: item.isoDate,
      footer: {
        icon_url:
          "https://b.thumbs.redditmedia.com/g5eFUVT_1xS2OUI_uYxOGlZAsYHkLrq2Hhsz8Fnloes.png",
        text: "Added by " + item.author,
      },
      thumbnail: {
        url: thumb_url,
      },
      author: {
        name: "CS:GO Reddit: New & Hot",
        url: "https://www.reddit.com/r/GlobalOffensive/",
        icon_url:
          "https://b.thumbs.redditmedia.com/g5eFUVT_1xS2OUI_uYxOGlZAsYHkLrq2Hhsz8Fnloes.png",
      },
    },
  };
  if (content) rss_embed.embed.description = content;
  console.log("- function rss embed end");
  return rss_embed;
}

module.exports = rss;
