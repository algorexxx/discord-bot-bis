var download = function (uri, filename, callback, req, fs) {
  req.head(uri, function (err, res, body) {
    if (!res) {
      callback("error");
      return;
    } else if (!res.headers["content-type"].match("image/")) {
      callback("No image");
      return;
    }

    req(uri)
      .pipe(
        fs.createWriteStream(
          filename + "." + res.headers["content-type"].replace("image/", "")
        )
      )
      .on("close", callback);
  });
};

module.exports = download;
