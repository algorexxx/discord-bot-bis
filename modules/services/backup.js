const fs = require("fs");
const { findAll } = require("./mongodbService");

async function backup() {
  const userData = await findAll("users");
  const ebData = await findAll("eyebleach");
  const funData = await findAll("fun");
  const hebData = await findAll("hoteyebleach");
  const songData = await findAll("songs");

  let data = [
    { data: userData, name: "users" },
    { data: ebData, name: "ebs" },
    { data: hebData, name: "hebs" },
    { data: funData, name: "funs" },
    { data: songData, name: "songs" },
  ];

  if (!fs.existsSync('./olddb')) {
    fs.mkdirSync('./olddb', { recursive: true });
  }

  // stringify JSON Object
  data.forEach(function (d) {
    var jsonContent = JSON.stringify(d.data);

    fs.writeFile(
      "./olddb/backup" + d.name + ".json",
      jsonContent,
      "utf8",
      function (err) {
        if (err) {
          console.log(
            "An error occured while writing JSON Object to File.",
            d.name
          );
          return console.log(err);
        }

        console.log(d.name + " JSON file has been saved.");
      }
    );
  });
}

module.exports = backup;
