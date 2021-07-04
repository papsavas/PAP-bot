import {
    Client, Collection, CommandInteraction, GuildChannelManager,
    GuildMember, Message, MessageEmbed, Snowflake, TextChannel, User
} from 'discord.js';
import { creatorID, guildID as botGuildID } from './botconfig.json';
import { DMHandlerImpl } from './Handlers/DMs/DM';
import { DmHandler } from './Handlers/DMs/GenericDm';
import { GlobalCommandHandler } from './Handlers/Global/GlobalCommandHandler';
import { GlobalCommandHandlerImpl } from './Handlers/Global/GlobalCommandHandlerImpl';
import { GenericGuild } from "./Handlers/Guilds/GenericGuild";
import { DefaultGuild } from "./Handlers/Guilds/Impl/DefaultGuild";




export let bugsChannel: TextChannel;
export let logsChannel: TextChannel;
export const inDevelopment: boolean = process.env.NODE_ENV == 'development';
export const guildMap = new Collection<Snowflake, GenericGuild>();
let dmHandler: DmHandler;
let globalCommandHandler: GlobalCommandHandler;


if (inDevelopment)
    require('dotenv').config();  //load env variables


console.log(`running in "${process.env.NODE_ENV}" mode\n`);

export const PAP = new Client({
    partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER', 'GUILD_MEMBER'],
    intents: [
        'GUILDS', 'GUILD_BANS', 'GUILD_EMOJIS', 'GUILD_MEMBERS',
        'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS',
        'DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS'
    ],
    allowedMentions: {
        parse: ['users'],
        repliedUser: true
    }
});



async function runScript(): Promise<void> {
    //-----insert script--------

    //-------------------------
    console.log('script done');
    return
}

PAP.on('guildCreate', (guild) => {
    console.log(`joined ${guild.name} guild`);
    //TODO: implement DB writes
    /*
    * - guild table add id
    * - command_perms add @everyone role id in every command 👇
    await addRows(
        'command_perms',
        guildMap.get(botGuildID as Snowflake).commandHandler.commands.map(async cmd =>
            ( {
                "guild_id": guild.id,
                "role_id": guild.id,
                "command_id": cmd.id
            }))
    );
    * - add guild settings
    * */
    //onGuildJoin(guild);
})

PAP.on('guildDelete', guild => {
    console.log(`left ${guild.name} guild`);
    //TODO: implement DB writes
    //onGuildLeave(guild);
})

PAP.on('guildUnavailable', (guild) => {
    if (guild.id !== botGuildID)
        logsChannel.send(`@here guild ${guild.name} with id: ${guild.id} is unavailable`)
            .then((msg) => console.log(`${new Date().toString()} : guild ${guild.name} is unavailable.\n`));
});

//when cache is fully loaded
PAP.on('ready', async () => {

    try {
        // Creating a guild-specific command
        PAP.user.setActivity('over you', { type: 'WATCHING' });
        const PAPGuildChannels: GuildChannelManager = PAP.guilds.cache.get(botGuildID as Snowflake).channels;
        const initLogs = PAPGuildChannels.cache.get('746310338215018546') as TextChannel;
        bugsChannel = PAPGuildChannels.cache.get('746696214103326841') as TextChannel;
        logsChannel = PAPGuildChannels.cache.get('815602459372027914') as TextChannel
        if (!inDevelopment)
            await initLogs.send(`**Launched** __**Typescript Version**__ at *${(new Date()).toString()}*`);

        /*
        TODO: Replace on release 
        PAP.guilds.cache.keyArray()
        */
        for (const guildID of [botGuildID] as Snowflake[]) {
            if (!guildMap.has(guildID))
                guildMap.set(guildID, await DefaultGuild.init(guildID));
            await guildMap.get(guildID).onReady(PAP); //block until all guilds are loaded
        };

        /*
        !untrack until re-registration
        dmHandler = await DMHandlerImpl.init();
        await dmHandler.onReady(PAP);

        globalCommandHandler = await GlobalCommandHandlerImpl.init();
        */
        console.log('smooth init')

    } catch (err) {
        console.log('ERROR\n' + err.stack);
    }
    console.log(`___Initiated___`);

    if (inDevelopment) {
        await runScript();
        //process.exit(132);
    }
});


