const { Client, Intents } = require('discord.js');
const client = new Client({ intents: new Intents(32767) });
const monk = require("monk");
const db = monk("localhost:27017/botbish");
const userData = db.get("users");
const PREFIX = "!";

const {heb, rheb} = require("./modules/commands/hotEyeBleach");
const {getUser} = require("./modules/services/userService");
const stats = require('./modules/commands/stats');
const statsUpdate = require("./modules/utilities/statsUpdate");

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const user = await getUser(interaction.user.id, userData);

    switch (interaction.commandName) {
        case "heb":
            const isPg13Channel = interaction.channel == (await client.channels.fetch("434824496856301591"));
            if (isPg13Channel) {
                interaction.reply("Psst, not here.. ;)\n");
                return;
            }
            interaction.reply(await heb(interaction.options.getString('imgurl'), user, db, client));
            break;
        case "rheb":
            interaction.reply(await rheb(interaction.options.getString('imgid'), user, db));
            break;
        case "stats":
            interaction.reply(await stats(interaction.options.getString('username'), user, db, client));
            break;
    }
});

client.on("messageCreate", async message => { 
    if (message.content.toLowerCase().includes("bitco")) {
        message.reply("https://www.youtube.com/watch?v=e5nyQmaq4k4");
    }

    if (!message.content.startsWith(PREFIX)) return;
    const user = await getUser(message.author.id, userData);

    const command = message.content.substring(PREFIX.length).split(" ")[0];
    const arguments = message.content.substring(PREFIX.length).split(" ").slice(1);

    switch (command) {
        case "heb":
            const isPg13Channel = message.channel == (await client.channels.fetch("434824496856301591"));
            if (isPg13Channel) {
                message.reply("Psst, not here.. ;)\n");
                return;
            }
            const imageUrl = arguments[0];
            message.reply(await heb(imageUrl, user, db, client));
            break;
        case "rheb":
            const hebId = arguments[0];
            message.reply(await rheb(hebId, user, db));
            break;
        case "stats":
            const userSearchString = arguments[0];
            message.reply(await stats(userSearchString, user, db, client));
            break;
    }
});

client.login(process.env.DISCORD_TOKEN);

setInterval(function () { statsUpdate(db, client); }, 180000);