const req = require("request");
var fs = require("fs");

function downloadImageFile(uri, id, genre, callback) {
  req.head(uri, function (err, res, body) {
    if (!res) {
      callback("error: ", err + body);
      return;
    } else if (!res.headers["content-type"].match(/(image\/|video\/mp4)/)) {
      callback("No image");
      return;
    }

    fs.mkdir("./images/" + genre, { recursive: true }, (err) => {
      if (err) throw err;
    });

    req(uri)
      .pipe(
        fs.createWriteStream(
          "./images/" + genre + "/" + id +
          "." +
          res.headers["content-type"]
            .replace("image/", "")
            .replace("video/", "")
        )
      )
      .on("close", callback);
  });
};

function removeImageFile(image, genre) {
  const expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,6}\b(\/.*(jpg|jpeg|png|gif|bmp))/gi;
  const match = expression.exec(image.url);

  if (match) {
    let filetype;
    if (match[2] == "jpg")
      filetype = "jpeg";
    else
      filetype = match[2];

    fs.unlink("./images/" + genre + "/" + image.id + "." + filetype, function () {
      console.log("removed " + genre + " storage file: " + image.id);
    });
  }
}

module.exports = { downloadImageFile: downloadImageFile, removeImageFile: removeImageFile };