PAP.on('interaction', async interaction => {
    if (interaction.isCommand()) {
        if (interaction.inGuild()) {
            try {
                guildMap.get(interaction.guildID)
                    ?.onSlashCommand(interaction)
            } catch (error) {
                console.log(error)
            }
        }
        else if (interaction.channel.type === 'dm') {
            console.log(`dm interaction received\n${(interaction as CommandInteraction).commandName}
            from ${interaction.user.tag}`)
        }
        else {
            console.log(`unspecified interaction channel\n${interaction.toJSON()}`)
        }
    }

    else if (interaction.isButton()) {
        if (interaction.inGuild()) {
            try {
                guildMap.get(interaction.guildID)
                    ?.onButton(interaction)
                interaction.reply({ ephemeral: true, content: interaction.customID }).catch();

            } catch (error) {
                console.log(error)
            }
        }
        else {
            console.log('dm button received');
        }
    }

    else if (interaction.isSelectMenu()) {
        //TODO: implement guild handlers
        console.log(`message component interaction received`);
        await interaction.reply({
            content: JSON.stringify(interaction.values),
            ephemeral: true
        }).catch(console.error)
    }

    else {
        console.log(`unhandled interaction type in ${interaction.channel.id} channel. TYPE = ${interaction.type}`);
        await bugsChannel.send({
            embeds: [
                new MessageEmbed({
                    title: `Untracked Interaction`,
                    description: `received untracked interaction in ${interaction.guild.name}`,
                    fields: [
                        { name: `Type`, value: interaction.type },
                        { name: `Channel`, value: interaction.channel.toString() },
                        { name: `Interaction ID`, value: interaction.id }
                    ]
                })
            ]
        })
    }
});


PAP.on('message', (receivedMessage) => {
    if (receivedMessage.author.id === creatorID && receivedMessage.content.startsWith('eval'))
        try {
            const D = require('discord.js');
            return eval(receivedMessage.cleanContent
                .substring('eval'.length + 1)
                .replace(/(\r\n|\n|\r)/gm, "")); //remove all line breaks
        }
        catch (err) {
            console.error(err);
            receivedMessage.reply({ content: err.toString(), allowedMentions: { parse: [] } })
                .catch(internalErr => console.log(internalErr));
        }

    if (receivedMessage.author.bot)
        return

    switch (receivedMessage.channel.type) {
        case 'dm':
            break;

        case 'text':
            guildMap.get(receivedMessage.guild.id)
                ?.onMessage(receivedMessage)
                .catch(err => console.log(err));
            break;

        default:
            bugsChannel.send(`received message from untracked channel type
CHANNEL_TYPE:${receivedMessage.channel.type}
ID:${receivedMessage.id}
from: ${receivedMessage.member.displayName}
content: ${receivedMessage.content}\n`).catch(console.error);
    }
})


PAP.on('messageDelete', async (deletedMessage) => {
    if (deletedMessage.partial) return; //cannot fetch deleted data

    if (deletedMessage.author == PAP.user || deletedMessage.author.bot)
        return

    switch (deletedMessage.channel.type) {
        case 'dm':
            break;

        case 'text':
            guildMap.get(deletedMessage.guild?.id)
                ?.onMessageDelete(deletedMessage as Message)
                .catch(err => console.log(err));
            break;
    }
})

PAP.on('messageReactionAdd', async (messageReaction, user) => {
    try {
        if (messageReaction.partial) await messageReaction.fetch();
        if (user.partial) await user.fetch();
    } catch (err) {
        console.error(err)
    }
    guildMap.get(messageReaction.message.guild?.id)
        ?.onMessageReactionAdd(messageReaction, user as User)
        .catch(err => console.log(err));

});

PAP.on('messageReactionRemove', async (messageReaction, user) => {
    try {
        if (messageReaction.partial) await messageReaction.fetch();
        if (user.partial) await user.fetch();
    } catch (err) {
        console.error(err)
    }
    guildMap.get(messageReaction.message.guild?.id)
        ?.onMessageReactionRemove(messageReaction, user as User)
        .catch(err => console.log(err));
});

PAP.on('guildMemberAdd', (member) => {
    guildMap.get(member.guild.id)
        ?.onGuildMemberAdd(member)
        .catch(err => console.log(err));
});

PAP.on('guildMemberRemove', async (member) => {
    if (member.partial) await member.fetch().catch(console.error);
    guildMap.get(member.guild.id).onGuildMemberRemove(member as GuildMember)
        .catch(err => console.log(err));

});

PAP.on('guildMemberUpdate', async (oldMember, newMember) => {
    if (oldMember.partial) await oldMember.fetch().catch(console.error);
    guildMap.get(newMember.guild.id)
        ?.onGuildMemberUpdate(oldMember as GuildMember, newMember)
        .catch(err => console.log(err));

});

PAP.on('error', (error) => {
    console.error(error);
});



PAP.login(process.env.BOT_TOKEN)
    .then(r => console.log(`logged in`))
    .catch(err => console.log(`ERROR ON LOGIN:\n${err}`));
