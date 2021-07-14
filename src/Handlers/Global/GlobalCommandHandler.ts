import { CommandInteraction, Interaction } from "discord.js";

export interface GlobalCommandHandler {
    onSlashCommand(interaction: CommandInteraction): Promise<any>;
}