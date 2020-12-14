const { MessageCollector, MessageEmbed } = require('discord.js');
const Commando = require('discord.js-commando');
const mongo = require('../../mongo/mongo.js');
const { mainColour } = require('../../config.json');
const reactionHandle = require('../../util/reactionHandle.js');
const rescueScript = require('../../mongo/rescueScript.js');

//Initialization of the command
module.exports = class SetupCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'setup',
      group: 'admin',
      memberName: 'setup',
      description: 'An automatic process of setting up the bot for your server.',
      guarded: 'true',
      clientPermissions: ['ADMINISTRATOR'],
      userPermissions: ['ADMINISTRATOR'],
      guildOnly: true
    });
  }

  async run(message) {
    //Initial parameters of the command
    const questions = [
      'Please tag the "Constabulary" role.',
      'Please tag the "Ambulance" role.',
      'Plese tag the "Fire and Rescue" role.',
      'Please tag the request channel.',
      'Please enter the ID of the resque service category.',
      'Please tag the emergency-log channel.',
      'Please tag the "Supervisor" role.'
    ];
    const filter = m => m.author.id === message.author.id;
    const { guild } = message;
    let counter = 0;
    const collector = new MessageCollector(message.channel, filter, {
      max: questions.length,
      time: 1000 * 30
    });

    //Start to collect messages
    message.channel.send(questions[counter++]);
    collector.on('collect', async m => {
      if (counter < questions.length) {
        m.channel.send(questions[counter++]);
      }
    });

    //When we collected all the info
    collector.on('end', async collected => {
      const collectedArr = collected.array();
      if (collectedArr.length < questions.length) return message.reply('You did not provide enough information! Please try again!');

      const cstRoleID = collectedArr[0].content.slice(3, -1);
      const ambRoleID = collectedArr[1].content.slice(3, -1);
      const firRoleID = collectedArr[2].content.slice(3, -1);
      const reqChannelID = collectedArr[3].content.slice(2, -1);
      const categoryID = collectedArr[4].content;
      const logChannelID = collectedArr[5].content.slice(2, -1);
      const supRoleID = collectedArr[6].content.slice(3, -1);
      const guildID = guild.id;
      
      //Sending a reaction message
      const reqChannel = this.client.channels.cache.get(reqChannelID);
      const embed = new MessageEmbed()
        .setColor(mainColour)
        .setAuthor('999 Emergency service system', this.client.user.displayAvatarURL())
        .setDescription('```React to this message to call appropriate services```\n\n<:hfrs:786562811458617364> = Fire and Rescue service\n\n<:eeas:786562811140505612> = Ambulance\n\n<:hc:786562811907932160> = Constabulary service')
        .setFooter('Found a bug? Report it to the server\'s staff!')

      reqChannel.send(embed).then(async m => {
        m.react('786562811458617364');
        m.react('786562811140505612');
        m.react('786562811907932160');
      });

      //?Calling the reaction-seeking function
      //!Not in use for now
      //reactionHandle(this.client);

      //Writing to the DB
      await mongo().then(async mongoose => {
        try {
          await rescueScript.findOneAndUpdate({
            guildID: guildID
          }, {
            guildID: guildID,
            cstRoleID: cstRoleID,
            ambRoleID: ambRoleID,
            firRoleID: firRoleID,
            reqChannelID: reqChannelID,
            categoryID: categoryID,
            logChannelID: logChannelID,
            supRoleID: supRoleID,
          }, {
            upsert: true,
            useFindAndModify: false
          });
        } finally {
          mongoose.connection.close();
        }
      });
    });
  }
}