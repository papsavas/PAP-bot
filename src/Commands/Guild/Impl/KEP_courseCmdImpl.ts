import { ApplicationCommandData, Collection, CommandInteraction, Message, Snowflake } from "discord.js";
import { guildMap } from "../../..";
import { categories, guildId, roles } from "../../../../values/KEP/IDs.json";
import { commandLiteral } from "../../../Entities/Generic/command";
import { Course } from "../../../Entities/KEP/Course";
import { fetchCommandID } from "../../../Queries/Generic/Commands";
import { addCourse, dropCourse } from "../../../Queries/KEP/Course";
import { AbstractGuildCommand } from "../AbstractGuildCommand";
import { KEP_courseCmd } from "../Interf/KEP_CourseCmd";

const [_create, _update, _delete] = ["create", "update", "delete"];
export class KEP_courseCmdImpl extends AbstractGuildCommand implements KEP_courseCmd {

    protected _id: Collection<Snowflake, Snowflake>;
    protected _keyword = `course`;
    protected _guide = `Διαχειρίζεται τα μαθήματα στη ΒΔ`;
    protected _usage = `${this.keyword} create | update | delete ...`;
    private constructor() { super() }
    static async init(): Promise<KEP_courseCmd> {
        const cmd = new KEP_courseCmdImpl();
        cmd._id = await fetchCommandID(cmd.keyword);
        return cmd;
    }
    private readonly _aliases = this.addKeywordToAliases
        (
            [], this.keyword
        );
    getCommandData(guild_id: Snowflake): ApplicationCommandData {
        return {
            name: this.keyword,
            description: this.guide,
            type: 'CHAT_INPUT',
            options: [
                {
                    name: _create,
                    description: `Δημιουργεί ένα νέο μάθημα`,
                    type: 'SUB_COMMAND',
                    options: [
                        {
                            name: 'code',
                            description: `Κωδικός μαθήματος`,
                            type: 'STRING',
                            required: true
                        },
                        {
                            name: 'name',
                            description: `Όνομα μαθήματος (κεφαλαία)`,
                            type: 'STRING',
                            required: true
                        },
                        {
                            name: 'semester',
                            description: `Εξάμηνο μαθήματος (9 για διδακτικη)`,
                            type: 'NUMBER',
                            required: true
                        }
                    ]
                },
                {
                    name: _delete,
                    description: `Διαγράφει ένα υπάρχον μάθημα`,
                    type: 'SUB_COMMAND',
                    options: [
                        {
                            name: 'code',
                            description: `Κωδικός μαθήματος`,
                            type: 'STRING',
                            required: true
                        },

                    ]
                }
            ]
        }
    }
    async interactiveExecute(interaction: CommandInteraction): Promise<unknown> {
        const subCmd = interaction.options.getSubcommand(true);
        await interaction.deferReply({ ephemeral: true })
        const course: Course = null; //TODO: construct course from user data
        const year = (typeof course.semester === "number") ? course.semester : parseInt(course.semester) / 1.5;
        try {
            switch (subCmd) {
                case _create: {
                    const role = await interaction.guild.roles.create({
                        name: course.name,
                        reason: "created role for new course"
                    })
                    let categoryId: Snowflake;
                    if (year === 1)
                        categoryId = categories.etos1;
                    else if (year === 2)
                        categoryId = categories.etos2;
                    else if (year === 3)
                        categoryId = categories.etos3;
                    else if (year === 4)
                        categoryId = categories.etos4_2;
                    else
                        categoryId = categories.didaktiki;

                    const channel = await interaction.guild.channels.create(course.name, {
                        parent: categoryId,
                        topic: `Το κανάλι του μαθήματος **${course.name}**. Κοιτάτε πάντα τα  📌***pinned*** για σημαντικό υλικό`,
                        reason: "created channel for new course",
                        permissionOverwrites: [
                            {
                                id: roles.mod,
                                allow: ['MANAGE_MESSAGES'],
                                type: "role"
                            },
                            {
                                id: course.role_id,
                                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
                                type: "role"
                            },
                            {
                                id: roles.overseer,
                                allow: ['VIEW_CHANNEL'],
                                type: "role"
                            },
                            {
                                id: guildId,
                                deny: ['VIEW_CHANNEL'],
                                type: "role"
                            }
                        ]
                    })
                    course.channel_id = channel.id;
                    course.role_id = role.id;
                    const res = await addCourse(course);
                    return interaction.editReply(`Το μάθημα **${course.name} (${course.code})** δημιουργήθηκε με επιτυχία!.
Κανάλι: ${channel.toString()}, Ρόλος: ${role.toString()}`);
                }

                case _update: {
                    throw "not implemented"
                }

                case _delete: {
                    await interaction.guild.roles.cache.get(course.role_id)
                        .delete(`${interaction.user.username} deleted course ${course.name}`);
                    await interaction.guild.channels.cache.get(course.channel_id)
                        .delete(`${interaction.user.username} deleted course ${course.name}`);
                    return dropCourse(course.code);
                }
                default: {
                    return interaction.editReply("scenario not handled")
                }
            }
        } catch (error) {
            return interaction.editReply(error.toString());
        }

    }
    async execute(message: Message, { }: commandLiteral): Promise<unknown> {
        return message.reply(`Παρακαλώ χρησιμοποιείστε Slash Command \`/${this.usage}\``)
    }
    getAliases(): string[] {
        return this._aliases;
    }
    addGuildLog(guildID: Snowflake, log: string) {
        return guildMap.get(guildID).addGuildLog(log);
    }
}