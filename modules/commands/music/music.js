const { songEmbed, topSongsEmbed } = require("./musicEmbeds");
const {
  joinVoiceChannel,
  getVoiceConnection,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  NoSubscriberBehavior } = require('@discordjs/voice');
const YTDL = require("@distube/ytdl-core");
var queue = [];
const { findOne, insert, findAllSorted, incrementOne } = require("../../services/mongodbService");
const { incrementUser, getUser } = require("../../services/userService");
const fs = require("fs");
let agent;
try { agent = YTDL.createAgent(JSON.parse(fs.readFileSync("cookies.json"))); } catch(e){}

const COLLECTION_NAME = "songs";

let player;

async function music(message, command, args, client) {
  const user = await getUser(message.author.id);
  switch (command.toLowerCase()) {
    case "play":
      if (!args[0] && queue.length < 1) {
        message.channel.send("Please post a youtube video.");
        return;
      }
      if (!message.member.voice.channel) {
        message.channel.send("You must be in a voicechat to play music.");
        return;
      }

      if (!args[0]) {
        if (!(message.guild.voiceStates.cache.get(client.user.id) || {}).channelID) {
          play(message);
        }
        return;
      }

      var expression = /(top)\s*([0-9]*)/gi;

      var match = expression.exec(args[0]);

      if (match) {
        let all_music_ever_sorted = await findAllSorted(
          { times_requested: -1 },
          COLLECTION_NAME
        );
        arg_no = 1;
        invalid_top_song = 0;
        songs_cost = 0;
        added_songs = 0;
        while (args[arg_no]) {
          top_song = parseInt(args[arg_no]);
          arg_no += 1;

          if (top_song < 1 || top_song > all_music_ever_sorted.length) {
            invalid_top_song += 1;
          } else {
            queue.push(all_music_ever_sorted[top_song - 1]);
            if (
              !(message.guild.voiceStates.cache.get(client.user.id) || {})
                .channelID
            ) {
              play(message);
            }

            await incrementOne(
              { id: all_music_ever_sorted[top_song - 1].id },
              { times_requested: 1 },
              COLLECTION_NAME);
            if (all_music_ever_sorted[top_song - 1].duration > 6000) {
              songs_cost += 500;
            } else if (all_music_ever_sorted[top_song - 1].duration < 360) {
              songs_cost += 30;
            } else {
              songs_cost += Math.round(
                (all_music_ever_sorted[top_song - 1].duration * 10) / 120
              );
            }
            added_songs += 1;
            user.music_reqs += 1;
          }
        }
        await incrementUser(
          user.id,
          { gold: -songs_cost, music_reqs: added_songs }
        );
        user.gold -= songs_cost;
        if (added_songs == 1) {
          message.channel.send(
            all_music_ever_sorted[top_song - 1].title +
            " - added to queue at a cost of " +
            songs_cost +
            " gold!"
          );
        } else if (added_songs == 0) {
          message.channel.send(
            "No songs were added to queue. (" +
            invalid_top_song +
            " invalid songs)"
          );
        } else {
          message.channel.send(
            added_songs +
            " songs was added to queue at a total cost of " +
            songs_cost +
            " gold! (" +
            invalid_top_song +
            " invalid songs)"
          );
        }
        return;
      }

      arg_no = 0;
      num_of_links = 0;
      added_songs = 0;
      while (args[arg_no]) {
        num_of_links += 1;
        arg_no += 1;
      }
      arg_no = 0;

      var expression = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/gi;

      var match = expression.exec(args[arg_no]);
      if (!match) {
        message.channel.send("Please post a youtube video.");
      } else {
        var song_id = match[7];
      }
      if (!song_id) {
        message.channel.send("Please post a youtube video.");
      } else {
        let song = await findOne({ id: song_id }, COLLECTION_NAME);
        if (!song) {
          let vinfo;
          try {
            try {
              vinfo = await YTDL.getBasicInfo(args[arg_no], { agent });
            } catch (e){
              vinfo = await YTDL.getBasicInfo(args[arg_no]);
            }
          } catch (e) {
            message.channel.send("Couldnt get: " + song_id + " - Cookie expired?");
            return;
          }

          song = {
            id: song_id,
            title: vinfo.videoDetails.title,
            views: vinfo.videoDetails.viewCount,
            thumbnail: vinfo.videoDetails.thumbnails[0].url,
            duration: vinfo.videoDetails.lengthSeconds,
            requester: message.author.id,
            times_requested: 1,
          };
          await insert(song, COLLECTION_NAME);
        } else {
          await incrementOne(
            { id: song.id },
            { times_requested: 1 },
            COLLECTION_NAME
          );
        }

        queue.push(song);

        let song_cost;
        if (song.duration > 6000) {
          song_cost = 500;
        } else if (song.duration < 360) {
          song_cost = 30;
        } else {
          song_cost = Math.round(((song.duration || 360) * 10) / 120);
        }

        await incrementUser(
          user.id,
          { gold: -song_cost, music_reqs: 1 }
        );
        if (!(message.guild.voiceStates.cache.get(client.user.id) || {}).channelID) {
          play(message);
        }
        message.channel.send("Music added to queue at a cost of " + song_cost + " gold!");
      }

      break;

    case "skip":
      if (queue[0]) {
        let _song = queue[0];

        let skip_cost = Math.round(
          (_song.duration || 300) * -0.0515464 + 309.27835
        );

        if (skip_cost > 300) {
          skip_cost = 300;
        } else if (skip_cost < 0) {
          skip_cost = 0;
        }

        if (player) {
          if (user.gold < skip_cost) {
            message.channel.send(
              "Err. You cant afford to skip song. (Need: " +
              skip_cost +
              " Have: " +
              user.gold +
              ")"
            );
          } else {
            await incrementUser(
              user.id,
              { gold: -skip_cost, music_skips: 1 }
            );
            message.channel.send("Song skipped for " + skip_cost + " gold.");
            queue.shift();
            play(message, "skip");
          }
        }
      }
      break;
    case "pause":
      await incrementUser(user.id, { gold: -10 });
      player.pause();
      message.channel.send("Music paused for " + 10 + " gold.");
      break;
    case "resume":
      await incrementUser(user.id, { gold: -5 });
      player.unpause();
      message.channel.send("Music resumed for " + 5 + " gold.");
      break;

    case "stop":
      if (
        !(message.guild.voiceStates.cache.get(client.user.id) || {}).channelID
      ) {
        if (user.gold < -1000) {
          message.channel.send("Err. You cant afford to stop & clear queue. (Need: 150 Have: " + user.gold + ")");
        } else {
          queue = [];
          let connection = getVoiceConnection(message.guild.id);
          connection.disconnect();
          await incrementUser(
            user.id,
            { gold: -100, music_stops: 1 }
          );
        }
      }
      break;

    case "queue":
    case "nowplaying":
      if (queue.length > 0) {
        message.channel.send(songEmbed(queue, ["Now Playing", "Queue"]));
      } else {
        message.channel.send("Queue is empty");
      }
      break;

    case "top":
      if (!parseInt(args[1]) || parseInt(args[1]) < parseInt(args[0])) {
        start_num = 0;

        num = parseInt(args[0]);
        if (!parseInt(args[0]) || parseInt(args[0]) < 1) {
          num = 20;
        }

        if (num > 200) {
          num = 200;
        }
      } else {
        start_num = parseInt(args[0]) - 1;
        num = parseInt(args[1]);
      }

      let all_music_ever_sorted = await findAllSorted(
        { times_requested: -1 },
        COLLECTION_NAME
      );

      if (num > all_music_ever_sorted.length) {
        num = all_music_ever_sorted.length;
      }

      if (all_music_ever_sorted.length > 0) {
        while (num - start_num > 70) {
          message.channel.send(
            topSongsEmbed(start_num, start_num + 70, all_music_ever_sorted)
          );
          start_num += 70;
        }
        message.channel.send(
          topSongsEmbed(start_num, num, all_music_ever_sorted)
        );
      } else {
        message.channel.send("No toplist found");
      }
      break;
  }
}

