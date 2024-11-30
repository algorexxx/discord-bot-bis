const { Client, Intents } = require('discord.js');
const client = new Client({ intents: new Intents(32767) });
const { incrementMessageCount } = require("./modules/services/userService");
const backup = require("./modules/services/backup");
const statsUpdate = require("./modules/utilities/statsUpdate");
const rss = require('./modules/services/rss');
const settings = require('./botSettings');
const processCommand = require('./commandHandler');

const PREFIX = "!";

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async message => {
    await incrementMessageCount(message.author.id, message.channelId);
    if (message.content.toLowerCase().includes("bitco")) {
        message.reply(settings.BITCONNECT);
    }

    if (!message.content.startsWith(PREFIX)) {
        return;
    }

    const command = message.content.substring(PREFIX.length).split(" ")[0];
    const arguments = message.content.substring(PREFIX.length).split(" ").slice(1);

    processCommand(command, message, arguments, client);
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