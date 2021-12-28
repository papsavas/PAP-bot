import { BaseCommandInteraction, Collection, InteractionReplyOptions, Message, ReplyMessageOptions, Snowflake } from "discord.js";
import { commandLiteral, CommandScope } from "../Entities/Generic/command";
import { GenericCommand } from "./GenericCommand";

export abstract class AbstractCommand implements GenericCommand {
    readonly id: Collection<Snowflake, Snowflake>;
    readonly aliases: string[];
    readonly abstract keyword: string;
    readonly abstract guide: string;
    readonly abstract usage: string;
    readonly abstract type: CommandScope;

    abstract execute(receivedMessage: Message, receivedCommand: commandLiteral): Promise<unknown>;
    abstract interactiveExecute(interaction: BaseCommandInteraction): Promise<unknown>;

    respond = async (
        source: Message | BaseCommandInteraction,
        response: ReplyMessageOptions | InteractionReplyOptions
    ) =>
        source instanceof BaseCommandInteraction ?
            source.replied ?
                source.followUp(response) :
                source.deferred ?
                    source.editReply(response) :
                    source.reply(response) :
            source.reply(response)

    matchAliases(possibleCommand: string): boolean {
        return this.aliases
            .some((alias: string) => alias === possibleCommand?.toLowerCase());
    }

    /**
     * 
     * @param {string[]} aliases 
     * @param {string} keyword 
     * @returns {string[]} An array of aliases with the keyword included
     */
    protected mergeAliases(aliases: string[], keyword: string): string[] {
        return aliases.includes(keyword) ? aliases : [...aliases, keyword]
    }
}