import { ApplicationCommandData, ChatInputApplicationCommandData, Collection, CommandInteraction, Message, MessageActionRow, MessageButton, Snowflake } from "discord.js";
import { fetchCommandID } from "../../../Queries/Generic/Commands";
import { AbstractGlobalCommand } from "../AbstractGlobalCommand";
import { tictactoeCmd } from "../Interf/tictactoeCmd";

const opponentLiteral: ApplicationCommandData['name'] = "opponent";
const emtpyBoard: MessageActionRow[] = ["11", "21", "31"]
    .map(v => new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId(v)
                .setLabel('+')
                .setStyle("SECONDARY"),

            new MessageButton()
                .setCustomId(v[0] + `${parseInt(v[1]) + 1}`)
                .setLabel('+')
                .setStyle("SECONDARY"),

            new MessageButton()
                .setCustomId(v[0] + `${parseInt(v[1]) + 2}`)
                .setLabel('+')
                .setStyle("SECONDARY")
        ));


const isWin = (board: MessageButton[][]) => {
    //Check each row
    for (let i = 0; i < 3; i++) {
        if (board[i][0].style == board[i][1].style && board[i][1].style == board[i][2].style && board[i][0].disabled) {
            return true;
        }
    }

    //Check each column
    for (let j = 0; j < 3; j++) {
        if (board[0][j].style == board[1][j].style && board[1][j].style == board[2][j].style && board[0][j].disabled) {
            return true
        }
    }

    //Check the diagonals
    if (board[0][0].style == board[1][1].style && board[1][1].style == board[2][2].style && board[0][0].disabled) {
        return true
    }
    if (board[2][0].style == board[1][1].style && board[1][1].style == board[0][2].style && board[2][0].disabled) {
        return true
    }
}

export class tictactoeCmdImpl extends AbstractGlobalCommand implements tictactoeCmd {

    id: Collection<Snowflake, Snowflake> = new Collection(null);
    readonly keyword = `tictactoe`;
    readonly guide = `Spawns a tic-tac-toe board`;
    readonly usage = `${this.keyword}`;
    private constructor() { super() }

    static async init(): Promise<tictactoeCmd> {
        const cmd = new tictactoeCmdImpl();
        cmd.id = await fetchCommandID(cmd.keyword);
        return cmd;
    }

    readonly aliases = this.mergeAliases
        (
            ['tictactoe', 'tic-tac-toe', 'triliza', '??????????????'], this.keyword
        );

    getCommandData(): ChatInputApplicationCommandData {
        return {
            name: this.keyword,
            description: this.guide,
            type: 'CHAT_INPUT',
            options: [
                {
                    name: opponentLiteral,
                    description: `play against`,
                    type: "USER",
                    required: true
                }
            ]
        }
    }
    async interactiveExecute(interaction: CommandInteraction): Promise<void> {
        const user = interaction.user;
        const opponent = interaction.options.getUser(opponentLiteral, true);
        if (user.id === opponent.id)
            return interaction.reply({ content: "You can't play against yourself", ephemeral: true });

        if (opponent.bot)
            return interaction.reply({ content: `${opponent.username} is a bot`, ephemeral: true });

        const channel = interaction.channel;
        await interaction.reply({
            content: `<@!${opponent.id}> you were challenged to a battle of Tic Tac Toe by <@!${user.id}>`,
            allowedMentions: { repliedUser: false, users: [opponent.id] }
        });
        const msg = await channel.send({ content: 'lets play', components: emtpyBoard });
        const collector = msg.createMessageComponentCollector(
            {
                time: 120000,
                componentType: "BUTTON"

            }
        )
        let turn = user.id;
        collector.on("collect", async (buttonInteraction) => {
            if (![user.id, opponent.id].includes(buttonInteraction.user.id))
                return await buttonInteraction.reply({ content: `you were not invited for this game`, ephemeral: true });

            if (turn !== buttonInteraction.user.id)
                return await buttonInteraction.reply({ content: `It's not your turn, wait for opponent`, ephemeral: true });

            if (buttonInteraction.isButton()) {
                const id = buttonInteraction.customId;
                const basePlayedButton = new MessageButton({
                    customId: id,
                    disabled: true,
                    style: "PRIMARY"
                })
                const userPlayedButton = new MessageButton(basePlayedButton)
                    .setStyle("SUCCESS")
                    .setEmoji("???");

                const opponentPlayedButton = new MessageButton(basePlayedButton)
                    .setStyle("PRIMARY")
                    .setEmoji("???");

                const updatedBoard = (await msg.fetch()).components.map(ar => new MessageActionRow()
                    .addComponents(
                        ar.components.map(b =>
                            b.customId === id ?
                                buttonInteraction.user.id === user.id ?
                                    userPlayedButton : opponentPlayedButton
                                : b
                        ))
                )

                await buttonInteraction.update({
                    components: updatedBoard
                });

                turn = turn === user.id ? opponent.id : user.id;

                const buttons: MessageButton[][] = [];
                updatedBoard.forEach((ar, i) => {
                    buttons.push([]);
                    buttons[i].push(...ar.components as MessageButton[]);
                });
                if (isWin(buttons)) collector.stop('win');
            }

        })

        collector.on("end", async (collected, reason) => {
            console.log(`tictactoe collector finished with reason ${reason}`);
            switch (reason) {
                case 'win':
                    await msg.edit({
                        content: `**WE HAVE A WINNER!!!**\n**AND A LOSER --> <@!${turn}> <--**`,
                        components: (await msg.fetch()).components.map(ar => new MessageActionRow()
                            .addComponents(
                                ar.components.map(b =>
                                    b.setDisabled(true)
                                ))
                        )
                    })
                    break;
                default:
                    await msg.edit({
                        content: `\`\`\`game ended because of ${reason}\`\`\``,
                        components: (await msg.fetch()).components.map(ar => new MessageActionRow()
                            .addComponents(
                                ar.components.map(b =>
                                    b.setDisabled(true)
                                ))
                        )
                    })
                    break;
            }


        });
    }
    async execute(message: Message, commandLiteral): Promise<void> {
        return
    }


}