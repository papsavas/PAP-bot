import moment, { MomentInput } from "moment";

export { scheduleTask, snooze };

const snooze = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function scheduleTask(date: MomentInput, callback: () => unknown) {
    try {
        const awaitTime = moment(date).diff(moment(), 'milliseconds');
        if (awaitTime > 0 && awaitTime < 2 ** 30) {
            await snooze(awaitTime);
            return callback();
        }
    } catch (err) {
        console.error(err);
    }
}