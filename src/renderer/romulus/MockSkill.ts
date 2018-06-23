import Skill from './Skill';
import Robot, { RobotIntentData } from '../model/Robot';

export default class MockSkill extends Skill {

    constructor(robot: Robot) {
        super(robot, 'mockSkill', 'mockIntent');
    }

    launch(data?: RobotIntentData) :void {

    }

    tick(frameTime: number, elapsedTime: number): void {

    }
}
