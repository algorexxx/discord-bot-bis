module.exports = {
    "apps" : [{
        "name": "bot-bish",
        "script": "node ./botv2.js",
        "watch": true,
        "env": {
            "DISCORD_TOKEN": "",
            "DISCORD_ADMIN_ID": "",
            "DISCORD_CLIENT_ID": "",
            "DISCORD_GUILD_ID": ""
        }
    }]
}