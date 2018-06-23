import Hub from './Hub';
import EnsembleSkill from './EnsembleSkill';
import Robot, { RobotIntentData } from '../model/Robot';

export default class ClockEnsembleSkill extends EnsembleSkill {

    constructor(id: string, launchIntent: string) {
        super (id, launchIntent);
    }

    launch(data: RobotIntentData) :void {
        console.log(`ClockEnsembleSkill: launch: running: ${this.running}`);
        if (!this.running) {
            this.running = true;
            let hubArray: Hub[] = this.getShuffledArrayOfHubs();
            if (hubArray && hubArray.length > 0) {
                let time: Date = new Date();
                let hours: number = time.getHours(); //'9';
                if (hours > 12) {
                    hours -= 12;
                }
                let minutes: number =  time.getMinutes(); //'35'
                let minutesPrefix: string = (minutes < 10) ? 'oh' : '';
                let timePrompt: string = `<anim name='emoji-clock-hf-01' nonBlocking='true'/>The current time is ${hours} ${minutesPrefix} ${minutes}`;

                let primaryHub: Hub | undefined = hubArray.shift();
                if (primaryHub && primaryHub.robot) {
                    let robot: Robot = primaryHub.robot;
                    if (robot.requester) {
                        let p = robot.requester.expression.say(timePrompt).complete;
                        p.then( () => {
                            // console.log(`ClockEnsembleSkill: launch: done`);
                            this.running = false;
                        })
                        .catch((result: any) => {
                            robot.updateRobotStatusMessages(JSON.stringify(result, null, 2))
                        })
                    }
                }

                hubArray.forEach((hub: Hub) => {
                    if (hub && hub.robot) {
                        let robot: Robot = hub.robot;
                        if (robot.requester) {
                            let prompt: string = `<break size='3.0'/><anim cat='shift' layers='body' nonBlocking='true'/><anim cat='happy' layers='screen' filter='&(eye-only)' nonBlocking='true' />.Yeah, that's right.`;
                            // let p = robot.requester.play.say(`<break size='3.0'/><anim cat='shift' layers='body' nonBlocking='true'/><anim cat='happy' layers='screen' filter='&(eye-only)' nonBlocking='true' />.Yeah, that's right.`).complete;
                            let p = robot.requester.expression.say(prompt).complete;
                            p.then( () => {
                                // console.log(`ClockEnsembleSkill: launch: done`);
                            })
                            .catch((result: any) => {
                                robot.updateRobotStatusMessages(JSON.stringify(result, null, 2))
                            })
                        }
                    }
                });
            }
        }
    }

    tick(frameTime: number, elapsedTime: number): void {

    }

}
