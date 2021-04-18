require('dotenv').config(); 
const fetch = require('node-fetch');
const Discord = require("discord.js");
const { Client, MessageEmbed } = require('discord.js');
const client = new Discord.Client();
const { DiceRoller } = require('rpg-dice-roller');
const roller = new DiceRoller();
var messageCount = 0;
var messageTarget = getRandomNumber(1, 30);
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
function embedFactory(title, author, description, thumbnail, url, image, fieldsData, footer) {
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
    return Math.ceil((Math.random() * (max - min)) + min);
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
            var description = `${user} a glungablug has taken your `+ items[getRandomNumber(0, items.length)] + '!';
            var image = "./images/glungablug.jpg";
            message.reply(embedFactory(title, null, description, image,null,null,null,null));
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
            default:
                var title = "Bak BAK!?";
                var description = "(It would seem Hank did not understand.)";
                var footer = "Try `bak help` for the help menu!";
                message.channel.send(embedFactory(title, null, description, null, null, null, null, footer));
        }
    }
});

client.login(process.env.DISCORD_TOKEN);