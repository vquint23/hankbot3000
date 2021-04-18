require('dotenv').config(); 
const fetch = require('node-fetch');
const Discord = require("discord.js");
const { Client, MessageEmbed } = require('discord.js');
const client = new Discord.Client();
const { DiceRoller } = require('rpg-dice-roller');
const roller = new DiceRoller();
var messageCount = 0;
var messageTarget = getRandomNumber(1, 30);

const colors = [
    "images/1.jpg", "images/2.jpg", "images/3.jpg", "images/4.jpg", "images/5.jpg", 
    "images/black.jpg", "images/black2.jpg", "images/black3.jpg", "images/black4.jpg", "images/black5.jpg",
    "images/blue.jpg", "images/blue2.jpg", "images/blue3.jpg", "images/blue4.jpg",
    "images/chestnut.jpg", "images/chestnut2.jpg", "images/chestnut3.jpg", "images/chestnut4.jpg", "images/chestnut5.jpg", "images/chestnut6.jpg",
    "images/dark brown solid.jpg", "images/dark brown solid2.jpg", "images/dark brown solid3.jpg", "images/dark brown solid4.jpg", "images/dark brown solid5.jpg", "images/dark brown solid6.jpg",
    "images/gray.jpg", "images/gray2.jpg", "images/gray3.jpg", "images/gray4.jpg", "images/gray5.jpg", "images/gray6.jpg",
    "images/light blue.jpg", "images/light blue2.jpg", "images/light blue3.jpg", "images/light blue4.jpg", "images/light blue5.jpg",
    "images/peach.jpg", "images/peach2.jpg", "images/peach3.jpg", "images/peach4.jpg",
    "images/solid black.jpg", "images/solid black2.jpg","images/solid black3.jpg","images/solid black4.jpg","images/solid black5.jpg","images/solid black6.jpg",
    "images/solid chestnut.jpg", "images/solid chestnut2.jpg", "images/solid chestnut3.jpg",
    "images/solid chestnut4.jpg", "images/solid chestnut5.jpg", "images/solid chestnut6.jpg",
    "images/taupe.jpg", "images/taupe2.jpg", "images/taupe3.jpg", "images/taupe4.jpg", "images/taupe5.jpg", "images/taupe6.jpg",
];

var items = ["sword","shield","arrow","rupees","potion","glasses","tea","bat","fork","book","journal","dagger",
    "spellbook","spell components","armor","bag of holding","food","rations","friends","charisma", "contacts",
    "intelligence","strength","constitution","dexterity","wisdom","gout","hit points","dice","mofongo","french fries",
    "messages","spells", "wallet", "bush jerky", "identity", "backstory", "spell slots", "civil liberties", "Primpyre Seaborne", 
    "Hank", "fans", "marketing tactics" ];

var prefix = "bak";

// Ready
client.on("ready", () => {
  console.log("Bak!");
});

/* Embed Factory
    Takes the title, color, author, description, thumbnail, url, image, fieldsData, and footer variables
    Crafts an embed message with these fields. If a field isn't needed, it should be provided as "null".
    Returns the final embed to be sent in the channel
*/
function embedFactory(title, author, description, thumbnail, url, image, fieldsData, footer, files) {
    let embed = new MessageEmbed();
    if(title != null) embed.setTitle(title);
    if(author != null) embed.setAuthor(author);
    if(description != null) embed.setDescription(description);
    if(thumbnail != null) embed.setThumbnail(thumbnail);
    if(url != null) embed.setURL(url);
    if(image != null) embed.setImage(image);
    if(footer != null) embed.setFooter(footer);
    if (fieldsData != null){
        for (var i = 0; i<fieldsData.length; i++){
            if (fieldsData[i][1] === undefined) fieldsData[i][1] = "N/A";
            embed.addField(fieldsData[i][0], fieldsData[i][1], fieldsData[i][2]);
        }
    }
    if (files != null) embed.attachFiles(files);
    embed.setColor(Math.floor(Math.random()*16777215).toString(16))
    return embed;
}

