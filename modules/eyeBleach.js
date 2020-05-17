const imageEmbed = require("./image");
const download = require("./download");

async function eyeBleach(message, args, user, db, req, fs, client) {
  const eyeBleachData = db.get("eyebleach");
  const userData = db.get("users");
  if (args[0] === "eb") {
    if (!args[1]) {
      let ebs = await eyeBleachData.find({});
      if (ebs.length <= 0) {
        console.log("No eyebleach found");
        return;
      } else {
        let display_image = ebs[getRandomInt(0, ebs.length - 1)];
        let owner = (await client.users.fetch(display_image.owner)).username;
        user.eb_watched += 1;
        message.channel.send(
          await imageEmbed(
            display_image,
            owner,
            "Eyebleach",
            "http://iconbug.com/data/07/256/43e0d0ba02cfe58b9585b141974e1da7.png",
            db
          )
        );
      }
    } else {
      let found = await eyeBleachData.findOne({ url: args[1] });

      if (found) {
        message.channel.send("Duplicate image, try another one!");
        return;
      }

      let lastEb = await eyeBleachData.findOne({}, { sort: { id: -1 } });
      let newID = ((lastEb || {}).id || 0) + 1;

      download(
        args[1],
        "./images/eb/" + newID,
        async function (res) {
          if (!res) {
            await eyeBleachData.update(
              { id: newID },
              { $set: { id: newID, url: args[1], owner: message.author.id } },
              { upsert: true }
            );
            message.channel.send("Image added to eyebleach!");
            await userData.update(
              { id: user.id },
              { $inc: { gold: 100, eb_added: 1 } }
            );
          } else {
            message.channel.send(res);
          }
        },
        req,
        fs
      );
    }
  } else if (args[0] === "reb") {
    if (message.author.id === process.env.ADMIN_ID && args[1]) {
      let ebrm = await eyeBleachData.findOne({ id: parseInt(args[1]) });

      if (!ebrm) {
        message.channel.send("ID: " + args[1] + "does not exist.");
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

          fs.unlink("./images/eb/" + args[1] + "." + filetype, function () {
            console.log("remove done");
          });
        }

        await eyeBleachData.remove({ id: ebrm.id });

        message.channel.send(
          "fun image with id: " + args[1] + " has been removed."
        );
      }
    }
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = eyeBleach;
