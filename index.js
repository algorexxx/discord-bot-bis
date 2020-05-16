const Discord = require("discord.js");
const monk = require("monk");
const client = new Discord.Client();
const req = require("request");
var fs = require("fs");
var db = monk("localhost:27017/botbish");
let userData = db.get("users");
const PREFIX = "!";

const helpEmbed = require("./modules/help");
const eyeBleach = require("./modules/eyeBleach");
const hotEyeBleach = require("./modules/hotEyeBleach");
const fun = require("./modules/fun");

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
      eyeBleach(message, args, user, db, req, fs, client);
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
      hotEyeBleach(message, args, user, db, req, fs, client);
      break;
    case "fun":
    case "rfun":
      fun(message, args, user, db, req, fs, client);
      break;
    case "gold":
      message.channel.send("You have: " + user.gold + " gold.");
      break;
  }

  await userData.update(
    { id: message.author.id },
    { $set: user },
    { upsert: true }
  );
});

client.login(process.env.DISCORD_TOKEN);
