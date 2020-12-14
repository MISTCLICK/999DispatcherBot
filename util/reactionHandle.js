const { MessageCollector, MessageEmbed } = require('discord.js');
const mongo = require('../mongo/mongo.js');
const rescueScript = require('../mongo/rescueScript.js');
const { mainColour } = require('../config.json');

module.exports = async (client) => {
  client.on('messageReactionAdd', async (reaction, user) => {
    user.fetch();
    reaction.fetch();
    reaction.message.fetch().then(async () => {
      const guildID = reaction.message.guild.id;

      await mongo().then(async mongoose => {
        try {
          const resqData = await rescueScript.findOne({
            guildID: guildID
          });

          if (resqData === null) return;
          if (resqData.reqChannelID !== null) {
            const categoryID = resqData.categoryID;
            const logChannelID = resqData.logChannelID;
            const theOneAndOnlyChungus = resqData.reqChannelID;
            const supRoleID = resqData.supRoleID;
            const theOneAndOnlyChungusObj = client.channels.cache.get(theOneAndOnlyChungus);
            theOneAndOnlyChungusObj.messages.fetch();

            if (user.bot) return;
            
            if (reaction.emoji.name == 'FIRE_RESCUE' || reaction.emoji.name == 'AMBULANCE_RESCUE' || reaction.emoji.name == 'POLICE_RESCUE') {
              reaction.users.remove(user);

              let roleID;

              if (reaction.emoji.name == 'FIRE_RESCUE') {
                roleID = `<@&${resqData.firRoleID}> and <@&${resqData.cstRoleID}>`;
              } else if (reaction.emoji.name == 'AMBULANCE_RESCUE') {
                roleID = `<@&${resqData.ambRoleID}>`;
              } else if (reaction.emoji.name == 'POLICE_RESCUE') {
                roleID = `<@&${resqData.cstRoleID}>`;
              }

              reaction.message.guild.channels.create(`emergency-${user.tag}-${Math.floor(Math.random() * 1000)}`, {
                type: 'text'
              }).then(async channel => {
                const trueChannel = channel;
                trueChannel.setParent(categoryID).then(() => {
                  trueChannel.overwritePermissions([
                    {
                      id: user.id,
                      allow: ["SEND_MESSAGES", "VIEW_CHANNEL"]
                    },
                    {
                      id: reaction.message.guild.roles.everyone,
                      deny: ["VIEW_CHANNEL"]
                    },
                    {
                      id: supRoleID,
                      allow: ["SEND_MESSAGES", "VIEW_CHANNEL"]
                    }
                  ]).then(() => {
                    const questions1 = [
                      'Is everyone safe? (Y/n)'
                    ];
                    const filter = m => m.author.id === user.id;
                    let counter1 = 0;
                    const collector1 = new MessageCollector(trueChannel, filter, {
                      max: questions1.length,
                      time: 1000 * 300
                    });

                    trueChannel.send(questions1[counter1++]);
                    collector1.on('collect', async m => {
                      if (counter1 < questions1.length) {
                        m.channel.send(questions1[counter1++]);
                      }
                    });

                    collector1.on('end', async collected => {
                      const collectedArr = collected.array();
                      if (collectedArr.length < questions1.length) {
                        user.send('You did not enter all the information needed to serve you!');
                        trueChannel.delete();
                        return;
                      } else {
                        if (collectedArr[0].content == 'Y' || collectedArr[0].content == 'yes' || collectedArr[0].content == 'Yes' || collectedArr[0].content == 'YES' || collectedArr[0].content == 'y') {
                          const questions2 = [
                            'Describe, what has happened.',
                            'Where is the emergency located?'
                          ];
                          let counter2 = 0;
                          const collector2 = new MessageCollector(trueChannel, filter, {
                            max: questions2.length,
                            time: 1000 * 300
                          });

                          trueChannel.send(questions2[counter2++]);
                          collector2.on('collect', async m => {
                            if (counter2 < questions2.length) {
                              m.channel.send(questions2[counter2++]);
                            }
                          });

                          collector2.on('end', async collected2 => {
                            const collected2Arr = collected2.array();
                            if (collected2Arr.length < questions2.length) {
                              user.send('You did not enter all the information needed to serve you!');
                              trueChannel.delete();
                              return;
                            } else {
                              trueChannel.send('Thanks for your call! Appropriate emergency services have been dispatched!');
                              const logChannelObj = client.channels.cache.get(logChannelID);
                              let results = '';
                              for (let i = 0; i < collectedArr.length; i++) {
                                results += `${questions1[i]}\n${collectedArr[i].content}\n\n`;
                              }
                              for (let j = 0; j < collected2Arr.length; j++) {
                                results += `${questions2[j]}\n${collected2Arr[j].content}\n\n`;
                              }
                              const dispEmbed = new MessageEmbed()
                                .setColor(mainColour)
                                .setAuthor('NEW EMERGENCY INCOMING', client.user.displayAvatarURL())
                                .setDescription(results)
                                .setFooter('Found a bug? Report it to the server\' staff!')
                              
                              logChannelObj.send(`Notifying ${roleID}`, dispEmbed);
                            }
                          });
                        } else if (collectedArr[0].content == 'n' || collectedArr[0].content == 'no' || collectedArr[0].content == 'No' || collectedArr[0].content == 'NO' || collectedArr[0].content == 'N') {
                          if (reaction.emoji.name !== 'AMBULANCE_RESCUE') roleID += ` and <@&${resqData.ambRoleID}>`;
                          const questions2 = [
                            'Is the patient breathing? (Y/n)'
                          ];
                          let counter3 = 0;
                          const collector3 = new MessageCollector(trueChannel, filter, {
                            max: questions2.length,
                            time: 1000 * 300
                          });

                          trueChannel.send(questions2[counter3++]);
                          collector3.on('collect', async m => {
                            if (counter3 < questions2.length) {
                              m.channel.send(questions2[counter3++]);
                            }
                          });

                          collector3.on('end', async collected3 => {
                            const collected3Arr = collected3.array();
                            if (collected3Arr.length < questions2.length) {
                              user.send('You did not enter all the information needed to serve you!');
                              trueChannel.delete();
                              return;
                            } else {
                              if (collected3Arr[0].content == 'Y' || collected3Arr[0].content == 'yes' || collected3Arr[0].content == 'Yes' || collected3Arr[0].content == 'YES' || collected3Arr[0].content == 'y') {
                                const questions3 = [
                                  'Describe, what has happened.',
                                  'Where is the emergency located?'
                                ];
                                let counter4 = 0;
                                const collector4 = new MessageCollector(trueChannel, filter, {
                                  max: questions3.length,
                                  time: 1000 * 300
                                });

                                trueChannel.send(questions3[counter4++]);
                                collector4.on('collect', async m => {
                                  if (counter4 < questions3.length) {
                                    m.channel.send(questions3[counter4++]);
                                  }
                                });

                                collector4.on('end', async collected4 => {
                                  const collected4Arr = collected4.array();
                                  if (collected4Arr.length < questions3.length) {
                                    user.send('You did not enter all the information needed to serve you!');
                                    trueChannel.delete();
                                    return;
                                  } else {
                                    trueChannel.send('Thanks for your call! Appropriate emergency services have been dispatched!');
                                    const logChannelObj = client.channels.cache.get(logChannelID);
                                    let results = '';
                                    for (let i = 0; i < collectedArr.length; i++) {
                                      results += `${questions1[i]}\n${collectedArr[i].content}\n\n`;
                                    }
                                    for (let j = 0; j < collected3Arr.length; j++) {
                                      results += `${questions2[j]}\n${collected3Arr[j].content}\n\n`;
                                    }
                                    for (let k = 0; k < collected4Arr.length; k++) {
                                      results += `${questions3[k]}\n${collected4Arr[k].content}\n\n`;
                                    }
                                    const dispEmbed = new MessageEmbed()
                                      .setColor(mainColour)
                                      .setAuthor('NEW EMERGENCY INCOMING', client.user.displayAvatarURL())
                                      .setDescription(results)
                                      .setFooter('Found a bug? Report it to the servr\'s staff!')

                                    logChannelObj.send(`Notifying ${roleID}`, dispEmbed);
                                  }
                                });
                              } else if (collected3Arr[0].content == 'n' || collected3Arr[0].content == 'no' || collected3Arr[0].content == 'No' || collected3Arr[0].content == 'NO' || collected3Arr[0].content == 'N') {
                                const questions4 = [
                                  'Please start CPR (compressions) at a rate of 30 compressions and 2 mouth-to-mouth breathe-ins per minute.\n\nPlease discribe, what has happened.',
                                  'Where is the emergency located?'
                                ];
                                let counter5 = 0;
                                const collector5 = new MessageCollector(trueChannel, filter, {
                                  max: questions4.length,
                                  time: 1000 * 30
                                });

                                trueChannel.send(questions4[counter5++]);
                                collector5.on('collect', async m => {
                                  if (counter5 < questions4.length) {
                                    m.channel.send(questions4[counter5++]);
                                  }
                                });

                                collector5.on('end', async collected5 => {
                                  const collected5Arr = collected5.array();
                                  if (collected5Arr.length < questions4.length) {
                                    user.send('You did not enter all the information needed to serve you!');
                                    trueChannel.delete();
                                    return;
                                  } else {
                                    trueChannel.send('Thanks for your call! Appropriate emergency services have been dispatched!');
                                    const logChannelObj = client.channels.cache.get(logChannelID);
                                    let results = '';
                                    for (let i = 0; i < collectedArr.length; i++) {
                                      results += `${questions1[i]}\n${collectedArr[i].content}\n\n`;
                                    }
                                    for (let j = 0; j < collected3Arr.length; j++) {
                                      results += `${questions2[j]}\n${collected3Arr[j].content}\n\n`;
                                    }
                                    for (let k = 0; k < collected5Arr.length; k++) {
                                      if (k !== 0) {
                                        results += `${questions4[k]}\n${collected5Arr[k].content}\n\n`;
                                      } else {
                                        results += `Discribe, what has happened.\n${collected5Arr[k].content}\n\n`;
                                      }
                                    }
                                    const dispEmbed = new MessageEmbed()
                                      .setColor(mainColour)
                                      .setAuthor('NEW EMERGENCY INCOMING', client.user.displayAvatarURL())
                                      .setDescription(results)
                                      .setFooter('Found a bug? Report it to the server\'s staff!')
                                    
                                    logChannelObj.send(`Notifying ${roleID}`, dispEmbed);
                                  }
                                });
                              }
                            }
                          });
                        }
                      }
                    });
                  });
                });
                const time = 1000 * 600;
                setTimeout(() => trueChannel.delete(), time);
              });
            } 
          }
        } finally {
          mongoose.connection.close();
        }
      });
    });
  });
}