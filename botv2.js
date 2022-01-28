const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const monk = require("monk");
var db = monk("localhost:27017/botbish");
let userData = db.get("users");

const {heb, rheb} = require("./modules/hotEyeBleach");
const {defaultUser, createNewUser} = require("./modules/defaultUser");

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  let user = await userData.findOne({ id: interaction.user.id }) || await createNewUser(userData);
  user.active = true;

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