import { ClientEvents, Message } from "discord.js";
const { creatorID } = (await import('../../../bot.config.json', { assert: { type: 'json' } })).default;

const name: keyof ClientEvents = 'messageCreate';
const execute = async (message: Message) => {
    if (message.author.id === creatorID && message.content.startsWith('eval'))
        try {
            const Discord = await import('discord.js');
            return eval(message.cleanContent
                .substring('eval'.length + 1)
                .replace(/(\r\n|\n|\r)/gm, "") //remove all line breaks
                .replace("```", "") //remove code blocks
                .replace("`", "") //remove code quotes
            );

        }
        catch (err) {
            console.error(err);
            message.reply({ content: err.toString(), allowedMentions: { parse: [] } })
                .catch(internalErr => console.log(internalErr));
        }

    if (message.author.id === (await import('../../index')).PAP.user.id)
        return

    switch (message.channel.type) {
        case 'DM': {
            const { dmHandler } = await import('../../Inventory/DMs');
            dmHandler.onMessage(message)
                .catch(console.error);
            break;
        }
        case 'GUILD_TEXT':
        case 'GUILD_PRIVATE_THREAD':
        case 'GUILD_PUBLIC_THREAD':
        case 'GUILD_NEWS':
        case 'GUILD_NEWS_THREAD': {
            const { guilds } = await import('../../Inventory/guilds');
            guilds.get(message.guild.id)
                ?.onMessage(message)
                .catch(console.error);
            break;
        }
    }
}

export default { name, execute };