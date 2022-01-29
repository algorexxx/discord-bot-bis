const getRandomInt = require("../../utilities/getRandomInt");
const hangman_words = require("./hangmanwords.json").words;
const hangmanEmbed = require("./hangmanEmbed");
var hangMan = {
  gameState: {
    word: "",
    guessed_letters: [],
    num_replaced_letters: 0,
    result: "",
    wrong_guesses: 0,
    participants: [],
  },
  newGame: async function () {
    this.gameState.guessed_letters = [];
    this.gameState.participants = [];
    this.gameState.num_replaced_letters = 0;
    this.gameState.word =
      hangman_words[getRandomInt(0, hangman_words.length - 1)];

    this.gameState.result = "";
    this.gameState.wrong_guesses = 0;
    for (i = 0; i < this.gameState.word.length; i++) {
      this.gameState.result += ",";
    }
    return hangmanEmbed(
      this.gameState,
      "New hangman game launched. Please use !guess <letter> to guess."
    );
  },
  guess: async function (letter, guesser, db) {
    const userData = db.get("users");
    var correct_guess = false;

    if (
      this.gameState.word.length <= this.gameState.num_replaced_letters ||
      this.gameState.wrong_guesses >= 7
    )
      return "This game ended, to start a new hangman game use !hangman";

    if (this.gameState.guessed_letters.indexOf(letter) != -1) {
      return "This letter has already been tried.";
    }

    if (this.gameState.word.indexOf(letter) == -1)
      this.gameState.wrong_guesses += 1;

    if (this.gameState.participants.indexOf(guesser) == -1)
      this.gameState.participants.push(guesser);

    this.gameState.guessed_letters.push(letter);
    var idx_look = 0;
    while (1) {
      var idx = this.gameState.word.indexOf(letter, idx_look);
      if (idx == -1) {
        break;
      } else {
        this.gameState.num_replaced_letters += 1;
        correct_guess = true;
        idx_look = idx + 1;
        this.gameState.result = this.gameState.result.replaceAt(idx, letter);
      }
    }
    if (
      correct_guess &&
      this.gameState.num_replaced_letters < this.gameState.word.length
    ) {
      await userData.update({ id: guesser }, { $inc: { gold: 50 } });
      return hangmanEmbed(this.gameState, "Nice guess! You won 50 gold!");
    } else if (
      correct_guess &&
      this.gameState.num_replaced_letters == this.gameState.word.length
    ) {
      for (i = 0; i < this.gameState.participants.length; i++) {
        await userData.update(
          { id: this.gameState.participants[i] },
          { $inc: { gold: 200 } }
        );
      }
      return hangmanEmbed(
        this.gameState,
        "Nice guess, word completed! 200 gold has been distributed to each participant"
      );
    } else if (this.gameState.wrong_guesses >= 7) {
      await userData.update({ id: guesser }, { $inc: { gold: -10 } });
      return hangmanEmbed(this.gameState, "Bad guess, rip your man :(..");
    } else {
      await userData.update({ id: guesser }, { $inc: { gold: -10 } });
      return hangmanEmbed(this.gameState, "Bad guess!");
    }
  },
};

module.exports = hangMan;
