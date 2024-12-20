const { MessageEmbed } = require('discord.js');

function songEmbed(songs, fun_title) {
  var song_embed = {
    embed: {
      title: songs[0].title,
      description:
        "Duration: " +
        secondsToTime(songs[0].duration) +
        " | Requested: " +
        songs[0].times_requested +
        " times\n[[Youtube]](https://youtu.be/" +
        songs[0].id +
        ") | [[Discogs]](https://www.discogs.com/search/?q=" +
        songs[0].title.replace(/ /g, "+").replace(/[\(\)]/g, "") +
        "&type=all)",
      color: 12516453,
      thumbnail: {
        url: songs[0].thumbnail,
      },
      author: {
        name: "Music Lovers: " + fun_title[0],
        icon_url:
          "https://cdn1.iconfinder.com/data/icons/google_jfk_icons_by_carlosjj/512/music.png",
      },
    },
  };

  if (songs.length > 1) {
    song_embed.embed.fields = [
      {
        name: "\n\n:notes: " + fun_title[1],
        value: "",
      },
    ];
  }
  songslength = songs.length;
  for (j = 0; j < Math.ceil((songs.length - 1) / 10); j++) {
    if (songslength > 11) idx = 11;
    else idx = songslength;

    songslength -= 10;

    if (j != 0) song_embed.embed.fields[j] = { name: "-", value: "" };

    for (i = 1; i < idx; i++) {
      if (i + j * 10 < 10) num_str = " " + (i + j * 10);
      else num_str = i + j * 10;
      song_disp = songs[i + j * 10].title
        .replace(/[\[\]]/g, "")
        .replace(/\(/g, "\\(")
        .replace(/\)/g, "\\)");
      if (song_disp.length > 50) song_disp = song_disp.substring(0, 47) + "...";
      song_embed.embed.fields[j].value +=
        "``*" +
        num_str +
        ":`` [" +
        song_disp +
        "](https://youtu.be/" +
        songs[i + j * 10].id +
        ") (" +
        secondsToTime(songs[i + j * 10].duration) +
        ")\n";
    }
  }

  const songEmbed = new MessageEmbed()
    .setColor('#BEFC65')
    .setTitle(songs[0].title)
    .setURL('https://discord.js.org/')
    .setAuthor({ name: "Music Lovers: " + fun_title[0], iconURL: "https://cdn1.iconfinder.com/data/icons/google_jfk_icons_by_carlosjj/512/music.png" })
    .setDescription("Duration: " +
      secondsToTime(songs[0].duration) +
      " | Requested: " +
      songs[0].times_requested +
      " times\n[[Youtube]](https://youtu.be/" +
      songs[0].id +
      ") | [[Discogs]](https://www.discogs.com/search/?q=" +
      songs[0].title.replace(/ /g, "+").replace(/[\(\)]/g, "") +
      "&type=all)")
    .setThumbnail(songs[0].thumbnail);

  if (song_embed.embed.fields) {
    song_embed.embed.fields.forEach(field => {
      songEmbed.addFields({ name: field.name, value: field.value });
    });
  }


  return { embeds: [songEmbed] };
}

