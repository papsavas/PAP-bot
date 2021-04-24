import {Snowflake} from "discord.js";
import {addRow, fetchAllOnCondition} from "../../DB/AbstractRepository";

export async function fetchGuildMemberResponses(guildID: Snowflake): Promise<string[]> {
    try {
        const raw = await fetchAllOnCondition(
            'guild_responses',
            {"guild_id": guildID},
            ['member_id', 'response']) as { member_id: Snowflake, response: string }[];
        const respArr: string [] = [];
        raw.forEach(obj => respArr.push(obj.response))
        return Promise.resolve(respArr);
    } catch (err) {
        return Promise.reject(err);
    }
}

export function addMemberResponse(guild_id: Snowflake, member_id: Snowflake, response: string, nsfw: boolean){
    return addRow('guild_responses',
        {
            "guild_id" : guild_id,
            "member_id": member_id,
            "response": response,
            "nsfw": nsfw
            },
        ['response'])
}