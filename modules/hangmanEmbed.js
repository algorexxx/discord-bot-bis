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
  var hangman_embed = {
    embed: {
      description: "Try not to hang the poor man.",
      color: 7602315,
      footer: {
        icon_url:
          "https://lh3.googleusercontent.com/proxy/AhINvUVcih5V6DXJrNWVUpDljoeH3ZPSeB43Ot4xS6rWdgRBjtKaUujl_TI-kiTENn7y2M6PjJpSDuQAw-j_x3DafOAyUoPlAqEZeZYx_dArZ5qLwgmOacyw",
        text:
          "Incorrect: -10 gold | Correct: +50 gold | Completed word: +200 gold to all.",
      },
      image: {
        url: hangman_imgs[gamestate.guessed_letters],
      },
      author: {
        name: "Hangman",
        url: "https://discordapp.com",
        icon_url:
          "https://lh3.googleusercontent.com/proxy/AhINvUVcih5V6DXJrNWVUpDljoeH3ZPSeB43Ot4xS6rWdgRBjtKaUujl_TI-kiTENn7y2M6PjJpSDuQAw-j_x3DafOAyUoPlAqEZeZYx_dArZ5qLwgmOacyw",
      },
      fields: [
        {
          name: "Status:",
          value: message,
        },
        {
          name: "Word:",
          value: gamestate.result.replaceAll(",", "\\_ "),
        },
        {
          name: "Tried letters:",
          value: "",
          inline: true,
        },
        {
          name: "Right/Wrong Guesses",
          value:
            gamestate.guessed_letters.length -
            gamestate.wrong_guesses +
            "/" +
            gamestate.wrong_guesses,
          inline: true,
        },
      ],
    },
  };

  for (i = 0; i < gamestate.guessed_letters.length; i++) {
    hangman_embed.embed.fields[2].value += gamestate.guessed_letters[i] + ", ";
  }
  if (hangman_embed.embed.fields[2].value == "")
    hangman_embed.embed.fields[2].value = "None";

  hangman_embed.embed.image.url = hangman_imgs[gamestate.wrong_guesses];

  return hangman_embed;
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
