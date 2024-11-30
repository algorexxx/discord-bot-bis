const imageEmbed = require("../utilities/image");
const getRandomInt = require("../utilities/getRandomInt");
const download = require("../utilities/download");
var fs = require("fs");
const { findOne, updateOne, findAll, getNextId, remove } = require("../services/mongodbService");
const { incrementUser } = require("../services/userService");

const COLLECTION_NAME = "eyebleach";

async function eyeBleach(message, command, args, user, client) {
  if (command === "eb") {
    if (!args) {
      let ebs = await findAll(COLLECTION_NAME);
      if (ebs.length <= 0) {
        console.log("No eyebleach found");
        message.reply("No eyebleach found");
        return;
      } else {
        let display_image = ebs[getRandomInt(0, ebs.length - 1)];
        let owner = (await client.users.fetch(display_image.owner)).username;
        user.eb_watched += 1;
        message.reply({
          embeds: [
            await imageEmbed(
              display_image,
              owner,
              "Eyebleach",
              "http://iconbug.com/data/07/256/43e0d0ba02cfe58b9585b141974e1da7.png"
            )
          ]
        });
      }
    } else {
      let found = await findOne({ url: args }, COLLECTION_NAME);

      if (found) {
        message.channel.send("Duplicate image, try another one!");
        return;
      }

      let newID = await getNextId(COLLECTION_NAME);

      download(
        args,
        "./images/eb/" + newID,
        async function (res) {
          if (!res) {
            await updateOne({ id: newID }, { id: newID, url: args, owner: message.author.id }, COLLECTION_NAME);
            message.reply("Image added to eyebleach!");
            await incrementUser(user.id, { gold: 100, eb_added: 1 });
          } else {
            message.reply(res);
          }
        });
    }
  } else if (command === "reb") {
    if (user.id === process.env.DISCORD_ADMIN_ID && args) {
      let ebrm = await findOne({ id: parseInt(args) }, COLLECTION_NAME);

      if (!ebrm) {
        message.reply("ID: " + args + "does not exist.");
      } else {
        await incrementUser(ebrm.owner, { gold: -150, fun_added: -1 });

        var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,6}\b(\/.*(jpg|jpeg|png|gif|bmp))/gi;
        var match = expression.exec(ebrm.url);

        if (match) {
          if (match[2] == "jpg") filetype = "jpeg";
          else filetype = match[2];

          fs.unlink("./images/eb/" + args + "." + filetype, function () {
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

module.exports = eyeBleach;