function topSongsEmbed(start_number, end_number, all_music_ever_sorted) {
  let songs = all_music_ever_sorted;
  var top_songs_embed = {
    embed: {
      color: 8455575,
      footer: {
        icon_url: "http://i.imgur.com/dWBfiT6.png",
        text: "Total number of songs: " + all_music_ever_sorted.length,
      },
      author: {
        name:
          "Music Lovers: Top " +
          (start_number + 1) +
          "-" +
          end_number +
          " Songs",
        icon_url:
          "https://cdn1.iconfinder.com/data/icons/google_jfk_icons_by_carlosjj/512/music.png",
      },
      fields: [
        {
          name:
            "...................................................................................................................................................1-10",
          value:
            "1: Nattali Rize - One People [sssssssssssOfficial Video 2017] - (4:22) - 28 reqs\n1: Nattali Rize - One People [Official Video 2017] - (4:22) - 28 reqs\n1: Nattali Rize - One People [Official Video 2017] - (4:22) - 28 reqs\n1: Nattali Rize - One People [Official Video 2017] - (4:22) - 28 reqs\n1: Nattali Rize - One People [Official Video 2017] - (4:22) - 28 reqs\n1: Nattali Rize - One People [Official Video 2017] - (4:22) - 28 reqs\n1: Nattali Rize - One People [Official Video 2017] - (4:22) - 28 reqs\n1: Nattali Rize - One People [Official Video 2017] - (4:22) - 28 reqs\n1: Nattali Rize - One People [Official Video 2017] - (4:22) - 28 reqs\n1: Nattali Rize - One People [Official Video 2017] - (4:22) - 28 reqs\n1: Nattali Rize - One People [Official Video 2017] - (4:22) - 28 reqs\n1: Nattali Rize - One People [Official Video 2017] - (4:22) - 28 reqs\n1: Nattali Rize - One People [Official Video 2017] - (4:22) - 28 reqs\n1: Nattali Rize - One People [Official Video 2017] - (4:22) - 28 reqs\n",
        },
      ],
    },
  };

  // msg += (i+1)+25*j + ": " + all_music_ever_sorted[i+25*j].title + " - (" + secondsToTime(all_music_ever_sorted[i+25*j].duration) + ") - " + all_music_ever_sorted[i+25*j].times_requested + " reqs\n";

  for (i = 0; i < Math.ceil(end_number / 10 - start_number / 10); i++) {
    top_songs_embed.embed.fields[i] = {
      name:
        "................................................................................................................................." +
        ((i + 1) * 10 - 9 + start_number) +
        "-" +
        ((i + 1) * 10 + start_number),
      value: "",
    };

    if ((i + 1) * 10 >= end_number - start_number)
      idx = end_number - start_number - i * 10;
    else idx = 10;

    for (j = 0; j < idx; j++) {
      song_num = j + 1 + i * 10 + start_number;
      song_idx = song_num - 1;
      if (songs[song_idx].title.length > 55) {
        song_title = songs[song_idx].title.substring(0, 52) + "...";
      } else {
        song_title = songs[song_idx].title;
      }

      song_dur = secondsToTime(songs[song_idx].duration);
      top_songs_embed.embed.fields[i].value +=
        song_num +
        ": " +
        song_title +
        " (" +
        song_dur +
        ") - " +
        songs[song_idx].times_requested +
        " reqs\n";
    }
  }

  const topSongsEmbed = new MessageEmbed()
    .setColor('#810597')
    .setAuthor({
      name: "Music Lovers: Top " +
        (start_number + 1) +
        "-" +
        end_number +
        " Songs", iconURL: 'https://cdn1.iconfinder.com/data/icons/google_jfk_icons_by_carlosjj/512/music.png'
    })
    .setFooter({ text: "Total number of songs: " + all_music_ever_sorted.length, iconURL: 'http://i.imgur.com/dWBfiT6.png' });

  if (top_songs_embed.embed.fields) {
    top_songs_embed.embed.fields.forEach(field => {
      topSongsEmbed.addFields({ name: field.name, value: field.value });
    });
  }

  return { embeds: [topSongsEmbed] };
}

function secondsToTime(secs) {
  var hours = Math.floor(secs / (60 * 60));

  var divisor_for_minutes = secs % (60 * 60);
  var minutes = Math.floor(divisor_for_minutes / 60);

  var divisor_for_seconds = divisor_for_minutes % 60;
  var seconds = Math.ceil(divisor_for_seconds);

  string = "";
  let hours_string;
  if (hours > 0) {
    hours_string = hours + ":";
  } else {
    hours_string = "";
  }
  let minutes_string;
  if (minutes > 0 && minutes < 10 && hours > 0) {
    minutes_string = "0" + minutes + ":";
  } else if (minutes > 0) {
    minutes_string = minutes + ":";
  } else if (hours > 0) {
    minutes_string = "00:";
  } else {
    minutes_string = "";
  }
  let seconds_string;
  if (seconds > 0 && seconds < 10 && (minutes > 0 || hours > 0)) {
    seconds_string = "0" + seconds + "";
  } else if (seconds > 0 && (minutes > 0 || hours > 0)) {
    seconds_string = seconds + "";
  } else if (seconds > 0) {
    seconds_string = seconds + "s";
  } else if (hours > 0 || minutes > 0) {
    seconds_string = "00";
  } else {
    seconds_string = "0s";
  }

  return hours_string + minutes_string + seconds_string;
}

exports.songEmbed = songEmbed;
exports.topSongsEmbed = topSongsEmbed;
