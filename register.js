const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');

const heb = new SlashCommandBuilder()
	.setName('heb')
	.setDescription('hot eye bleach')
	.addStringOption(option => option.setName('imgurl').setDescription('Enter a string'));

const rheb = new SlashCommandBuilder()
	.setName('rheb')
	.setDescription('remove hot eye bleach')
	.addStringOption(option => option.setName('imgid').setDescription('Enter a string'));

const commands = [heb, rheb]; 

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();