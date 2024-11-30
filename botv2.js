const { Client, Intents } = require('discord.js');
const client = new Client({ intents: new Intents(32767) });
const PREFIX = "!";

const heb = require("./modules/commands/hotEyeBleach");
const fun = require("./modules/commands/fun");
const coinflip = require("./modules/commands/coinflip");
const music = require("./modules/commands/music/music");
const blackjack = require("./modules/commands/blackjack");
const hangMan = require("./modules/commands/hangman/hangman");
const eyeBleach = require("./modules/commands/eyeBleach");
const { getUser } = require("./modules/services/userService");
const backup = require("./modules/services/backup");
const stats = require('./modules/commands/stats');
const statsUpdate = require("./modules/utilities/statsUpdate");
const helpEmbed = require("./modules/utilities/helpEmbed");
const incrementMessageCount = require("./modules/utilities/incrementMessageCount");
const rss = require('./modules/services/rss');
const settings = require('./botSettings');

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async message => {
    await incrementMessageCount(message);
    if (message.content.toLowerCase().includes("bitco")) {
        message.reply(settings.BITCONNECT);
    }

    if (!message.content.startsWith(PREFIX)) return;

    const user = await getUser(message.author.id);
    const command = message.content.substring(PREFIX.length).split(" ")[0];
    const arguments = message.content.substring(PREFIX.length).split(" ").slice(1);

    switch (command) {
        case "help":
            message.reply({ embeds: [helpEmbed()] });
            break;
        case "eyebleach":
        case "eb":
        case "reb":
            await eyeBleach(message, command, arguments[0], user, client);
            break;
        case "heb":
        case "rheb":
        case "hoteyebleach":
            await heb(message, command, arguments[0], user, client);
            break;
        case "fun":
        case "rfun":
            await fun(message, command, arguments[0], user, client);
            break;
        case "gold":
            message.reply("You have: " + user.gold + " gold.");
            break;
        case "stats":
            message.reply(await stats(arguments[0], user, client));
            break;
        case "cock":
            message.reply(settings.COCK_URL);
            break;
        case "blackjack":
        case "bet":
        case "hit":
        case "stand":
        case "double":
            await blackjack(message, command, arguments[0], user, client);
            break;
        case "coinflip":
        case "join":
        case "cancel":
            await coinflip(message, command, arguments[0], user, client);
            break;
        case "guess":
            message.reply(await hangMan.guess(arguments[0], message.author.id));
            break;
        case "hangman":
            message.reply(await hangMan.newGame());
            break;
        case "play":
        case "skip":
        case "stop":
        case "queue":
        case "pause":
        case "resume":
        case "nowplaying":
        case "top":
            await music(message, command, arguments, user, client);
            break;
        case "backup":
            await backup();
            break;
    }
});

client.login(settings.TOKEN);

setInterval(function () { statsUpdate(client); }, 180000);
setInterval(function () { backup(); }, 86400000);
setInterval(function () { rss(client); }, 600000);

client.on("guildMemberAdd", (member) => {
    member.send(`Welcome, ${member}. DM emil hjelm for nudes`);

    var role = member.guild.roles.cache.find((role) => role.name === "loverbois");
    member.roles.add(role.id);
});