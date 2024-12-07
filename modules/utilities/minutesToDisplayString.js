function minutesToDisplayString(totalMinutes){
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes - (hours * 60);
    return hours + "h " + minutes + "m";
}

module.exports = minutesToDisplayString;