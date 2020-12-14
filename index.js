//Initial constants
const Commando = require('discord.js-commando');
const path = require('path');
const mongo = require('./mongo/mongo.js');
const reactionHandle = require('./util/reactionHandle.js');
require('dotenv').config();

//Prefix can be changed in the .env file
const defCommandPrefix = process.env.PREFIX || "!";

const client = new Commando.CommandoClient({
  owner: ['349553169035952140', '702839175757430855'],
  commandPrefix: defCommandPrefix,
  partials: ['REACTION', 'CHANNEL', 'USER', 'MESSAGE'],
  //!invite: PUT YOUR INVITE HERE AND DELETE THE ! FROM THE COMMENT START 
});

//Actions to do, once loaded
client.on('ready', async () => {
  console.log(`${client.user.username} is ready to perform his duties!`);
  client.user.setActivity(`v1.0 | ${defCommandPrefix}help`, type = 'PLAYING');

  await reactionHandle(client);
  await mongo().then(async mongoose => {
    try {
      console.log('Connected to MongoDB');
    } finally {
      mongoose.connection.close();
    }
  });
});

//You'll never need to touch this part after this comment unlsess something really bad happens
client.registry
  .registerDefaultTypes()
  .registerGroups([
    ['misc', 'Miscellaneous commands.'],
    ['admin', 'Commands for moderation and administration purposes.']
  ])
  .registerDefaultGroups()
  .registerDefaultCommands({
    unknownCommand: false,
  })
  .registerCommandsIn(path.join(__dirname, 'cmds')); 

client.on('unknownCommand', async message => console.log(`Unknown command used by ${message.author.username}: "${message.content}"`));

client.login(process.env.TOKEN);