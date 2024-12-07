const { MessageEmbed } = require('discord.js');
const settings = require('../../../botSettings');
const { getAllUsers } = require("../../services/userService");
const minutesToDisplayString = require("../../utilities/minutesToDisplayString")

async function getGlobalStats(client, argument) {
    const data = {};
    const lookups = await getLookups(client);
    const users = await getAllUsers();

    users.forEach(user => {
        loadDataBasedOnArgument(user, argument, data, lookups);
    });

    return { embeds: buildEmbeds(data, lookups) };
}

function buildEmbeds(data, lookups){
    const embeds = []

    Object.keys(data).forEach(dataProperty => {
        const group = data[dataProperty];
        Object.keys(group.data).forEach(groupDataKey => {
            const embed = new MessageEmbed()
                .setColor('#57A500')
                .setTitle(group.data[groupDataKey].header)
                .setAuthor({ name: "Stats machine <3", iconURL: "http://files.softicons.com/download/system-icons/phuzion-icons-by-kyo-tux/png/256/Stats.png" });
            const sortedValues = group.data[groupDataKey].data.sort((a, b) => b.value - a.value);
            let simpleNameString = "";
            let simpleValueString = "";
            let i = 1;
            sortedValues.forEach(valueUser => {
                const username = lookups.users.get(valueUser.userId);
                const usernameString = username ? username : valueUser.userId;
                const valueString = group.data[groupDataKey].valueTransform ? group.data[groupDataKey].valueTransform(valueUser.value) : valueUser.value;
                simpleNameString = simpleNameString + i + "\: " + usernameString + "\n";
                simpleValueString = simpleValueString + valueString + "\n";
                i++;
            });
            embed.addFields({
                name: "User",
                value: simpleNameString,
                inline: true
            })
            embed.addFields({
                name: group.data[groupDataKey].header,
                value: simpleValueString,
                inline: true
            })
            embeds.push(embed);
        })
    });

    return embeds;
}

function logStatsData(data, lookups) {
    Object.keys(data).forEach(dataProperty => {
        console.log("");
        const group = data[dataProperty];
        console.log(group.header);
        Object.keys(group.data).forEach(groupDataKey => {
            console.log("");
            logSimpleProperty(group.data[groupDataKey], lookups, group.data[groupDataKey].valueTransform);
        })
    });
}

function getGroupData(header, data) {
    if (!data[header]) {
        data[header] = { header: header, data: {} };
    }

    return data[header].data;
}

function loadDataBasedOnArgument(user, argument, data, lookups) {
    if (!argument || argument == "general") {
        loadSimpleProperty("Gold", "gold", user, getGroupData("General", data), v => v + " gold");
        loadSimpleProperty("Time in voice chat", "online_mins", user, getGroupData("General", data), minutesToDisplayString);
    }

    if (argument == "channels") {
        loadChannels("Voice channels", "voiceChannels", user, data, lookups, minutesToDisplayString);
        loadChannels("Text channel", "textChannels", user, data, lookups, v => v + " messages");
    }

    if (argument == "gambling") {
        const groupData = getGroupData("Gambling", data);
        loadSimpleProperty("Black Jacks", "blackjack_bjs", user, groupData);
        loadSimpleProperty("Black jack hands", "blackjack_hands", user, groupData);
        loadSimpleProperty("Black jack ties", "blackjack_ties", user, groupData);
        loadSimpleProperty("Black jack wins", "blackjack_wins", user, groupData);
        loadSimpleProperty("Coinflips lost", "coinflips_lost", user, groupData);
        loadSimpleProperty("Coinflips won", "coinflips_won", user, groupData);
    }

    if (argument == "images") {
        const groupData = getGroupData("Images", data);
        loadSimpleProperty("Eye bleach added", "eb_added", user, groupData);
        loadSimpleProperty("Eye bleach watched", "eb_watched", user, groupData);
        loadSimpleProperty("Fun added", "fun_added", user, groupData);
        loadSimpleProperty("Fun watched", "fun_watched", user, groupData);
        loadSimpleProperty("Hot eye bleach added", "heb_added", user, groupData);
        loadSimpleProperty("Hot eye bleach watched", "heb_watched", user, groupData);
    }

    if (argument == "music") {
        const groupData = getGroupData("Music", data);
        loadSimpleProperty("Music requests", "music_reqs", user, groupData);
        loadSimpleProperty("Music skips", "music_skips", user, groupData);
        loadSimpleProperty("Music stops", "music_stops", user, groupData);
    }
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

function getSimplePropertyString(dataContainer, lookups, valueTransform) {
    const sortedValues = dataContainer.data.sort((a, b) => b.value - a.value);
    let simpleString = "";
    sortedValues.forEach(valueUser => {
        const username = lookups.users.get(valueUser.userId);
        const usernameString = username ? username : valueUser.userId;
        const valueString = valueTransform ? valueTransform(valueUser.value) : valueUser.value;
        simpleString = simpleString + usernameString + ": " + valueString + "\n";
    });

    return simpleString;
}

function loadSimpleProperty(header, property, user, data, valueTransform) {
    if (!user[property]) {
        return;
    }

    if (!data[property]) {
        data[property] = { header: header, data: [], valueTransform: valueTransform };
    }

    data[property].data.push({ userId: user.id, value: user[property] });
}

function loadChannels(groupHeader, dataProperty, user, data, lookups, valueTransform) {
    if (!data[dataProperty]) {
        data[dataProperty] = { header: groupHeader, data: {} };
    }
    data = data[dataProperty].data;
    if (!user[dataProperty]) {
        return;
    }

    Object.keys(user[dataProperty]).forEach(voiceChannelId => {
        if (!data[voiceChannelId]) {
            const dataContainer = {
                header: lookups.channels.get(voiceChannelId),
                data: [],
                valueTransform: valueTransform
            };
            data[voiceChannelId] = dataContainer;
        }

        data[voiceChannelId].data.push({ userId: user.id, value: user[dataProperty][voiceChannelId] });
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
        userLockup.set(member.user.id, member.displayName);
    });

    return {
        channels: channelLockup,
        users: userLockup
    }
}

module.exports = getGlobalStats;