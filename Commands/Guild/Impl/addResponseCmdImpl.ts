import {addresponse as _keyword} from '../../keywords.json';
import {Gaddresponse as _guide} from '../../guides.json';
import {injectable} from "Inversify";
import {AbstractCommand} from "../AbstractCommand";
import {addResponseCmd} from "../Interf/addResponseCmd";
import {Message} from "discord.js";
import {commandType} from "../../../Entities/Generic/commandType";
import {guildLoggerType} from "../../../Entities/Generic/guildLoggerType";
import {loadSwearWords} from "../../../Queries/Generic/loadSwearWords";
import {addMemberResponse} from "../../../Queries/Generic/MemberResponses";


@injectable()
export class AddResponseCmdImpl extends AbstractCommand implements addResponseCmd {
    private readonly _aliases = this.addKeywordToAliases
    (
        ['addresponse', 'add_response', 'ar'],
        _keyword
    );


    public async execute(receivedMessage: Message, receivedCommand: commandType, addGuildLog: guildLoggerType) {
        const swears = await loadSwearWords();
        const nsfw = !!swears.find((swear) => receivedMessage.content.includes(swear['swear_word']));
        return addMemberResponse(receivedMessage.guild.id, receivedMessage.member.id, receivedCommand.commandless1, nsfw)
    }

    getKeyword(): string {
        return _keyword;
    }

    getAliases(): string[] {
        return this._aliases;
    }

    getGuide(): string {
        return _guide;
    }
}