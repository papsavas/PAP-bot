import { ChatInputApplicationCommandData, CommandInteraction, Constants, Message, Snowflake } from "discord.js";
import { guildMap } from "../../..";
import { guildId as kepGuildId } from "../../../../values/KEP/IDs.json";
import { examsPrefix } from "../../../../values/KEP/literals.json";
import { commandLiteral } from "../../../Entities/Generic/command";
import { KepGuild } from "../../../Handlers/Guilds/Impl/KepGuild";
import { fetchCommandID } from "../../../Queries/Generic/Commands";
import { textSimilarity } from "../../../tools/cmptxt";
import { sliceToEmbeds } from "../../../tools/Embed";
import { AbstractGuildCommand } from "../AbstractGuildCommand";
import { KEP_myExamsCmd } from "../Interf/KEP_myExamsCmd";

export class KEP_myExamsCmdImpl extends AbstractGuildCommand implements KEP_myExamsCmd {

    protected _id: Snowflake;
    protected _keyword = `myexams`;
    protected _guide = `Εμφανίζει τα επερχόμενα εξεταζόμενα μαθήματά σας`;
    protected _usage = `myexams`;
    private constructor() { super() }

    static async init(): Promise<KEP_myExamsCmd> {
        const cmd = new KEP_myExamsCmdImpl();
        cmd._id = await fetchCommandID(cmd.keyword);
        return cmd;
    }

    private readonly _aliases = this.addKeywordToAliases
        (
            ['my_exams', 'exams', 'myexams'], this._keyword
        );

    getCommandData(guild_id: Snowflake): ChatInputApplicationCommandData {
        return {
            name: this.keyword,
            description: this.guide,
            type: 'CHAT_INPUT',
        }
    }

    async interactiveExecute(interaction: CommandInteraction): Promise<unknown> {
        const courses = (guildMap.get(kepGuildId) as KepGuild).students.get(interaction.user.id)?.courses;
        const events = (guildMap.get(kepGuildId) as KepGuild).events
            .filter(ev => ev.summary?.startsWith(examsPrefix));

        if (!courses || courses.size === 0)
            return interaction.reply({
                content: `Δεν έχετε επιλέξει μαθήματα`,
                ephemeral: true
            })

        if (events.length === 0)
            return interaction.reply({
                content: `Δεν βρέθηκαν προγραμματισμένα μαθήματα`,
                ephemeral: true
            })

        const studentClasses = events
            .map(ev => ({
                ...ev,
                summary: ev.summary.replace(examsPrefix, '')
                    .trimStart()
                    .trimEnd()
            })
            )
            .filter(ev => courses
                .find(c => textSimilarity(
                    c.name,
                    ev.summary
                ) > 0.85
                )
            )
        if (studentClasses.length === 0)
            return interaction.reply({
                content: `Δεν βρέθηκε προσεχές μάθημα`,
                ephemeral: true
            });

        const responseEmbeds = sliceToEmbeds({
            data: studentClasses.map(ev => ({ name: ev.summary, value: `${ev.start.dateTime ?? "date"}` })),
            headerEmbed: {
                title: `MyExams`,
                description: `Description`
            }
        })

        interaction.user.send({ embeds: responseEmbeds })
            .then(msg => interaction.reply({
                content: `Σας το έστειλα σε DM`,
                ephemeral: true
            }))
            .catch(err => {
                if (err.code === Constants.APIErrors.CANNOT_MESSAGE_USER)
                    return interaction.reply({
                        content: `Τα DMs σας ειναι κλειστά, το αποστέλλω εδώ`,
                        embeds: responseEmbeds,
                        ephemeral: true
                    });
                else
                    throw err;
            })
    }

    async execute(message: Message, { }: commandLiteral): Promise<unknown> {
        const courses = (guildMap.get(kepGuildId) as KepGuild).students.get(message.author.id)?.courses;
        const events = (guildMap.get(kepGuildId) as KepGuild).events
            .filter(ev => ev.summary?.startsWith(examsPrefix));

        if (!courses || courses.size === 0)
            return message.reply({
                content: `Δεν βρέθηκαν μαθήματα`
            })

        if (events.length === 0)
            return message.reply({
                content: `Δεν βρέθηκαν προγραμματισμένα μαθήματα`
            })

        const studentCourses = events
            .map(ev => Object.assign(ev, {
                summary: ev.summary.replace(examsPrefix, '')
                    .trimStart()
                    .trimEnd()
            }))
            .filter(ev => courses
                .find(c => textSimilarity(
                    c.name,
                    ev.summary
                ) > 0.85
                )
            )

        const responseEmbeds = sliceToEmbeds({
            data: studentCourses.map(ev => ({ name: ev.summary, value: ev.start.date })),
            headerEmbed: {
                title: `MyExams`,
                description: `Description`
            }
        })

        try {
            return message.author.send({ embeds: responseEmbeds });
        } catch (error) {
            if (error.code === Constants.APIErrors.CANNOT_MESSAGE_USER) {
                const emoji = "📨";
                const msg = await message.reply(`Έχετε κλειστά DMs. Εαν θέλετε να το στείλω εδώ, πατήστε το ${emoji}`);
                await msg.react(emoji);
                await msg.react("🗑️");
                const collected = await msg.awaitReactions({
                    filter: (reaction, user) => ['🗑️', '🗑', emoji].includes(reaction.emoji.name) && !user.bot,
                    time: 10000,
                    max: 1
                })
                if (collected.first().emoji.name === emoji)
                    await message.reply({ embeds: responseEmbeds });
                await msg.delete();
            }
        }
    }

    getAliases(): string[] {
        return this._aliases;
    }
    addGuildLog(guildID: Snowflake, log: string) {
        return guildMap.get(guildID).addGuildLog(log);
    }
}