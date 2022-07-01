import { ClientEvents, Interaction, MessageEmbed } from "discord.js";
import channels from "../../Inventory/channels";
import { dmHandler } from '../../Inventory/DMs';
import { globalCommandHandler, globalCommandsIDs } from '../../Inventory/globalCommandHandler';
import { guilds } from "../../Inventory/guilds";

const name: keyof ClientEvents = "interactionCreate";

const execute = async (interaction: Interaction) => {
    if (interaction.isApplicationCommand()) {
        if (globalCommandsIDs.includes(interaction.commandId)) {
            globalCommandHandler.onSlashCommand(interaction)
                .catch(console.error);
        }
        else if (interaction.guildId) {
            guilds.get(interaction.guildId)
                ?.onSlashCommand(interaction)
                .catch(console.error);
        }
        else {
            dmHandler.onSlashCommand(interaction)
                .catch(console.error);
        }
    }

    else if (interaction.isButton()) {
        if (interaction.guildId) {
            guilds.get(interaction.guildId)
                ?.onButton(interaction)
                .catch(console.error);
        }
        else {
            dmHandler.onButton(interaction)
                .catch(console.error);
            console.log('dm button received');
        }
    }

    else if (interaction.isSelectMenu()) {
        if (interaction.guildId) {
            guilds.get(interaction.guildId)
                ?.onSelectMenu(interaction)
                .catch(console.error);
        }
        else {
            dmHandler.onSelectMenu(interaction)
                .catch(console.error);
            console.log('dm select received');
        }
    }

    else {
        console.log(`unhandled interaction type in ${interaction.channel.id} channel.TYPE = ${interaction.type}`);
        await channels.bugsChannel.send({
            embeds: [
                new MessageEmbed({
                    title: `Untracked Interaction`,
                    description: `received untracked interaction in ${interaction.guild.name}`,
                    fields: [
                        { name: `Type`, value: interaction.type },
                        { name: `Channel`, value: interaction.channel.toString() },
                        { name: `Interaction ID`, value: interaction.id }
                    ]
                })
            ]
        })
    }
}


export default { name, execute };