/* Show Help
    Shows the help menu by creating an embed and sending it using the message paramter.
*/
function showHelp(message){
    var title = "Bak bak."
    var description = "Hank currently has these commands:"
    var fieldsData = [
        ["Help", "Opens this help menu.", false],
        ["Ping", "Hank sends back a pong.", false],
        ["Roll", "Use the format \`xdxx +/- x\` to have Hank roll your dice.", false],
        ["Spell", "Search for a spell description using \`spell (name)\`.", false],
        ["Dog", "Hank will provide a picture of a dog.", false]
    ];           
    message.channel.send(embedFactory(title, null, description, null, null, null, fieldsData, null));
}

/* Roll Dice
    Hank will roll the provided dice using the Dice Roller. 
    The command in entirety is gb. r xdxx +/- x;
    If the dice to be rolled is NOT given in that format, then the roll doesn't happen, 
        and instead the glungablug steals the dice.
*/
function rollDice(message, args){
    var dice = args[1];
    if (args[2] != undefined && args[3] != undefined) dice = dice + args[2] + args[3];
    try {var roll = roller.roll(dice);}
    catch (error){ return message.reply("Incorrect command; Hank has stolen your dice as penance!");}
    var title = "Rolling Dice";
    var description = `Hank kicked the dice and rolled: \n${roll}`;
    message.reply(embedFactory(title, null, description, null, null, null, null, null));  
}

/* Random Number
    Helper function to generate numbers in a certain range. Takes a max and min value.
    Returns the random integer between the two values.
*/
function getRandomNumber(min, max) {
    return Math.ceil((Math.random() * (max - min)));
}

/* Get Spell
    Retrieves spell information from the D&D 5e API.
    Formats the spell info for a nice embedded response.
*/
function getSpell(message, args){
    var name = args[1];
    var words = args.length - 1;
    if(words > 1){
        for (var i = 1; i < words; i++){
            name = name + "-" + args[1+i];
        }
    }
    try{
        fetch(`https://www.dnd5eapi.co/api/spells/${name}`)
            .then(response => response.json())
            .then(data => {
                if (data.name === undefined) message.channel.send(name + " was not found.");
                else{
                    var title = data.name;
                    var fieldsData = [
                        ['Casting Time', data.casting_time, true],
                        ['Level', data.level, true],
                        ['Range', data.range, true],
                        ['Duration', data.duration, true],
                        ['Concentration', data.concentration, true],
                        ['Components', data.components.toString(), true],
                        ['Higher Levels', data.higher_level, true]
                    ];
                    var description = data.desc;
                    var url = 'https://www.dnd5eapi.co/' + data.url;
                    message.channel.send(embedFactory(title, null, description, null, url, null, fieldsData, null));
                }
            });
        } catch (err){
            console.error(err);
        }
}

/* Get Encounter
    Rolls a d100, and returns an encounter based on the number. 
 */