function play(message, command) {
  if (((player || {})._state || {}).status === 'playing' && command !== "skip") {
    return;
  }

  let connection = getVoiceConnection(message.guild.id);

  if (((connection || {})._state || {}).status !== 'connected') {
    joinVoiceChannel({
      channelId: message.member.voice.channel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator
    });
    connection = getVoiceConnection(message.guild.id);
  }

  if (!player) {
    player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Play,
      },
    });

    player.on(AudioPlayerStatus.Idle, () => {
      queue.shift();
      if (queue[0]) play(message);
      else connection.disconnect();
    });
  }

  if (queue.length <= 0) {
    player.stop();
    return;
  }

  connection.subscribe(player);

  try {
    let youtubeVideo;
    try {
      youtubeVideo = YTDL("https://youtu.be/" + queue[0].id, { filter: "audioonly", highWaterMark: 1 << 25, agent: agent });
    } catch (e){
      youtubeVideo = YTDL("https://youtu.be/" + queue[0].id, { filter: "audioonly", highWaterMark: 1 << 25 });
    }
    const resource = createAudioResource(youtubeVideo, { inlineVolume: true, highWaterMark: 1 << 25 });
    resource.volume.setVolume(0.2)

    player.play(resource);
  } catch (e) {
    queue.shift();
    if (queue[0]) play(message);
    else connection.disconnect();
    message.channel.send("Couldnt play: " + song_id + " - Cookie expired?");
  }

}

module.exports = music;
