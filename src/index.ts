import {
    Client, Constants, GuildChannelManager, TextChannel
} from 'discord.js';
import { readdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as config from "../bot.config.json" assert { type: "json" };
import * as guildIds from "../values/PAP/IDs.json" assert { type: "json" };
import GenericEvent from './Events/GenericEvent';

export let bugsChannel: TextChannel;
export let logsChannel: TextChannel;

if (process.env.NODE_ENV !== 'production')
    (await import('dotenv'))
        .config({ path: (await import('find-config')).read('.env') })  //load env variables

console.log(`deployed in "${process.env.NODE_ENV}" mode\n`);

export const PAP = new Client({
    partials: [
        'MESSAGE',
        'CHANNEL',
        'REACTION',
        'USER',
        'GUILD_MEMBER'
    ],
    intents: [
        'GUILDS',
        'GUILD_BANS',
        'GUILD_EMOJIS_AND_STICKERS',
        'GUILD_MEMBERS',
        'GUILD_MESSAGES',
        'GUILD_MESSAGE_REACTIONS',
        'DIRECT_MESSAGES',
        'DIRECT_MESSAGE_REACTIONS',
        'GUILD_VOICE_STATES'
    ],
    allowedMentions: {
        parse: ['users'],
        repliedUser: true
    }
});


PAP.on('ready', async () => {
    try {
        PAP.user.setActivity('over you', { type: 'WATCHING' });
        const PAPGuildChannels: GuildChannelManager = (await PAP.guilds.cache.get(config.guildID).fetch()).channels;
        const initLogs = PAPGuildChannels.cache.get(guildIds.channels.init_logs) as TextChannel;
        bugsChannel = PAPGuildChannels.cache.get(guildIds.channels.bugs) as TextChannel;
        logsChannel = PAPGuildChannels.cache.get(guildIds.channels.logs) as TextChannel;
        console.log('smooth init');

    } catch (err) {
        console.log('READY ERROR');
        console.log(err);
    }

    console.log(`___ Initiated ___`);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const eventFiles = readdirSync(`${__dirname}/Events/Impl`)
    .filter(file => Object.values(Constants.Events)
        .includes(file.split('.')[0])
    );
for (const file of eventFiles) {
    const event: GenericEvent = (await import(`./Events/Impl/${file}`)).default;
    PAP.on(event.name, async (...args) => {
        event.execute(...args)
            .catch(err => console.error(err))
    });
}

PAP.login(process.env.BOT_TOKEN)
    .then(r => console.log(`logged in `))
    .catch(err => console.log(`ERROR ON LOGIN: \n${err}`));


process.on('unhandledRejection', (reason, p) => {
    console.log(reason)
});

