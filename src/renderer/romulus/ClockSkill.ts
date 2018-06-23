import Skill from './Skill';
import Robot, { RobotIntentData } from '../model/Robot';

export default class ClockSkill extends Skill {

    constructor(robot: Robot) {
        super(robot, 'clockSkill', 'launchClock');
        console.log(`ClockSkill: constructor: ${robot.serialName}`);
    }

    launch(data: RobotIntentData) :void {
        if (this.robot) {
            console.log(`ClockSkill: launch: ${this.robot.serialName}`);
            let time: Date = new Date();
            let hours: number = time.getHours(); //'9';
            if (hours > 12) {
                hours -= 12;
            }
            let minutes: number =  time.getMinutes(); //'35'
            let minutesPrefix: string = (minutes < 10) ? 'oh' : '';
            let timePrompt: string = `<anim name='emoji-clock-hf-01' nonBlocking='true'/>The time is ${hours} ${minutesPrefix} ${minutes}`;
            if (this.robot.requester) {
                let p = this.robot.requester.expression.say(timePrompt).complete;
                p.then( () => {
                    // console.log(`Robot: sendCommand: done`);
                })
                .catch((result: any) => {
                    if (this.robot) {
                        this.robot.updateRobotStatusMessages(JSON.stringify(result, null, 2));
                    }
                })
            }
        } else {
            console.log(`ClockSkill: launch: error: robot is undefined`);
        }

    }

    tick(frameTime: number, elapsedTime: number): void {

    }
}
