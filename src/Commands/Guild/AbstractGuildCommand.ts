
import { ApplicationCommandData, Snowflake } from 'discord.js';
import { CommandScope } from '../../Entities/Generic/command';
import { AbstractCommand } from "../AbstractCommand";
import { GenericGuildCommand } from "./GenericGuildCommand";

export abstract class AbstractGuildCommand extends AbstractCommand implements GenericGuildCommand {
    readonly type = CommandScope.GUILD;

    abstract getCommandData(guildID: Snowflake): ApplicationCommandData;
}