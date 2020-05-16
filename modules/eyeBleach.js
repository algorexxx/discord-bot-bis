const imageEmbed = require("./image");

async function eyeBleach(message, args, user, db, req, fs, client) {
  const eyeBleachData = db.get("eyebleach");
  if (!args[1]) {
    let ebs = await eyeBleachData.find({});
    if (ebs.length <= 0) {
      console.log("No eyebleach found");
      return;
    } else {
      let display_image = ebs[getRandomInt(0, ebs.length - 1)];
      let owner = (await client.users.fetch(display_image.owner)).username;
      message.channel.send(
        await imageEmbed(
          display_image,
          owner,
          "Eyebleach",
          "http://iconbug.com/data/07/256/43e0d0ba02cfe58b9585b141974e1da7.png",
          db
        )
      );
      user.eb_watched += 1;
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
          user.gold += 99;
          user.eb_added += 1;
        } else {
          message.channel.send(res);
        }
      },
      req,
      fs
    );
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var download = function (uri, filename, callback, req, fs) {
  console.log("- function download start");
  req.head(uri, function (err, res, body) {
    if (!res) {
      callback("error");
      return;
    } else if (!res.headers["content-type"].match("image/")) {
      callback("No image");
      return;
    }

    req(uri)
      .pipe(
        fs.createWriteStream(
          filename + "." + res.headers["content-type"].replace("image/", "")
        )
      )
      .on("close", callback);
    console.log("- function download end");
  });
};

module.exports = eyeBleach;
