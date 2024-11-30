const {getUser} = require("./modules/services/userService");



async function main(){
    const user = await getUser(666);

    console.log(user.gold);
}

main();