const { MessageEmbed } = require('discord.js');

async function hangmanEmbed(gamestate, message) {
  hangman_imgs = [
    "https://i.imgur.com/C1eH0cQ.png",
    "https://i.imgur.com/5ElswsN.png",
    "https://i.imgur.com/W5hA5vP.png",
    "https://i.imgur.com/npXITPO.png",
    "https://i.imgur.com/V1TQnXR.png",
    "https://i.imgur.com/Y70WAMH.png",
    "https://i.imgur.com/DtGmd9N.png",
    "https://i.imgur.com/Dw3gHpR.png",
  ];

  let guessedLetters = "";
  for (i = 0; i < gamestate.guessed_letters.length; i++) {
    guessedLetters += gamestate.guessed_letters[i] + ", ";
  }
  if (guessedLetters == "")
    guessedLetters = "None";

  const hangmanEmbed = new MessageEmbed()
    .setColor('#74008B')
    .setAuthor({ name: 'Hangman', iconURL: 'https://img.utdstc.com/icon/50a/285/50a28521de117c0e6e257c2c5d334134ab791677619a4cd8ae932c8fc4350d0c:200' })
    .setDescription('Try not to hang the poor man.')
    .addFields(
      { name: 'Status:', value: message },
      { name: 'Word:', value: gamestate.result.replaceAll(",", "\\_ ") },
      { name: 'Tried letters:', value: guessedLetters, inline: true },
      {
        name: 'Right/Wrong Guesses', value: gamestate.guessed_letters.length -
          gamestate.wrong_guesses +
          "/" +
          gamestate.wrong_guesses, inline: true
      },
    )
    .setImage(hangman_imgs[gamestate.wrong_guesses])
    .setFooter({ text: 'Incorrect: -10 gold | Correct: +50 gold | Completed word: +200 gold to all.', iconURL: 'https://img.utdstc.com/icon/50a/285/50a28521de117c0e6e257c2c5d334134ab791677619a4cd8ae932c8fc4350d0c:200' });

  return { embeds: [hangmanEmbed] };
}

String.prototype.replaceAt = function (index, replacement) {
  return (
    this.substr(0, index) +
    replacement +
    this.substr(index + replacement.length)
  );
};

String.prototype.replaceAll = function (search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, "g"), replacement);
};

module.exports = hangmanEmbed;
