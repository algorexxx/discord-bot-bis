const fs = require("fs");

async function backup(db) {
  const userData = db.get("users");
  const ebData = db.get("eyebleach");
  const funData = db.get("fun");
  const hebData = db.get("hoteyebleach");
  const songData = db.get("songs");

  let data = [
    { data: await userData.find({}), name: "users" },
    { data: await ebData.find({}), name: "ebs" },
    { data: await hebData.find({}), name: "hebs" },
    { data: await funData.find({}), name: "funs" },
    { data: await songData.find({}), name: "songs" },
  ];

  if (!fs.existsSync('./olddb')){
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

  console.log("done");
}

module.exports = backup;
