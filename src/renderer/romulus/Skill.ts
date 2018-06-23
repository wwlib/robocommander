import Robot, { RobotIntentData } from '../model/Robot';

export default abstract class Skill {

    public robot: Robot | undefined;
    public id: string;
    public launchIntent: string = '';
    public running: boolean = false;


    constructor(robot: Robot | undefined, id: string, launchIntent: string) {
        this.robot = robot;
        this.id = id;
        this.launchIntent = launchIntent;
    }

    abstract launch(data?: RobotIntentData): void;

    abstract tick(frameTime: number, elapsedTime: number): void;
}
