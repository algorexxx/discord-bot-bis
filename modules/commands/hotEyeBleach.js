const { viewImage, addImage, removeImage } = require("./imageBaseCommand");
const { getUser } = require("../services/userService");
const settings = require('../../botSettings');

const PARAMETERS = {
  embedTitle: "Hot Eyebleach",
  embedImage: "https://i.imgur.com/lkjaG2p.png",
  watchIncrement: { heb_watched: 1 },
  imageGenre: "hoteyebleach",
  command: "heb",
  removeCommand: "rheb"
}

async function heb(message, command, args, client) {
  const user = await getUser(message.author.id);
  if (command === PARAMETERS.command) {
    const isPg13Channel = message.channel == (await client.channels.fetch("434824496856301591"));
    if (isPg13Channel) {
      message.reply("Psst, not here.. ;)\n");
      return;
    }

    if (!args) {
      await viewImage(message, client, user, PARAMETERS);
    } else {
      await addImage(args, message, user, PARAMETERS);
    }
  } else if (command === PARAMETERS.removeCommand) {
    if (user.id === settings.ADMIN_ID && args) {
      await removeImage(parseInt(args), message, PARAMETERS);
    }
  }
}

module.exports = heb;
