import {Class} from "./Class";
import {Collection} from "discord.js";

export interface Teacher  {
    username: string,
    fullName: string,
    email: string,
    picture_url?: URL,
    website?: URL,
    classes: Collection<Class['role_id'],Class[]>
}