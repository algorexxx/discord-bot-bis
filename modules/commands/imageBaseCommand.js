const imageEmbed = require("../utilities/image");
const getRandomInt = require("../utilities/getRandomInt");
const { findOne, updateOne, findAll, getNextId, remove } = require("../services/mongodbService");
const { incrementUser } = require("../services/userService");
const { downloadImageFile, removeImageFile } = require("../utilities/download");

async function viewImage(message, client, user, parameters) {
    const existingImages = await findAll(parameters.imageGenre);
    if (existingImages.length <= 0) {
        message.reply("No " + parameters.imageGenre + " found");
        return;
    } else {
        const display_image = existingImages[getRandomInt(0, existingImages.length - 1)];
        const owner = (await client.users.fetch(display_image.owner)).username;
        await incrementUser(user.Id, parameters.watchIncrement);
        message.reply({
            embeds: [
                await imageEmbed(
                    display_image,
                    owner,
                    parameters.embedTitle,
                    parameters.embedImage,
                )]
        });
    }
}

async function addImage(url, message, user, parameters) {
    const existingImage = await findOne({ url: url }, parameters.imageGenre);

    if (existingImage) {
        message.reply("Duplicate image, try another one!");
    }

    const newImageId = await getNextId(parameters.imageGenre);

    downloadImageFile(
        url,
        newImageId,
        parameters.imageGenre,
        async function (res) {
            if (!res) {
                await updateOne({ id: newImageId }, { id: newImageId, url: url, owner: message.author.id }, parameters.imageGenre);
                message.reply("Image added to " + parameters.imageGenre + "!");
                await incrementUser(user.id, { gold: 100, fun_added: 1 });
            } else {
                message.reply(res);
            }
        }
    );
}

async function removeImage(id, message, parameters) {
    const existingImage = await findOne({ id: id }, parameters.imageGenre);
    if (!existingImage) {
        message.reply("ID: " + id + "does not exist.");
    } else {
        await incrementUser(existingImage.owner, { gold: -150, fun_added: -1 });
        removeImageFile(existingImage, parameters.imageGenre);
        await remove({ id: existingImage.id }, parameters.imageGenre);

        message.reply(
            parameters.imageGenre + " image with id: " + id + " has been removed."
        );
    }
}

module.exports = { viewImage: viewImage, addImage: addImage, removeImage: removeImage };