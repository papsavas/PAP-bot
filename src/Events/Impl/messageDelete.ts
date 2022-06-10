import { ClientEvents, Message, PartialMessage } from "discord.js";

const name: keyof ClientEvents = "messageDelete";

const execute = async (deletedMessage: Message<boolean> | PartialMessage) => {
    if (deletedMessage.partial) return; //cannot fetch deleted data

    if (deletedMessage.author.id === deletedMessage.client.user.id || deletedMessage.author.bot)
        return

    switch (deletedMessage.channel.type) {
        case 'DM': {
            const { dmHandler } = await import('../../Inventory/DMs');
            dmHandler.onMessageDelete(deletedMessage as Message)
                .catch(console.error);
            break;
        }
        case 'GUILD_TEXT':
        case 'GUILD_PRIVATE_THREAD':
        case 'GUILD_PUBLIC_THREAD':
        case 'GUILD_NEWS':
        case 'GUILD_NEWS_THREAD': {
            const { guilds } = await import('../../Inventory/guilds');
            guilds.get(deletedMessage.guild?.id)
                ?.onMessageDelete(deletedMessage as Message)
                .catch(console.error);
            break;
        }
    }
}

export default { name, execute }