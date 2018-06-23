import Skill from './Skill';
import Robot, { RobotIntentData } from '../model/Robot';
import PersistenceManager from './PersistenceManager';

export default class DoYouLikeSkill extends Skill {

    constructor(robot: Robot) {
        super(robot, 'DoYouLikeSkill', 'launchLoopMemberLikes');
        console.log(`DoYouLikeSkill: constructor: ${robot.serialName}`);
    }

    launch(data: RobotIntentData) :void {
        if (this.robot) {
            console.log(`DoYouLikeSkill: launch: ${this.robot.serialName}`, data);
            let launchId: string = 'na';
            let user: string | undefined = undefined;
            let thing: string | undefined = undefined;
            let thingOriginal: string | undefined = undefined;
            if (data && data.launchId) {
                launchId = data.launchId;
            }
            let nluData: any;
            if (data && data.nluData) {
                nluData = data.nluData;
            }
            if (nluData && nluData.parameters && nluData.parameters.user) {
                user = nluData.parameters.user;
            }
            if (data && nluData.parameters && nluData.parameters.thing) {
                thing = nluData.parameters.thing;
            }
            if (nluData && nluData.parameters && nluData.parameters.thingOriginal) {
                thingOriginal = nluData.parameters.thingOriginal;
            }
            console.log (nluData, user, thingOriginal);

            if (user && thingOriginal) {
                let prompt: string = `OK. Thank you for telling me that ${user} likes ${thingOriginal}}. I will try and remember that.`;
                if (this.robot.requester) {
                    let p = this.robot.requester.expression.say(prompt).complete;
                    p.then( () => {
                        // console.log(`DoYouLikeSkill: launch: done`);
                        this.running = false;
                        if (this.robot && thing && launchId && user) {
                            PersistenceManager.Instance.persistUserLikesThing(this.robot, thing, launchId, user);
                        } else {
                            console.log(`DoYouLikeSkill: not enough info to call PersistenceManager`);
                        }

                    })
                    .catch((result: any) => {
                        if (this.robot) {
                            this.robot.updateRobotStatusMessages(JSON.stringify(result, null, 2));
                        }
                    })
                }
            }
        } else {
            console.log(`DoYouLikeSkill: launch: error: robot is undefined`);
        }

    }

    tick(frameTime: number, elapsedTime: number): void {

    }
}
