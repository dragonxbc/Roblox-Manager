const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const BaseSlashCommand = require('../../util/BaseSlashCommand');
const { GAME } = require('../../config.json');
const { universeSlashCommand, userIdToName, userNameToID, isNum } = require('../../util/Helper');

module.exports = class Ban extends BaseSlashCommand{
    constructor(){
        super('ban', true);
    }
    
    async run(client, interaction){
        const universe = client.universes[interaction.options.getString('universe')];
        const datastore = universe.datastore;
        const messager = universe.messager;

        let userId = interaction.options.getString('user');
        let userName;

        if(isNum(userId)){
            const data = await userNameToID(userId);
            userId = data.id;
            userName = data.name;
        }
        else{
            userName = await userIdToName(userId);
            console.log(userName); 
        }
		await interaction.deferReply();
        if(!userName) return await interaction.editReply("Specified user doesn't exist.");

        const reason = interaction.options.getString('reason') ?? GAME.BAN_REASON;
        const time = interaction.options.getInteger('time')

        let unBanTime;

        if(time){
            unBanTime = Math.floor(Date.now() / 1000) + (time * 3600);
        }

        const banData = {
            banned: true, 
            dateUpdated: Math.floor(Date.now() / 1000), 
            updatedBy: interaction.member.user.tag, 
            reason: reason,
            unBanTime: unBanTime
        }
        const messageData = {
            func: "KICK",
            data: {
                user: userId,
                reason: reason
            }
        }
		
        const success = await datastore.SetAsync(userId, banData);
        const messageSuccess = await messager.PostTopic("RBLXManager", JSON.stringify(messageData));

        if(success && messageSuccess){
            const Embed = new EmbedBuilder()
                .setColor("#EE4B2B")
                .setTitle(`Successfully banned, **${userName}**!`)
                .setDescription(`**Universe:** \`${universe.name}\` \n If this was a mistake and you would like to unban them, please use \`prefix@unban <userId>\``)
                .setThumbnail(`https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&width=420&height=420&format=png`) // does not currently work
                .setTimestamp();

            return await interaction.editReply({ embeds: [Embed] });
        }
        else
            return await interaction.editReply(`Failed to ban **${userName} or failed to notify server!**`);  
    }

    getRaw(){
        const currentUniverses = universeSlashCommand();

        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription('Bans the given user from the specifed universe.')
            .addStringOption((option) => 
                option
                    .setName('universe')
                    .setDescription('Universe you want to ban the user from.')
                    .setRequired(true)
                    .addChoices(...currentUniverses)
            )
            .addStringOption((option) => 
                option
                    .setName('user')
                    .setDescription('User you would like to ban')
                    .setRequired(true)
            )
            .addStringOption((option) => 
                option
                    .setName('reason')
                    .setDescription('Reason you want to ban the user for.')
            )
            .addIntegerOption((option) => 
                option
                    .setName('time')
                    .setDescription('How long you want to ban the user in hours.')
            )
            .toJSON();
    }
}