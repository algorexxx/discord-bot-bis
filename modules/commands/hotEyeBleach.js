const imageEmbed = require("../utilities/image");
const download = require("../utilities/download");
const req = require("request");
var fs = require("fs");

async function heb(imageUrl, user, db, client) {
  const eyeBleachData = db.get("hoteyebleach");
  const userData = db.get("users");

    if (!imageUrl) {
      let ebs = await eyeBleachData.find({});
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
      let found = await eyeBleachData.findOne({ url: imageUrl });

      if (found) {
        return "Duplicate image, try another one!";
      }

      let lastEb = await eyeBleachData.findOne({}, { sort: { id: -1 } });
      let newID = ((lastEb || {}).id || 0) + 1;

      download(
        imageUrl,
        "./images/heb/" + newID,
        async function (res) {
          if (!res) {
            await eyeBleachData.update(
              { id: newID },
              { $set: { id: newID, url: imageUrl, owner: user.id } },
              { upsert: true }
            );
            await userData.update(
              { id: user.id },
              { $inc: { gold: 100, heb_added: 1 } }
            );
            console.log("image downloaded");
          } else {
            console.log(res); 
          }}, req, fs);

      return "Image added to hot eyebleach!";
    }
}

async function rheb(imageId, user, db) {
  const eyeBleachData = db.get("hoteyebleach");
  const userData = db.get("users");
    if (user.id === process.env.DISCORD_ADMIN_ID && imageId) {
      let ebrm = await eyeBleachData.findOne({ id: parseInt(imageId) });

      if (!ebrm) {
        return "ID: " + imageId + "does not exist.";
      } else {
        await userData.update(
          { id: ebrm.owner },
          { $inc: { gold: -150, heb_added: -1 } }
        );

        var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,6}\b(\/.*(jpg|jpeg|png|gif|bmp))/gi;
        var match = expression.exec(ebrm.url);

        if (match) {
          if (match[2] == "jpg") filetype = "jpeg";
          else filetype = match[2];

          fs.unlink("./images/heb/" + imageId + "." + filetype, function () {
            console.log("remove done");
          });
        }

        await eyeBleachData.remove({ id: ebrm.id });

        return "fun image with id: " + imageId + " has been removed.";

      }
    }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  heb: heb,
  rheb: rheb,
};
