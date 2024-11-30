const imageEmbed = require("../utilities/image");
const getRandomInt = require("../utilities/getRandomInt");
const download = require("../utilities/download");
var fs = require("fs");
const { findOne, updateOne, findAll, getNextId, remove } = require("../services/mongodbService");
const { incrementUser } = require("../services/userService");

const COLLECTION_NAME = "fun";

async function fun(message, command, args, user, client) {
  if (command === "fun") {
    if (!args) {
      let ebs = await findAll(COLLECTION_NAME);
      if (ebs.length <= 0) {
        console.log("No fun found");
        message.reply("No fun found");
        return;
      } else {
        let display_image = ebs[getRandomInt(0, ebs.length - 1)];
        let owner = (await client.users.fetch(display_image.owner)).username;
        user.fun_watched += 1;
        message.reply({embeds: [
          await imageEmbed(
            display_image,
            owner,
            "Fun omgwtflol",
            "https://pre00.deviantart.net/3e8d/th/pre/f/2015/031/5/b/foxy_lol_icon_by_lara_jazmin_prime-d8g66we.png",
          )]});
      }
    } else {
      let found = await findOne({ url: args }, COLLECTION_NAME);

      if (found) {
        message.reply("Duplicate image, try another one!");
      }

      let newID = await getNextId(COLLECTION_NAME);

      download(
        args,
        "./images/fun/" + newID,
        async function (res) {
          if (!res) {
            await updateOne({ id: newID }, { id: newID, url: args, owner: message.author.id }, COLLECTION_NAME);
            message.reply("Image added to fun!");
            await incrementUser(user.id, { gold: 100, fun_added: 1 });
          } else {
            message.reply(res);
          }
        }
      );
    }
  } else if (command === "rfun") {
    if (user.id === process.env.DISCORD_ADMIN_ID && args) {
      let ebrm = await findOne({ id: parseInt(args) }, COLLECTION_NAME);
      if (!ebrm) {
        message.reply("ID: " + args + "does not exist.");
      } else {
        await user.id(ebrm.owner,{ gold: -150, fun_added: -1 });

        var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,6}\b(\/.*(jpg|jpeg|png|gif|bmp))/gi;
        var match = expression.exec(ebrm.url);

        if (match) {
          if (match[2] == "jpg") filetype = "jpeg";
          else filetype = match[2];

          fs.unlink("./images/fun/" + args + "." + filetype, function () {
            console.log("remove done");
          });
        }

        await remove({ id: ebrm.id }, COLLECTION_NAME);

        message.reply(
          "fun image with id: " + args + " has been removed."
        );
      }
    }
  }
}

module.exports = fun;
