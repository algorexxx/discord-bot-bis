const imageEmbed = require("../utilities/image");
const getRandomInt = require("../utilities/getRandomInt");
const download = require("../utilities/download");
var fs = require("fs");

async function fun(message, command, args, user, db, client) {
  const eyeBleachData = db.get("fun");
  const userData = db.get("users");

  if (command === "fun") {
    if (!args) {
      let ebs = await eyeBleachData.find({});
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
            db
          )]});
      }
    } else {
      let found = await eyeBleachData.findOne({ url: args });

      if (found) {
        message.reply("Duplicate image, try another one!");
      }

      let lastEb = await eyeBleachData.findOne({}, { sort: { id: -1 } });
      let newID = ((lastEb || {}).id || 0) + 1;

      download(
        args,
        "./images/fun/" + newID,
        async function (res) {
          if (!res) {
            await eyeBleachData.update(
              { id: newID },
              { $set: { id: newID, url: args, owner: message.author.id } },
              { upsert: true }
            );
            message.reply("Image added to fun!");
            await userData.update(
              { id: user.id },
              { $inc: { gold: 100, fun_added: 1 } }
            );
          } else {
            message.reply(res);
          }
        }
      );
    }
  } else if (command === "rfun") {
    if (user.id === process.env.DISCORD_ADMIN_ID && args) {
      let ebrm = await eyeBleachData.findOne({ id: parseInt(args) });
      if (!ebrm) {
        message.reply("ID: " + args + "does not exist.");
      } else {
        await userData.update(
          { id: ebrm.owner },
          { $inc: { gold: -150, fun_added: -1 } }
        );

        var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,6}\b(\/.*(jpg|jpeg|png|gif|bmp))/gi;
        var match = expression.exec(ebrm.url);

        if (match) {
          if (match[2] == "jpg") filetype = "jpeg";
          else filetype = match[2];

          fs.unlink("./images/fun/" + args + "." + filetype, function () {
            console.log("remove done");
          });
        }

        await eyeBleachData.remove({ id: ebrm.id });

        message.reply(
          "fun image with id: " + args + " has been removed."
        );
      }
    }
  }
}

module.exports = fun;
