const Discord = require("discord.js");
const monk = require("monk");
const client = new Discord.Client();
const req = require("request");
var fs = require("fs");
var db = monk("localhost:27017/botbish");
let userData = db.get("users");
//userData.drop();
const PREFIX = "!";

const helpEmbed = require("./modules/help");
const eyeBleach = require("./modules/eyeBleach");
const hotEyeBleach = require("./modules/hotEyeBleach");
const fun = require("./modules/fun");
const stats = require("./modules/stats");
const blackjack = require("./modules/blackjack");
const rss = require("./modules/rss");
const statsUpdate = require("./modules/statsUpdate");
const coinflip = require("./modules/coinflip");
const hangMan = require("./modules/hangman");
const music = require("./modules/music");
const backup = require("./modules/backup");

client.on("ready", () => {
  console.log("Bot started!");
});

client.on("message", async (message) => {
  let user = await userData.findOne({ id: message.author.id });
  if (!user) {
    user = {
      id: message.author.id,
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
    await userData.update(
      { id: message.author.id },
      { $set: user },
      { upsert: true }
    );
  }
  user.active = true;
  if (message.content.startsWith("ping")) {
    message.channel.send("pong!");
  }

  if (!message.content.startsWith(PREFIX)) return;

  var args = message.content.substring(PREFIX.length).split(" ");

  switch (args[0].toLowerCase()) {
    case "help":
      message.channel.send(helpEmbed());
      break;

    case "eyebleach":
    case "eb":
    case "reb":
      await eyeBleach(message, args, user, db, req, fs, client);
      break;
    case "hoteyebleach":
    case "heb":
    case "rheb":
      if (
        message.channel == (await client.channels.fetch("434824496856301591"))
      ) {
        message.channel.send("Psst, not here.. ;)\n");
        return;
      }
      await hotEyeBleach(message, args, user, db, req, fs, client);
      break;
    case "fun":
    case "rfun":
      await fun(message, args, user, db, req, fs, client);
      break;
    case "gold":
      message.channel.send("You have: " + user.gold + " gold.");
      break;
    case "stats":
      stats(message, args, user, db, req, fs, client);
      break;
    case "cock":
      message.channel.send(
        "https://media.discordapp.net/attachments/427214398558306304/432283893065056275/alexsexy.png"
      );
      break;
    case "blackjack":
    case "bet":
    case "hit":
    case "stand":
    case "double":
      await blackjack(message, args, user, db, req, fs, client);
      break;
    case "coinflip":
    case "join":
    case "cancel":
      await coinflip(message, args, user, db, req, fs, client);
      break;
    case "guess":
      if (!args[1]) return;
      message.channel.send(
        await hangMan.guess(args[1].substring(0, 1), message.author.id, db)
      );
      break;

    case "hangman":
      message.channel.send(await hangMan.newGame());
      break;
    case "play":
    case "skip":
    case "stop":
    case "queue":
    case "pause":
    case "resume":
    case "nowplaying":
    case "top":
      await music(message, args, user, db, req, fs, client);
      break;
    case "backup":
      await backup(db);
      break;
  }
});

// Create an event listener for new guild members
client.on("guildMemberAdd", (member) => {
  member.send(`Welcome, ${member}. DM emil hjelm for nudes`);

  var role = member.guild.roles.cache.find((role) => role.name === "loverbois");
  member.roles.add(role.id);
});

setInterval(function () {
  rss(db, req, fs, client);
}, 600000);

setInterval(function () {
  statsUpdate(db, req, fs, client);
}, 180000);

setInterval(function () {
  backup(db);
}, 86400000);

client.login(process.env.DISCORD_TOKEN);
