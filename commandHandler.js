const heb = require("./modules/commands/hotEyeBleach");
const fun = require("./modules/commands/fun");
const coinflip = require("./modules/commands/coinflip");
const music = require("./modules/commands/music/music");
const blackjack = require("./modules/commands/blackjack");
const hangMan = require("./modules/commands/hangman/hangman");
const eyeBleach = require("./modules/commands/eyeBleach");
const getStats = require('./modules/commands/stats');
const helpEmbed = require("./modules/utilities/helpEmbed");
const backup = require("./modules/services/backup");
const settings = require('./botSettings');
const { getUser } = require("./modules/services/userService");

async function processCommand(command, message, arguments, client){
    switch (command) {
        case "help":
            message.reply({ embeds: [helpEmbed()] });
            break;
        case "eyebleach":
        case "eb":
        case "reb":
            await eyeBleach(message, command, arguments[0], client);
            break;
        case "heb":
        case "rheb":
        case "hoteyebleach":
            await heb(message, command, arguments[0], client);
            break;
        case "fun":
        case "rfun":
            await fun(message, command, arguments[0], client);
            break;
        case "gold":
            message.reply("You have: " + (await getUser(message.author.id)).gold + " gold.");
            break;
        case "stats":
            message.reply(await getStats(arguments[0], message, client));
            break;
        case "cock":
            message.reply(settings.COCK_URL);
            break;
        case "blackjack":
        case "bet":
        case "hit":
        case "stand":
        case "double":
            await blackjack(message, command, arguments[0], client);
            break;
        case "coinflip":
        case "join":
        case "cancel":
            await coinflip(message, command, arguments[0], client);
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
            await music(message, command, arguments, client);
            break;
        case "backup":
            await backup();
            break;
    }
}

module.exports = processCommand;