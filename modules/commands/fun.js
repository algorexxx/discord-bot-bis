const { viewImage, addImage, removeImage } = require("./imageBaseCommand");
const settings = require('../../botSettings');

const PARAMETERS = {
  embedTitle: "Fun omgwtflol",
  embedImage: "https://pre00.deviantart.net/3e8d/th/pre/f/2015/031/5/b/foxy_lol_icon_by_lara_jazmin_prime-d8g66we.png",
  watchIncrement: { fun_watched: 1 },
  imageGenre: "fun",
  command: "fun",
  removeCommand: "rfun"
}

async function fun(message, command, args, user, client) {
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

module.exports = fun;
