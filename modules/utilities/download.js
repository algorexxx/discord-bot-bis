const req = require("request");
var fs = require("fs");

var download = function (uri, filename, callback) {
  req.head(uri, function (err, res, body) {
    if (!res) {
      callback("error: ", err + body);
      return;
    } else if (!res.headers["content-type"].match(/(image\/|video\/mp4)/)) {
      callback("No image");
      return;
    }

    req(uri)
      .pipe(
        fs.createWriteStream(
          filename +
            "." +
            res.headers["content-type"]
              .replace("image/", "")
              .replace("video/", "")
        )
      )
      .on("close", callback);
  });
};

module.exports = download;
