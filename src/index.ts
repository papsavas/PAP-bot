import {
    Client, Constants
} from 'discord.js';
import { readdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import GenericEvent from './Events/GenericEvent';

if (process.env.NODE_ENV !== "production") {
    const dotenv = await import("dotenv");
    dotenv.config({ debug: true });
}
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

await PAP.login(process.env.BOT_TOKEN)
    .then(r => console.log(`logged in `))
    .catch(err => console.log(`ERROR ON LOGIN: \n${err}`));

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

process.on('unhandledRejection', (reason, p) => {
    console.log(reason)
});

