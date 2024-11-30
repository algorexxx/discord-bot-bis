const imageEmbed = require("../utilities/image");
const download = require("../utilities/download");
const getRandomInt = require("../utilities/getRandomInt");
var fs = require("fs");
const { findOne, updateOne, findAll, getNextId, remove } = require("../services/mongodbService");
const { incrementUser } = require("../services/userService");

const COLLECTION_NAME = "hoteyebleach";

async function heb(imageUrl, user, client) {
    if (!imageUrl) {
      let ebs = await findAll(COLLECTION_NAME);
      if (ebs.length <= 0) {
        return "No hot eyebleach found";
      } else {
        let display_image = ebs[getRandomInt(0, ebs.length - 1)];
        let owner = (await client.users.fetch(display_image.owner)).username;
        user.heb_watched += 1;
        const embed = await imageEmbed(display_image, owner, "Hot Eyebleach", "https://i.imgur.com/lkjaG2p.png");
        return {embeds: [embed]};
      }
    } else {
      let found = await findOne({ url: imageUrl }, COLLECTION_NAME);

      if (found) {
        return "Duplicate image, try another one!";
      }

      let newID = await getNextId(COLLECTION_NAME);

      download(
        imageUrl,
        "./images/heb/" + newID,
        async function (res) {
          if (!res) {
            await updateOne({ id: newID }, { id: newID, url: imageUrl, owner: user.id }, COLLECTION_NAME);
            await incrementUser(user.id, { gold: 100, heb_added: 1 });
            console.log("image downloaded");
          } else {
            console.log(res); 
          }});

      return "Image added to hot eyebleach!";
    }
}

async function rheb(imageId, user) {
    if (user.id === process.env.DISCORD_ADMIN_ID && imageId) {
      let ebrm = await findOne({ id: parseInt(imageId) }, COLLECTION_NAME);

      if (!ebrm) {
        return "ID: " + imageId + "does not exist.";
      } else {
        await incrementUser(ebrm.owner, { gold: -150, heb_added: -1 });

        var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,6}\b(\/.*(jpg|jpeg|png|gif|bmp))/gi;
        var match = expression.exec(ebrm.url);

        if (match) {
          if (match[2] == "jpg") filetype = "jpeg";
          else filetype = match[2];

          fs.unlink("./images/heb/" + imageId + "." + filetype, function () {
            console.log("remove done");
          });
        }

        await remove({ id: ebrm.id }, COLLECTION_NAME);

        return "fun image with id: " + imageId + " has been removed.";
      }
    }
}

module.exports = {
  heb: heb,
  rheb: rheb,
};
