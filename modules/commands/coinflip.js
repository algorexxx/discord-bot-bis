async function eyeBleach(message, command, argument, user, db, client) {
  const coinflipData = db.get("coinflips");
  const userData = db.get("users");

  let coinflips = await coinflipData.find({});

  switch (command.toLowerCase()) {
    case "coinflip":
      if (!argument) {
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
        message.reply(msg);
      } else if (parseInt(argument) > user.gold) {
        message.reply(
          "You cannot afford this. Please bet between 0 and " + user.gold
        );
      } else if (!(parseInt(argument) > 0)) {
        message.reply("Invalid bet ammount.");
      } else {
        await coinflipData.insert({
          user: message.author.id,
          ammount: parseInt(argument),
        });
        await userData.update(
          { id: user.id },
          { $inc: { gold: -parseInt(argument) } },
          { upsert: true }
        );
        message.reply(
          message.author.username +
            "'s coinflip of " +
            parseInt(argument) +
            " gold has been added."
        );
      }
      break;
    case "join":
      coinflip_id = parseInt(argument);
      coinflip_index = coinflip_id - 1;
      if (!coinflip_id || coinflip_id < 1 || coinflip_id > coinflips.length) {
        message.reply("Invalid coinflip number");
      } else if (coinflips[coinflip_index].ammount > user.gold) {
        message.reply("You can't afford to join this coinflip.");
      } else if (coinflips[coinflip_index].user == user.id) {
        message.reply(
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
          message.reply(
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

        message.reply(
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
        !argument ||
        parseInt(argument) < 1 ||
        parseInt(argument) > coinflips.length
      ) {
        message.reply("Invalid coinflip number to cancel.");
      } else if (coinflips[argument - 1].user != user.id) {
        message.reply("You cannot cancel someone elses coinflip.");
      } else {
        await userData.update(
          { id: user.id },
          {
            $inc: {
              gold: coinflips[argument - 1].ammount,
            },
          },
          { upsert: true }
        );
        message.reply(
          "Coinflip " +
            argument +
            " has been canceled and " +
            coinflips[argument - 1].ammount +
            " gold has been returned."
        );
        await coinflipData.remove({
          _id: coinflips[argument - 1]._id,
        });
      }
      break;
  }
}

module.exports = eyeBleach;
