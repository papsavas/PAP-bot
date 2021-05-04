
import { AbstractCommand } from "../AbstractCommand";
import { unlockCommand as _keyword } from '../../keywords.json';
import { GunlockCommand as _guide } from '../../guides.json';
import { ApplicationCommandData, CommandInteraction, Message } from "discord.js";
import { commandType } from "../../../Entities/Generic/commandType";
import { guildLoggerType } from "../../../Entities/Generic/guildLoggerType";
import { overrideCommandPerms } from "../../../Queries/Generic/guildRolePerms";
import { unlockCommandCmd } from "../Interf/unlockCommandCmd";


export class UnlockCommandCmdImpl extends AbstractCommand implements unlockCommandCmd {
    private readonly _aliases = this.addKeywordToAliases
        (
            ['unlockcmd', 'unlockcommand', 'unlock_command', 'unlock_cmd'],
            _keyword
        );

    getCommandData(): ApplicationCommandData {
        return {
            name: `lockCommand`,
            description: this.getGuide(),
            options: [
                {
                    name: 'command_name',
                    description: 'command name to unlock',
                    type: 'STRING',
                    required: true
                }
            ]
        }
    }

    async interactiveExecute(interaction: CommandInteraction): Promise<any> {
        const guild_id = interaction.guildID;
        const command_id = interaction.options[0].value as string; //cannot retrieve command from aliases, must be exact
        await interaction.defer(true);
        await overrideCommandPerms(guild_id, command_id, [guild_id]);
        return interaction.reply(`Command ${command_id} unlocked`, { ephemeral: true });
    }

    execute(receivedMessage: Message, receivedCommand: commandType, addGuildLog: guildLoggerType): Promise<any> {
        const guild_id = receivedMessage.guild.id;
        const command_id = receivedCommand.arg1; //cannot retrieve command from aliases, must be exact
        return overrideCommandPerms(guild_id, command_id, [guild_id]);
    }

    getKeyword(): string {
        return _keyword
    }

    getAliases(): string[] {
        return this._aliases
    }

    getGuide(): string {
        return _guide;
    }

}
