import { Constants, ContextMenuInteraction, Message, MessageApplicationCommandData, MessageEmbed, Snowflake, User } from "discord.js";
import { guildMap } from "../../..";
import { commandLiteral } from "../../../Entities/Generic/command";
import { fetchCommandID } from "../../../Queries/Generic/Commands";
import { AbstractGuildCommand } from "../AbstractGuildCommand";
import { bookmarkCmd } from "../Interf/bookmarkCmd";

export class bookmarkCmdImpl extends AbstractGuildCommand implements bookmarkCmd {

    protected _id: Snowflake;
    protected _keyword = `bookmark`;
    protected _guide = null;
    protected _usage = null;

    private constructor() { super() }

    static async init(): Promise<bookmarkCmd> {
        const cmd = new bookmarkCmdImpl();
        cmd._id = await fetchCommandID(cmd.keyword);
        return cmd;
    }

    private readonly _aliases = this.addKeywordToAliases
        (
            ['bookmark', 'bm'], this.keyword
        );

    getCommandData(guild_id: Snowflake): MessageApplicationCommandData {
        return {
            name: this.keyword,
            type: 'MESSAGE'
        }
    }
    async interactiveExecute(interaction: ContextMenuInteraction): Promise<unknown> {
        await interaction.deferReply({ ephemeral: true })
        const message = await interaction.channel.messages.fetch(interaction.targetId)
        const user = interaction.user;
        let response: string;
        try {
            await messageUser(user, message);
            response = 'check your DMs'
        } catch (error) {
            if (error.code === Constants.APIErrors.CANNOT_MESSAGE_USER)
                response = "Your DMs are closed, i cannot message you"
            else
                response = error.message
        }
        finally {
            return interaction.editReply(response);
        }
    }

    async execute(message: Message, { }: commandLiteral): Promise<unknown> {
        let response: string;
        try {
            await messageUser(message.author, message);
        } catch (error) {
            response = error.code === Constants.APIErrors.CANNOT_MESSAGE_USER ?
                "Your DMs are closed, i cannot message you"
                : error.message
        }
        finally {
            return message.reply(response);
        }
    }

    getAliases(): string[] {
        return this._aliases;
    }
    addGuildLog(guildID: Snowflake, log: string) {
        return guildMap.get(guildID).addGuildLog(log);
    }
}

function messageUser(user: User, message: Message) {
    return user.send({
        embeds: [
            new MessageEmbed({
                author: {
                    name: message.author.tag,
                    icon_url: message.author.avatarURL({ format: 'png' })
                },
                thumbnail: {
                    url: message.guild.iconURL({ format: 'png', size: 256 })
                },
                title: `🔖 Message Bookmark`,
                description: `from ${message.channel.toString()} [${message.guild.name}]\n
[${message.content.length > 1 ? message.content.substr(0, 500) + "..." : `Jump`}](${message.url})`,
                color: `#fe85a6`,
                image: { url: message.attachments.first()?.url },
                timestamp: new Date(),
            }), ...message.embeds.map(emb => new MessageEmbed(emb))
        ]


    })
}