import { Snowflake } from "discord.js";
import { URL } from "node:url";

type dayType = 1 | 2 | 3 | 4 | 5;
type timeType = 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21;
type semesterType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;  //9 για άλλα τμήματα

export interface Course {
    code: string;
    name: string;
    semester: `${semesterType}` | semesterType;
    channel_id: Snowflake;
    role_id: Snowflake;
    repo_link?: URL;
    day?: `${dayType}` | dayType;
    time?: `${timeType}` | timeType;
    video_conference_link?: URL;
    drive_link?: string;
    uuid?: string;
}