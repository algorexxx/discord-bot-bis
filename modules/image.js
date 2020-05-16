async function imageEmbed(image, owner, category, iconurl, db) {
  var image_embed = {
    embed: {
      url: image.url,
      color: 13632027,
      footer: {
        icon_url: iconurl,
        text: "ID: " + image.id + " | Added by: " + owner,
      },
      image: {
        url: image.url,
      },
      author: {
        name: category,
        icon_url: iconurl,
      },
    },
  };
  if (image.description) {
    image_embed.embed.description = "this supports";
  }
  return image_embed;
}

module.exports = imageEmbed;
