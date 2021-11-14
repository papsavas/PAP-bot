import { Snowflake } from "discord.js";

export interface UserNote {
    uuid?: string,
    user_id: Snowflake,
    note: string,
    createdAt: Date,
    editedAt: Date

}