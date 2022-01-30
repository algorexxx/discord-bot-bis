const { MessageEmbed } = require('discord.js');

function helpEmbed() {
  return new MessageEmbed()
	.setColor('#4A90E2')
	.setTitle('Available commands:')
	.setAuthor({ name: 'Help? U want me to chew ur food aswell?', iconURL: 'https://cdn2.iconfinder.com/data/icons/flat-style-svg-icons-part-1/512/confirmation_verification-512.png'})
	.setDescription('!bitconneeeeeeeect  -  100x ur life savings!')
	.addFields(
		{ name: 'Eyebleach:', value: '!eyebleach (!eb)  -  Overwrite something that cannot be unseen.\n!eyebleach <image_url> (!eb <url>)  -  *Add image to eyebleach (gif/jpg/png)' },
		{ name: 'Hot Eyebleach:', value: '!hoteyebleach (!heb) - Overwrite something that cannot be unseen.\n!hoteyebleach <image_url> (!heb <url>)  -  Add image to hot eyebleach (gif/jpg/png)' },
		{ name: 'Fun:', value: '!fun  -  lol.\n!fun <image_url>  -  Add a funny image to fun. (gif/jpg/png)' },
		{ name: 'Music Lovers:', value: '!play - Start playing music from the queue unless its empty.\n!play <youtube_link> - Add Youtube video to music queue\n!skip - Skip current song\n!stop - Stop playing music.\n!queue - Show entire music queue.'},
    { name: 'Gambling:', value: '!coinflip - Create new coinflips or join someone elses.\n!blackjack - Challenge the house in a game of blackjack.' },
	);
}

module.exports = helpEmbed;
