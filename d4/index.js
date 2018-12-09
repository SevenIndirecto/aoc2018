const fs = require('fs');

const input = 'input.txt';
const contents = fs.readFileSync(input, 'utf8');
const logEntries = contents.split('\n').filter(v => v != '');

const CMD_BEGIN_SHIFT = 0
const CMD_FALL_ASLEEP = 1;
const CMD_WAKE_UP = 2;

const inputToChronological = logs => {
	logs = logs.map(log => {
		// [1518-02-28 00:47] falls asleep
		// [1518-10-23 23:47] Guard #1627 begins shift
		// [1518-10-25 00:41] wakes up

		let matches = log.match(/\[([^\]]+)\] (.*)$/);
		let commandString = matches[2];
		let guardMatch = commandString.match(/\w+ #(\d+) begins shift/);
		let command = -1;
		let guard = -1;
		if (guardMatch) {
			guard = parseInt(guardMatch[1]);
			command = CMD_BEGIN_SHIFT;
		} else if (commandString === 'wakes up') {
			command = CMD_WAKE_UP;
		} else {
			command = CMD_FALL_ASLEEP;
		}
		return {
			time: new Date(`${matches[1]} +00`),
			command,
			guard
		}
	});
	
	logs = logs.sort((a, b) => a.time < b.time ? -1 : 1);

	let activeGuard = -1;
	for (log of logs) {
		if (log.guard > -1) {
			activeGuard = log.guard;
		}
		else {
			log.guard = activeGuard;
		}
	}

	return logs;

};


let logs = inputToChronological(logEntries);

let timeFellAsleep = false;
let guardMap = new Map();

for (log of logs) {
	switch (log.command) {
		case CMD_BEGIN_SHIFT:
			if (!guardMap.has(log.guard)) {
				guardMap.set(log.guard, {
					total: 0,
					minutes: new Array(60).fill(0),
				});
			}
			break;
		case CMD_FALL_ASLEEP:
			timeFellAsleep = log.time;
			break;
		case CMD_WAKE_UP:
			let sleepStartMinute = timeFellAsleep.getUTCMinutes();
			let sleepEndMinute = log.time.getUTCMinutes();
			let sleepTime = sleepEndMinute - sleepStartMinute;
			let guardData = guardMap.get(log.guard);
			guardData.total += sleepTime;
			for (let i = sleepStartMinute; i < sleepEndMinute; i++) {
				guardData.minutes[i]++;
			}
			guardMap.set(log.guard, guardData);
			break;
	}
}

// STRATEGY 1
//
// Get guard who slept longest
let maxSleeper = Array.from(guardMap.entries()).reduce((maxSleeper, [guard, {total, minutes}]) => {
	return !maxSleeper || total > maxSleeper[1].total ? [guard, {total, minutes}] : maxSleeper;
}, null);

let maxMinuteValue = 0;
let maxMinute = 0;
for (let i = 0; i < maxSleeper[1].minutes.length; i++) {
	if (maxSleeper[1].minutes[i] > maxMinuteValue) {
		maxMinuteValue = maxSleeper[1].minutes[i];
		maxMinute = i;
	}
}

console.log('STARTEGY 1: Guard: ', maxSleeper[0], 'Max minute: ', 
	maxMinute, 'Checksum: ', maxSleeper[0] * maxMinute);


let maxMinutes = new Array(60).fill().map(() => ({guard: -1, frequency: 0}));
// STRATEGY 2
for ([guard, { minutes }] of guardMap.entries()) {
	for (let i = 0; i < minutes.length; i++) {
		if (minutes[i] > maxMinutes[i].frequency) {
			maxMinutes[i].frequency = minutes[i];
			maxMinutes[i].guard = guard;
		}
	}
}

let maxFrequency = 0;
let maxMinuteStrategy2 = -1;
let maxGuard = -1;
for (let i = 0; i < maxMinutes.length; i++) {
	if (maxMinutes[i].frequency > maxFrequency) {
		maxFrequency = maxMinutes[i].frequency;
		maxMinuteStrategy2 = i;
		maxGuard = maxMinutes[i].guard;
	}
}
console.log('STRATEGY 2: Guard:', maxGuard, 'Minute:', maxMinuteStrategy2, 
		'Frequency:', maxFrequency, 'Checksum:', maxMinuteStrategy2 * maxGuard);




