const monk = require("monk");
const db = monk("localhost:27017/botbish");

const rssConfigs = [
    {rssFeed: "csgo", title: "CS:GO Reddit: New & Hot", database: "csgoreddit", channelId: "434294330971389952", feed: "https://www.reddit.com/r/GlobalOffensive/.rss", url: "https://www.reddit.com/r/GlobalOffensive/", thumbnail: "https://seeklogo.com/images/C/Counter-Strike-logo-EAC70C9C3A-seeklogo.com.png", iconUrl: 'https://b.thumbs.redditmedia.com/g5eFUVT_1xS2OUI_uYxOGlZAsYHkLrq2Hhsz8Fnloes.png'},
    {rssFeed: "sweddit", title: "Sweddit", database: "swedenreddit", channelId: "941396796217917450", feed: "https://www.reddit.com/r/sweden/.rss", url: "https://www.reddit.com/r/sweden/", thumbnail: "https://styles.redditmedia.com/t5_2qofe/styles/communityIcon_hddht7i5geg01.png?width=256&s=a715ee3e7a1a257ba9115bd3f19272219d1ca4ec", iconUrl: 'https://styles.redditmedia.com/t5_2qofe/styles/communityIcon_hddht7i5geg01.png?width=256&s=a715ee3e7a1a257ba9115bd3f19272219d1ca4ec'},
    {rssFeed: "reddittop", title: "Reddit", database: "reddit", channelId: "941396796217917450", feed: "https://www.reddit.com/top/.rss", url: "https://www.reddit.com/top/", thumbnail: "https://www.redditinc.com/assets/images/site/reddit-logo.png", iconUrl: 'https://www.redditinc.com/assets/images/site/reddit-logo.png'}
]

async function seed() {
    const feedData = db.get("rssfeeds");

    for (let i = 0; i<rssConfigs.length; i++){
        const config = rssConfigs[i]

        await feedData.update(
            { rssFeed: config.rssFeed },
            { $set: config },
            { upsert: true }
        );
    }

    console.log("Done seeding");
}

seed();