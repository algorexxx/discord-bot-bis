const settings = require('../../../botSettings');
const { getAllUsers } = require("../../services/userService");
const minutesToDisplayString = require("../../utilities/minutesToDisplayString")

// const data = {
//     voiceChannels: new Map(),
//     gold: { header: header, data: [] }
// }

async function getGlobalStats(client, argument) {
    const data = {};
    const lookups = await getLookups(client);
    const users = await getAllUsers();

    users.forEach(user => {
        loadDataBasedOnArgument(user, argument, data, lookups);
    });

    Object.keys(data).forEach(dataProperty => {
        logShit(data[dataProperty], lookups);
    });
}

function loadDataBasedOnArgument(user, argument, data, lookups){
    if (!argument || argument == "channels"){
        loadSimpleProperty("GODLERS", "online_mins", user, data);
        loadChannels("voiceChannels", user, data, lookups, minutesToDisplayString);
        loadChannels("textChannels", user, data, lookups);
    }

    if (argument == "gold"){
        loadSimpleProperty("gold", user, data);
    }

    if (argument == "gambling"){
        loadSimpleProperty("blackjack_bjs", user, data);
        loadSimpleProperty("blackjack_hands", user, data);
        loadSimpleProperty("blackjack_ties", user, data);
        loadSimpleProperty("blackjack_wins", user, data);
        loadSimpleProperty("coinflips_lost", user, data);
        loadSimpleProperty("coinflips_won", user, data);
    }

    if (argument == "images"){
        loadSimpleProperty("eb_added", user, data);
        loadSimpleProperty("eb_watched", user, data);
        loadSimpleProperty("fun_added", user, data);
        loadSimpleProperty("fun_watched", user, data);
        loadSimpleProperty("heb_added", user, data);
        loadSimpleProperty("heb_watched", user, data);
    }

    if (argument == "music"){
        loadSimpleProperty("music_reqs", user, data);
        loadSimpleProperty("music_skips", user, data);
        loadSimpleProperty("music_stops", user, data);
    }
}

function logShit(shit, lookups){
    const getType = obj => Object.prototype.toString.call(obj).slice(8, -1);
    const isMap = obj => getType(obj) === 'Map';

    if (isMap(shit)){
        shit.forEach(channel => {
            logSimpleProperty(channel, lookups, channel.valueTransform)
        });
        return;
    }

    logSimpleProperty(shit, lookups);
}

function logSimpleProperty(dataContainer, lookups, valueTransform) {
    const sortedValues = dataContainer.data.sort((a, b) => b.value - a.value);
    console.log(dataContainer.header);
    sortedValues.forEach(valueUser => {
        const username = lookups.users.get(valueUser.userId);
        const usernameString = username ? username : valueUser.userId;
        const valueString = valueTransform ? valueTransform(valueUser.value) : valueUser.value;
        console.log(usernameString + ": " + valueString);
    });
}

function loadSimpleProperty(header, property, user, data) {
    if (!user[property]) {
        return;
    }

    if (!data[property]) {
        data[property] = { header: header, data: [] };
    }

    data[property].data.push({ userId: user.id, value: user[property] });
}

function loadChannels(dataProperty, user, data, lookups, valueTransform) {
    if (!user[dataProperty]) {
        return;
    }

    if (!data[dataProperty]) {
        data[dataProperty] = new Map();
    }

    Object.keys(user[dataProperty]).forEach(voiceChannelId => {
        if (!data[dataProperty].has(voiceChannelId)) {
            const dataContainer = { 
                header: lookups.channels.get(voiceChannelId), 
                data: [], 
                valueTransform: valueTransform 
            };
            data[dataProperty].set(voiceChannelId, dataContainer);
        }

        const voiceChannel = data[dataProperty].get(voiceChannelId)
        voiceChannel.data.push({ userId: user.id, value: user[dataProperty][voiceChannelId] });
    })
}

async function getLookups(client) {
    const guild = await client.guilds.fetch(settings.GUILD_ID);

    const channels = await guild.channels.fetch();
    const channelLockup = new Map();
    channels.forEach(channel => {
        channelLockup.set(channel.id, channel.name);
    });

    const members = await guild.members.fetch();
    const userLockup = new Map();
    members.forEach(member => {
        userLockup.set(member.user.id, member.user.username);
    });

    return {
        channels: channelLockup,
        users: userLockup
    }
}



module.exports = getGlobalStats;