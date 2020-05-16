const imageEmbed = require("./image");
const download = require("./download");

async function fun(message, args, user, db, req, fs, client) {
  const eyeBleachData = db.get("fun");
  if (!args[1]) {
    let ebs = await eyeBleachData.find({});
    if (ebs.length <= 0) {
      console.log("No fun found");
      return;
    } else {
      let display_image = ebs[getRandomInt(0, ebs.length - 1)];
      let owner = (await client.users.fetch(display_image.owner)).username;
      message.channel.send(
        await imageEmbed(
          display_image,
          owner,
          "Fun omgwtflol",
          "https://pre00.deviantart.net/3e8d/th/pre/f/2015/031/5/b/foxy_lol_icon_by_lara_jazmin_prime-d8g66we.png",
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
      "./images/fun/" + newID,
      async function (res) {
        if (!res) {
          await eyeBleachData.update(
            { id: newID },
            { $set: { id: newID, url: args[1], owner: message.author.id } },
            { upsert: true }
          );
          message.channel.send("Image added to fun!");
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

module.exports = fun;
