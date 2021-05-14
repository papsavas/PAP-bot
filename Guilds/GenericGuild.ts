import * as Discord from 'discord.js';
import { guildSettings } from "../Entities/Generic/guildSettingsType";

export interface GenericGuild {
    onReady(client: Discord.Client): Promise<any>;

    onSlashCommand(interaction: Discord.Interaction): Promise<any>;

    onMessage(message: Discord.Message): Promise<any>;

    onMessageDelete(deletedMessage: Discord.Message): Promise<any>;

    onMessageReactionAdd(messageReaction: Discord.MessageReaction, user: Discord.User): Promise<any>;

    onMessageReactionRemove(messageReaction: Discord.MessageReaction, user: Discord.User): Promise<any>;

    onGuildMemberAdd(member: Discord.GuildMember): Promise<any>;

    onGuildMemberRemove(member: Discord.GuildMember): Promise<any>;

    onGuildMemberUpdate(oldMember: Discord.GuildMember, newMember: Discord.GuildMember): Promise<any>;

    addGuildLog(log: string): string;

    getSettings(): guildSettings;

    setPrefix(newPrefix: string): void;

    fetchCommands(): Promise<Discord.Collection<string, Discord.ApplicationCommand>>;

    loadResponses(): Promise<string | void>;
}