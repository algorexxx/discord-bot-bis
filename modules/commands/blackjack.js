const suits = [":spades:", ":hearts:", ":clubs:", ":diamonds:"];
const card_value_strings = [
  "",
  "",
  ":two:",
  ":three:",
  ":four:",
  ":five:",
  ":six:",
  ":seven:",
  ":eight:",
  ":nine:",
  ":keycap_ten:",
  ":regional_indicator_j:",
  ":regional_indicator_q:",
  ":regional_indicator_k:",
  ":regional_indicator_a:",
];

async function blackjack(message, command, argument, user, db, client) {
  let blackjack;
  const blackjackData = db.get("blackjacks");
  const userData = db.get("users");
  switch (command.toLowerCase()) {
    case "blackjack":
      if (
        message.channel.id !=
        client.guilds.cache
          .get("426479768947654659")
          .channels.cache.get("434825682007228457").id
      ) {
        message.reply(
          "Please use the casino text channel for all gambling.\n"
        );
        return;
      }

      let bj = await blackjackData.findOne({ owner: user.id });

      if (!bj) {
        message.reply(
          "Welcome to the blackjack table.\n\nTo start playing, place your bet with !bet <ammount>"
        );
        return;
      }
      if (bj.bet == 0) {
        message.reply(
          "Welcome to the blackjack table.\n\nTo start playing, place your bet with !bet <ammount>"
        );
        return;
      } else {
        message.reply(
          "You are already in a hand, scroll up to see your cards and options."
        );
        return;
      }

    case "bet":
      if (
        message.channel.id !=
        client.guilds.cache
          .get("426479768947654659")
          .channels.cache.get("434825682007228457").id
      ) {
        message.reply(
          "Please use the casino text channel for all gambling.\n"
        );
        return;
      }

      blackjack = await blackjackData.findOne({ owner: user.id });

      if (!blackjack) {
        blackjack = {
          owner: user.id,
          bet: 0,
          user_cards: [],
          dealer_cards: [],
          deck: [],
          active: 0,
        };
      }

      if (blackjack.bet !== 0) {
        message.reply(
          "You have already made your bet. Use !blackjack to see what your next move is."
        );
        return;
      }

      if (!parseInt(argument) || parseInt(argument) < 1) {
        message.reply("Invalid bet ammount, please try again.");
        return;
      }

      if (parseInt(argument) > user.gold) {
        message.reply(
          "You cannot afford to bet this much, you only have " +
            user.gold +
            " gold."
        );
        return;
      } else {
        if (blackjack.deck.length < 10) {
          blackjack.deck.length = 0;
          for (d = 0; d < 5; d++) {
            for (i = 0; i < 4; i++) {
              for (j = 2; j < 15; j++) {
                blackjack.deck.push({ value: j, suit: suits[i] });
              }
            }
          }
        }

        if (blackjack.user_cards.length == 0) {
          card = getRandomInt(0, blackjack.deck.length - 1);
          blackjack.user_cards.push(blackjack.deck[card]);
          blackjack.deck.splice(card, 1);
          card = getRandomInt(0, blackjack.deck.length - 1);
          blackjack.dealer_cards.push(blackjack.deck[card]);
          blackjack.deck.splice(card, 1);
          card = getRandomInt(0, blackjack.deck.length - 1);
          blackjack.user_cards.push(blackjack.deck[card]);
          blackjack.deck.splice(card, 1);
          card = getRandomInt(0, blackjack.deck.length - 1);
          blackjack.dealer_cards.push(blackjack.deck[card]);
          blackjack.deck.splice(card, 1);
        }

        blackjack.bet = parseInt(argument);
        blackjack.active = 1;
        user.gold -= parseInt(argument);
        user.blackjack_hands += 1;
        await userData.update(
          { id: user.id },
          { $inc: { gold: -parseInt(argument), blackjack_hands: 1 } }
        );

        msg =
          (await client.users.fetch(user.id)).username +
          "'s Blackjack table\n\n";
        msg +=
          "Dealers hand: " +
          card_value_strings[blackjack.dealer_cards[0].value] +
          blackjack.dealer_cards[0].suit +
          " :question::question:\n\nYou bet: " +
          blackjack.bet +
          " gold.\n\nYour hand is: ";
        for (i = 0; i < blackjack.user_cards.length; i++) {
          msg +=
            " " +
            card_value_strings[blackjack.user_cards[i].value] +
            blackjack.user_cards[i].suit;
        }
        msg += " [" + calcBJValue(blackjack.user_cards) + "]";
        if (calcBJValue(blackjack.user_cards) == 21) {
          await userData.update(
            { id: user.id },
            {
              $inc: { gold: Math.round(2.5 * blackjack.bet), blackjack_bjs: 1 },
            }
          );
          user.gold += Math.round(2.5 * blackjack.bet);
          msg =
            "\n\nBlackjack! Congratulations!\n\nTo play again use !bet <ammount>";
          blackjack.active = 0;
          message.reply(
            await blackjackEmbed(blackjack, msg, user, client)
          );
          blackjack.user_cards.length = 0;
          blackjack.dealer_cards.length = 0;
          blackjack.bet = 0;
          user.blackjack_bjs += 1;
        } else if (
          calcBJValue(blackjack.user_cards) > 8 &&
          calcBJValue(blackjack.user_cards) < 12
        ) {
          msg = "\n\nDo you want to !hit, !stand or !double?";
          message.reply(
            await blackjackEmbed(blackjack, msg, user, client)
          );
        } else {
          msg = "\n\nDo you want to !hit or !stand?";
          message.reply(
            await blackjackEmbed(blackjack, msg, user, client)
          );
        }
        await blackjackData.update(
          { owner: user.id },
          { $set: blackjack },
          { upsert: true }
        );
      }

      break;

    case "hit":
      if (
        message.channel.id !=
        client.guilds.cache
          .get("426479768947654659")
          .channels.cache.get("434825682007228457").id
      ) {
        message.reply(
          "Please use the casino text channel for all gambling.\n"
        );
        return;
      }

      blackjack = await blackjackData.findOne({ owner: user.id });
      if (!blackjack) {
        message.reply(
          "You have no active blackjack game. Use !blackjack to start one."
        );
        return;
      }
      if (blackjack.bet == 0) {
        message.reply("You need to bet before you hit.");
        return;
      }

      card = getRandomInt(0, blackjack.deck.length - 1);
      blackjack.user_cards.push(blackjack.deck[card]);
      blackjack.deck.splice(card, 1);

      msg =
        (await client.users.fetch(user.id)).username + "'s Blackjack table\n\n";
      msg +=
        "Dealers hand: " +
        card_value_strings[blackjack.dealer_cards[0].value] +
        blackjack.dealer_cards[0].suit +
        " :question::question:\n\nYou bet: " +
        blackjack.bet +
        " gold.\n\nYour hand is: ";

      for (i = 0; i < blackjack.user_cards.length; i++) {
        msg +=
          " " +
          card_value_strings[blackjack.user_cards[i].value] +
          blackjack.user_cards[i].suit;
      }
      msg += " [" + calcBJValue(blackjack.user_cards) + "]";
      if (calcBJValue(blackjack.user_cards) < 22) {
        msg = "\n\nDo you want to !hit or !stand?";
        message.reply(
          await blackjackEmbed(blackjack, msg, user, client)
        );
      } else {
        msg =
          "\n\nBust! Better luck next time. To play again use !bet <ammount>";

        blackjack.active = 0;
        message.reply(
          await blackjackEmbed(blackjack, msg, user, client)
        );
        blackjack.user_cards.length = 0;
        blackjack.dealer_cards.length = 0;
        blackjack.bet = 0;
      }
      await blackjackData.update(
        { owner: user.id },
        { $set: blackjack },
        { upsert: true }
      );

      break;

    case "stand":
      if (
        message.channel.id !=
        client.guilds.cache
          .get("426479768947654659")
          .channels.cache.get("434825682007228457").id
      ) {
        message.reply(
          "Please use the casino text channel for all gambling.\n"
        );
        return;
      }

      blackjack = await blackjackData.findOne({ owner: user.id });

      if (!blackjack) {
        message.reply(
          "You have no active blackjack game. Use !blackjack to start one."
        );
        return;
      }
      if (blackjack.bet == 0) {
        message.reply("You need to bet before you stand.");
        return;
      }

      while (calcBJValue(blackjack.dealer_cards) < 17) {
        card = getRandomInt(0, blackjack.deck.length - 1);
        blackjack.dealer_cards.push(blackjack.deck[card]);
        blackjack.deck.splice(card, 1);
      }

      msg =
        (await client.users.fetch(user.id)).username + "'s Blackjack table\n\n";
      msg += "Dealers hand: ";
      for (i = 0; i < blackjack.dealer_cards.length; i++) {
        msg +=
          " " +
          card_value_strings[blackjack.dealer_cards[i].value] +
          blackjack.dealer_cards[i].suit;
      }
      msg += " [" + calcBJValue(blackjack.dealer_cards) + "]";
      msg += "\n\nYou bet: " + blackjack.bet + " gold.\n\nYour hand is: ";
      for (i = 0; i < blackjack.user_cards.length; i++) {
        msg +=
          " " +
          card_value_strings[blackjack.user_cards[i].value] +
          blackjack.user_cards[i].suit;
      }
      msg += " [" + calcBJValue(blackjack.user_cards) + "]";
      if (
        calcBJValue(blackjack.dealer_cards) > 21 ||
        calcBJValue(blackjack.dealer_cards) < calcBJValue(blackjack.user_cards)
      ) {
        msg = "\n\nYou won, congrats! To play again use !bet <ammount>";
        user.gold += blackjack.bet * 2;
        await userData.update(
          { id: user.id },
          { $inc: { gold: blackjack.bet * 2 } }
        );
        user.blackjack_wins += 1;
        blackjack.active = 0;
        message.reply(
          await blackjackEmbed(blackjack, msg, user, client)
        );
      } else if (
        calcBJValue(blackjack.dealer_cards) == calcBJValue(blackjack.user_cards)
      ) {
        msg = "\n\nTie! Better than nothing! To play again use !bet <ammount>";
        await userData.update(
          { id: user.id },
          { $inc: { gold: blackjack.bet } }
        );
        user.gold += blackjack.bet;
        user.blackjack_ties += 1;
        blackjack.active = 0;
        message.reply(
          await blackjackEmbed(blackjack, msg, user, client)
        );
      } else {
        msg =
          "\n\nYou lost, better luck next time. To play again use !bet <ammount>";
        blackjack.active = 0;
        message.reply(
          await blackjackEmbed(blackjack, msg, user, client)
        );
      }

      blackjack.user_cards.length = 0;
      blackjack.dealer_cards.length = 0;
      blackjack.bet = 0;

      await blackjackData.update(
        { owner: user.id },
        { $set: blackjack },
        { upsert: true }
      );

      break;

    case "double":
      if (
        message.channel.id !=
        client.guilds.cache
          .get("426479768947654659")
          .channels.cache.get("434825682007228457").id
      ) {
        message.reply(
          "Please use the casino text channel for all gambling.\n"
        );
        return;
      }

      blackjack = await blackjackData.findOne({ owner: user.id });

      if (!blackjack) {
        message.reply(
          "You have no active blackjack game. Use !blackjack to start one."
        );
        return;
      }
      if (blackjack.bet == 0) {
        message.reply("You need to bet before you double.");
        return;
      }

      if (
        calcBJValue(blackjack.user_cards) < 9 ||
        calcBJValue(blackjack.user_cards) > 11 ||
        blackjack.user_cards.length > 2
      ) {
        message.reply("Eh you can't double. !hit or !stand maybe?");
        return;
      }

      if (blackjack.bet > user.gold) {
        message.reply(
          "You cant afford to !double. Need: " +
            blackjack.bet +
            " gold, have: " +
            user.gold +
            " gold."
        );
        return;
      }

      card = getRandomInt(0, blackjack.deck.length - 1);
      blackjack.user_cards.push(blackjack.deck[card]);
      blackjack.deck.splice(card, 1);
      await userData.update(
        { id: user.id },
        { $inc: { gold: -blackjack.bet } }
      );
      user.gold -= blackjack.bet;
      blackjack.bet = blackjack.bet + blackjack.bet;

      while (calcBJValue(blackjack.dealer_cards) < 17) {
        card = getRandomInt(0, blackjack.deck.length - 1);
        blackjack.dealer_cards.push(blackjack.deck[card]);
        blackjack.deck.splice(card, 1);
      }

      msg =
        (await client.users.fetch(user.id)).username + "'s Blackjack table\n\n";
      msg += "Dealers hand: ";
      for (i = 0; i < blackjack.dealer_cards.length; i++) {
        msg +=
          " " +
          card_value_strings[blackjack.dealer_cards[i].value] +
          blackjack.dealer_cards[i].suit;
      }
      msg += " [" + calcBJValue(blackjack.dealer_cards) + "]";
      msg += "\n\nYou bet: " + blackjack.bet + " gold.\n\nYour hand is: ";
      for (i = 0; i < blackjack.user_cards.length; i++) {
        msg +=
          " " +
          card_value_strings[blackjack.user_cards[i].value] +
          blackjack.user_cards[i].suit;
      }
      msg += " [" + calcBJValue(blackjack.user_cards) + "]";
      if (
        calcBJValue(blackjack.dealer_cards) > 21 ||
        calcBJValue(blackjack.dealer_cards) < calcBJValue(blackjack.user_cards)
      ) {
        msg = "\n\nYou won, congrats! To play again use !bet <ammount>";
        user.gold += blackjack.bet * 2;
        user.blackjack_wins += 1;
        await userData.update(
          { id: user.id },
          { $inc: { gold: blackjack.bet * 2, blackjack_wins: 1 } }
        );
        blackjack.active = 0;
        message.reply(
          await blackjackEmbed(blackjack, msg, user, client)
        );
      } else if (
        calcBJValue(blackjack.dealer_cards) == calcBJValue(blackjack.user_cards)
      ) {
        msg = "\n\nTie! Better than nothing! To play again use !bet <ammount>";
        user.gold += blackjack.bet;
        user.blackjack_ties += 1;
        await userData.update(
          { id: user.id },
          { $inc: { gold: blackjack.bet, blackjack_ties: 1 } }
        );
        blackjack.active = 0;
        message.reply(
          await blackjackEmbed(blackjack, msg, user, client)
        );
      } else {
        msg =
          "\n\nYou lost, better luck next time. To play again use !bet <ammount>";
        blackjack.active = 0;
        message.reply(
          await blackjackEmbed(blackjack, msg, user, client)
        );
      }

      blackjack.user_cards.length = 0;
      blackjack.dealer_cards.length = 0;
      blackjack.bet = 0;

      await blackjackData.update(
        { owner: user.id },
        { $set: blackjack },
        { upsert: true }
      );

      break;
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function calcBJValue(hand) {
  aces = 0;
  total = 0;
  hand.forEach(function (v) {
    if (v.value == 14) {
      aces += 1;
      total += 11;
    } else if (v.value > 9) {
      total += 10;
    } else {
      total += v.value;
    }
  });

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  return total;
}

async function blackjackEmbed(game, description, user, client) {
  var user_cards = "";
  for (i = 0; i < game.user_cards.length; i++) {
    user_cards +=
      " " +
      card_value_strings[game.user_cards[i].value] +
      game.user_cards[i].suit;
  }

  if (game.active != 0) {
    num = 1;
    title = "Next Move:";
    dealer_value = calcBJValue([game.dealer_cards[0]]);
    dealer_cards =
      " " +
      card_value_strings[game.dealer_cards[0].value] +
      game.dealer_cards[0].suit;
    dealer_cards += " :question::question:";
  } else {
    num = game.dealer_cards.length;
    title = "Result:";
    dealer_value = calcBJValue(game.dealer_cards);
    var dealer_cards = "";
    for (i = 0; i < game.dealer_cards.length; i++) {
      dealer_cards +=
        " " +
        card_value_strings[game.dealer_cards[i].value] +
        game.dealer_cards[i].suit;
    }
  }
  let owner = (await client.users.fetch(game.owner)).username;

  const { MessageEmbed } = require('discord.js');

  return { embeds: [new MessageEmbed()
      .setColor('#09187C')
      .setAuthor({ name: owner + "'s Blackjack Table", iconURL: "https://images-na.ssl-images-amazon.com/images/I/81w49Xr-7QL.png" })
      .setDescription("\nBet: " + game.bet + "\n")
      .setThumbnail('http://www.smapyren.se/wp-content/uploads/2018/01/casino-blackjack.png')
      .addFields(
        { name: 'Your hand:', value: user_cards + "\nValue: " + calcBJValue(game.user_cards) + "\n", inline: true },
        { name: 'Dealer Hand', value: dealer_cards + "\nValue: " + dealer_value, inline: true },
        { name: "\n" + title, value: description }
      )
      .setFooter({ text: "Cards Remaining: " + game.deck.length + " | Gold: " + user.gold, iconURL: 'https://cdn4.iconfinder.com/data/icons/casino-general/512/Stack_of_Cards-512.png' })]};
}

module.exports = blackjack;