function getEncounter(message){
    try {var roll = roller.roll("1d100");}
    catch (error){ return message.reply("Incorrect command; Hank has stolen your dice as penance!");}
    var title = "Encounter";
    var encounter = roll.total;
    var description = encounter + ": ";
    if (encounter <= 5) {
        roll = roller.roll("1d6+1");
        description += roll.total + " Chuchus!";
    }
    else if (encounter >=6 && encounter <= 11) {
        description += "Swarm of ";
        roll = roller.roll("1d4");
        switch (roll.total){
            case 1:
                description += " Keese!";
                break;
            case 2:
                description += " Fire Keese!";
                break;
            case 3:
                description += " Ice Keese!";
                break;
            case 4:
                description += " Lightning Keese!";
                break;
        }
    }
    else if (encounter >= 12 && encounter <= 16){
        roll = roller.roll("1d4+1");
        description += roll.total + " Octoroks!";
    }
    else if (encounter == 17 || encounter == 18) {
        roll = roller.roll("1d3");
        switch (roll.total){
            case 1:
                description += " Fire Wizzrobe!"
                break;
            case 2:
                description += " Ice Wizzrobe!"
                break;
            case 3:
                description += " Lightning Wizzrobe!"
                break;
                
        }
    }
    else if (encounter >= 19 && encounter <= 28){
        roll = roller.roll("1d6+2");
        if (roll.total == 8) {
            roll = roller.roll("1d4+2");
            description += roll.total + " Stalkoblins!";
        }
        else description += roll.total + " Bokoblins!";
    }
    else if (encounter >= 28 && encounter <= 32){
        roll = roller.roll("1d4+1");
        if (roll.total == 5) {
            roll = roller.roll("1d4+2");
            description += roll.total + " Stalmoblins!";
        }
        else description += roll.total + " Moblins!";
    }
    else if (encounter >= 28 && encounter <= 32){
        roll = roller.roll("1d4+1");
        if (roll.total == 5) {
            roll = roller.roll("1d4+2");
            description += roll.total + " Stalmoblins!";
        }
        else description += roll.total + " Moblins!";
    }
    else if (encounter >= 33 && encounter <= 42){
        roll = roller.roll("1d4+1");
        if (roll.total == 5) {
            roll = roller.roll("1d4+2");
            description += roll.total + " Stalizalfos!";
        }
        else description += roll.total + " Lizalfos!";
    }
    else if (encounter >= 43 && encounter <= 47){
        roll = roller.roll("1d2+1");
        description += roll.total + " Yiga! Suprise Round!";
    }
    else if (encounter >= 48 && encounter <= 52){
        roll = roller.roll("1d4+2");
        description += roll.total + " Pebblits!";
    }
    else if (encounter >= 52 && encounter <= 62){
        roll = roller.roll("1d4+2");
        if (roll.total == 6){
            roll = roller.roll("1d4");
            description += roll.total + " Boko Riders!";
        }
        else description += roll.total + " Horses.";
    }
    else if (encounter >= 63 && encounter <= 72){
        roll = roller.roll("1d6");
        description += roll.total + " Wild Game.";
    }
    else if (encounter >= 73 && encounter <= 82){
        roll = roller.roll("1d6");
        description += "Enemy Camp Number " + roll.total;
    }
    else if (encounter >= 83 && encounter <= 92) description += "Shrine!";
    else if (encounter == 93 || encounter == 94){
        description += "Treasure Chest! \n" + getTreasure(message, true);
    }
    else if (encounter >= 95 && encounter <= 99){
        roll = roller.roll("1d8");
        if (roll.total == 6 || roll.total == 7) {
            roll = roller.roll("1d8");
            description += roll.total += " Luminous Ore Deposits";
        }
        else if (roll.total == 8) {
            roll = roller.roll("1d4");
            description += roll.total += " Rare Ore Deposits";
        }
        else description += roll.total + " Ore Deposits.";
    }
    else {
        description += " Teebo!";
        roll = roller.roll ("1d7");
        switch (roll.total){
            case 1:
                description += "\nTalking to fairies.";
                break;
            case 2:
                description += "\nPetting blupees.";
                break;
            case 3:
                description += "\nArguing with an adult.";
                break;
            case 4:
                description += "\nFollowing a dog.";
                break;
            case 5:
                description += "\nFighting monsters.";
                break;
            case 6:
                description += "\nInspecting the area.";
                break;
            case 7:
                description += "\nLooking at a Shrine.";
                break;
        }
    }  
    message.reply(embedFactory(title, null, description, null, null, null, null, null));
}

/* Get Treasure
    Rolls a d20, and returns a treasure based on the number. 
 */
function getTreasure(message, reward){
    var title = "Treasure!!";
    var num = 0;
    var total = 0;
    try {var dice = roller.roll("1d20");}
    catch (error){ return message.reply("Incorrect command; Hank has stolen your dice as penance!");}
    var roll = dice.total;    
    var description = roll + ": ";
    if (roll <= 9){
        // Money money money money
        roll = roller.roll("1d4");
        num = roll.total;
        if (num == 1) description += "One Red Rupee";
        else if (num == 2) description += "One Purple Rupee";
        else if (num == 3) description += "One Silver Rupee";
        else description += "One Gold Rupee";
    }
    else if (roll>=10 && roll <=14){
        // Arrow time
        roll = roller.roll("1d4");
        num = roll.total;
        if (num == 1) description += "Arrows (x20)";
        else if (num == 2) description += "Electric Arrows (x10)";
        else if (num == 3) description += "Ice Arrows (x10)";
        else description += "Fire Arrows (x10)";
    }
    else if (roll == 15) description += "Bomb Arrows (x5)";
    else if (roll>=16 && roll <= 18){
        // Common Ore
        roll = roller.roll("1d4");
        num = roll.total;
        if (num == 1) description += "One Opal";
        else if (num == 2) description += "One Amber";
        else if (num == 3) description += "One Flint";
        else if (num == 4) description += "One Luminous Stone";
    }
    else if (roll == 19) {
        // Rare Ore
            roll = roller.roll("1d8");
            num = roll.total;
            if (num == 1 || num == 2) description += "One Topaz";
            else if (num == 3 || num == 4) description += "One Sapphire";
            else if (num == 5 || num == 6) description += "One Ruby";
            else if (num == 7) description += "One Diamond";
            else description += "One Star Fragment";
    }
    else description += "A Weapon!"
    if (reward) return description;
    else message.reply(embedFactory(title, null, description, null, null, null, null, null));
}

