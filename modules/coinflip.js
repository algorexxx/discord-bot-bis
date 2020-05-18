async function eyeBleach(message, args, user, db, req, fs, client) {
  const coinflipData = db.get("coinflips");
  const userData = db.get("users");

  let coinflips = await coinflipData.find({});

  switch (args[0].toLowerCase()) {
    case "coinflip":
      if (!args[1]) {
        msg = "To start a coinflip write !coinflip <ammount of gold to bet>\n";
        msg += "To join an existing coinflip enter !join <coinflip number>\n";
        msg +=
          "To cancel an existing coinflip enter !cancel <coinflip number>\n\n";
        msg += "Current open coinflips:\n";
        for (i = 0; i < coinflips.length; i++) {
          msg +=
            i +
            1 +
            ": " +
            (await client.users.fetch(coinflips[i].user)).username +
            " bet: " +
            coinflips[i].ammount +
            " gold.\n";
        }
        message.channel.send(msg);
      } else if (parseInt(args[1]) > user.gold) {
        message.channel.send(
          "You cannot afford this. Please bet between 0 and " + user.gold
        );
      } else if (!(parseInt(args[1]) > 0)) {
        message.channel.send("Invalid bet ammount.");
      } else {
        await coinflipData.insert({
          user: message.author.id,
          ammount: parseInt(args[1]),
        });
        await userData.update(
          { id: user.id },
          { $inc: { gold: -parseInt(args[1]) } },
          { upsert: true }
        );
        message.channel.send(
          message.author.username +
            "'s coinflip of " +
            parseInt(args[1]) +
            " gold has been added."
        );
      }
      break;
    case "join":
      coinflip_id = parseInt(args[1]);
      coinflip_index = coinflip_id - 1;
      if (!coinflip_id || coinflip_id < 1 || coinflip_id > coinflips.length) {
        message.channel.send("Invalid coinflip number");
      } else if (coinflips[coinflip_index].ammount > user.gold) {
        message.channel.send("You can't afford to join this coinflip.");
      } else if (coinflips[coinflip_index].user == user.id) {
        message.channel.send(
          "You can't join your own coinflip. Use !cancel to get your gold returned."
        );
      } else {
        await userData.update(
          { id: user.id },
          { $inc: { gold: -coinflips[coinflip_index].ammount } },
          { upsert: true }
        );
        win_no = Math.round(Math.random());
        let winner_id, loser_id;
        if (win_no == 0) {
          winner_id = coinflips[coinflip_index].user;
          loser_id = user.id;
        } else if (win_no == 1) {
          loser_id = coinflips[coinflip_index].user;
          winner_id = user.id;
        } else {
          message.channel.send(
            "Something went wrong with coinflip, notify admin that the winning number was not between 0 and 1."
          );
        }
        await userData.update(
          { id: winner_id },
          {
            $inc: {
              coinflips_won: 1,
              gold: Math.floor(coinflips[coinflip_index].ammount * 1.9),
            },
          },
          { upsert: true }
        );
        await userData.update(
          { id: loser_id },
          { $inc: { coinflips_lost: 1 } },
          { upsert: true }
        );

        message.channel.send(
          (await client.users.fetch(winner_id)).username +
            " just won " +
            coinflips[coinflip_index].ammount +
            " gold off of " +
            (await client.users.fetch(loser_id)).username
        );
        await coinflipData.remove({
          _id: coinflips[coinflip_index]._id,
        });
      }
      break;

    case "cancel":
      if (
        !args[1] ||
        parseInt(args[1]) < 1 ||
        parseInt(args[1]) > coinflips.length
      ) {
        message.channel.send("Invalid coinflip number to cancel.");
      } else if (coinflips[args[1] - 1].user != user.id) {
        message.channel.send("You cannot cancel someone elses coinflip.");
      } else {
        await userData.update(
          { id: user.id },
          {
            $inc: {
              gold: coinflips[args[1] - 1].ammount,
            },
          },
          { upsert: true }
        );
        message.channel.send(
          "Coinflip " +
            args[1] +
            " has been canceled and " +
            coinflips[args[1] - 1].ammount +
            " gold has been returned."
        );
        await coinflipData.remove({
          _id: coinflips[args[1] - 1]._id,
        });
      }
      break;
  }
}

module.exports = eyeBleach;
