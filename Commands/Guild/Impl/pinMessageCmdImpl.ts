import {GpinMessage as _guide} from "../../guides.json";
import {pinMessage as _keyword} from "../../keywords.json";
import {injectable} from "Inversify";
import {pinMessageCmd} from "../Interf/pinMessageCmd";
import {AbstractCommand} from "../AbstractCommand";
import {extractId} from "../../../toolbox/toolbox";
import {commandType} from "../../../Entities/Generic/commandType";
import {guildLoggerType} from "../../../Entities/Generic/guildLoggerType";
import { ApplicationCommandData, CommandInteraction, DiscordAPIError, Message, MessageEmbed, TextChannel } from "discord.js";


@injectable()
export class PinMessageCmdImpl extends AbstractCommand implements pinMessageCmd {
    private readonly _aliases = this.addKeywordToAliases
    (
        ['pin', 'πιν'],
        _keyword
    );

    getCommandData(): ApplicationCommandData {
        return {
            name: _keyword,
            description: this.getGuide(),
            options: [
                {
                    name: 'message_id',
                    description: 'targeted message id or link',
                    type: 'STRING',
                    required: true
                },
                {
                    name: 'reason',
                    description: 'reason for pinning',
                    type: 'STRING',
                    required: false
                }
            ]
        }
    }

    async interactiveExecute(interaction: CommandInteraction):Promise<any>{
        const channel = interaction.channel as TextChannel;
        const reason = interaction.options[1].value as string|undefined
        let pinReason = reason ? reason : ``;
        pinReason += `\nby ${interaction.member.displayName}`;
        let pinningMessageID = extractId(interaction.options[0].value as string);
        const fetchedMessage = await channel.messages.fetch(pinningMessageID);    
        return fetchedMessage.pin({reason: pinReason})
            .then((pinnedMessage) => {
                //addGuildLog(`message pinned:\n${pinnedMessage.url} with reason ${pinReason}`);
                interaction.reply(new MessageEmbed({
                    title:`Pinned Message 📌`,
                    description: `[pinned message](${pinnedMessage.url})`
                }))
            })
            .catch(err=> {
                interaction.reply('could not pin message');
            });
    }

    execute(message: Message, {arg1, commandless2}: commandType, addGuildLog: guildLoggerType): Promise<any> {
        const channel = message.channel;
        let pinReason = commandless2 ? commandless2 : ``;
        pinReason += `\nby ${message.member.displayName}`;
        let pinningMessageID = extractId(arg1);
        return channel.messages.fetch(pinningMessageID)
            .then((fetchedMessage) => {
                fetchedMessage.pin({reason: pinReason})
                    .then((pinnedMessage) => {
                        //addGuildLog(`message pinned:\n${pinnedMessage.url} with reason ${pinReason}`);
                        if (message.deletable)
                            message.client.setTimeout(()=> message.delete().catch(), 3000);
                    });
            })
    }

    getAliases(): string[] {
        return this._aliases;
    }

    getGuide(): string {
        return _guide;
    }

    getKeyword(): string {
        return _keyword;
    }
}
