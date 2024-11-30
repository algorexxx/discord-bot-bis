const { viewImage, addImage, removeImage } = require("./imageBaseCommand");
const { getUser } = require("../services/userService");
const settings = require('../../botSettings');

const PARAMETERS = {
  embedTitle: "Eyebleach",
  embedImage: "http://iconbug.com/data/07/256/43e0d0ba02cfe58b9585b141974e1da7.png",
  watchIncrement: { eb_watched: 1 },
  imageGenre: "eyebleach",
  command: "eb",
  removeCommand: "reb"
}

async function eyeBleach(message, command, args, client) {
  const user = await getUser(message.author.id);
  if (command === PARAMETERS.command) {
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

module.exports = eyeBleach;
