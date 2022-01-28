const { Client, Intents } = require('discord.js');
const client = new Client({ intents: new Intents(32767) });
const monk = require("monk");
const db = monk("localhost:27017/botbish");
const userData = db.get("users");

const {heb, rheb} = require("./modules/commands/hotEyeBleach");
const {getUser} = require("./modules/services/userService");
const statsUpdate = require("./modules/statsUpdate");

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
    }
});

client.login(process.env.DISCORD_TOKEN);

setInterval(function () { statsUpdate(db, client); }, 180000);