/* Get Horse
    Generates a horse with stats and colors.
 */
function getHorse(message){
    var title = "Horse Generator";        
    var description = "Horse Stats";
    var hp = 50;
    var movement = 40;
    var strength = roller.roll("1d5").total;        
    switch (strength){
        case 1: 
            hp = 100;
            break;
        case 2:
            hp = 150;
            break;
        case 3: 
            hp = 180;
            break
        case 4:
            hp = 220;
            break;
        case 5:
            hp = 300;
            break;
    }
    var speed = roller.roll("1d4+1").total;
    if(speed == 2) movement = 50;
    if (speed == 3) movement = 60;
    if (speed == 4) movement = 70;
    if (speed == 5) movement = 80;        
    var stamina = roller.roll("1d4+1").total;
    var color = roller.roll("1d7-1").total; 
    var fieldsData = [
        ["Strength", `${strength}*, ${hp} HP.`, true],
        ["Speed", `${speed}*, ${movement} ft. movement.`, true],
        ["Stamina", `${stamina}*, or ${stamina} dashes per short rest`, true],
    ];         
    var color = getRandomNumber(0, colors.length-1);
    console.log("Number: " + color, ", Color: " + colors[color]);
    const attachment = new Discord.MessageAttachment(colors[color], "horse.jpg");
    const image = 'attachment://horse.jpg';
    message.reply(embedFactory(title, null, description, null, null, image, fieldsData, null, attachment));
    //message.channel.send(image);
}

// Message Recieved
client.on('message', async message => {
    const user = message.author;
    // ignore if a bot sent it
    if (message.author.bot) return;

    // if its a message and not a command, then increment message count
    else if (!message.content.startsWith(prefix)){
         // increment message counter - and if equals the random number, steal something!
        messageCount++;
        if (messageCount === messageTarget){
            var title = "Uh Oh!";
            var description = `${user}, a glungablug has taken your `+ items[getRandomNumber(0, items.length - 1)] + '!';
            var image = "https://raw.githubusercontent.com/vquint23/hankbot3000/main/images/glungablug.jpg?token=AFQFIQDLFMWKGLSP7V22YOLAPRYHY";
            message.reply(embedFactory(title, null, description, image, null, null, null, null));
            messageCount = 0;
            messageTarget = getRandomNumber(1, 30);
        }
    }

    // Otherwise, it's a command!
    else {
        const commandBody = message.content.slice(prefix.length);
        // the rest goes in args
        const args = commandBody.split(' ');
        args.shift().toLowerCase();
        const command = args[0];
        switch(command){
            // Public commands (seen in "Help")
            case "help":
                showHelp(message);
            break;
            case "ping":
                const timeTaken = Date.now() - message.createdTimestamp;
                message.channel.send(`Pong! This message had a latency of ${timeTaken}ms.`);
                break;
            case "r":
            case "roll":
                rollDice(message, args);
                break;
            case 'dog':
                const dog = await fetch('https://random.dog/woof.json')
                    .then(response=>response.json())
                    .catch (err => console.error(err));
                var link = dog.url;
                message.channel.send(link);
                break;
            case 'spell':
                getSpell(message, args);
                break;
            // DM Commands! Secret. Shhhhhh.
            case "encounter":
                getEncounter(message);
                break;
            case "treasure":
                getTreasure(message);
                break; 
            case "horse":
                getHorse(message);
                break;
            default:
                var title = "Bak BAK!?";
                var description = "(It would seem Hank did not understand.)";
                var footer = "Try `bak help` for the help menu!";
                message.channel.send(embedFactory(title, null, description, null, null, null, null, footer));
        }
    }
});

client.login(process.env.DISCORD_TOKEN);