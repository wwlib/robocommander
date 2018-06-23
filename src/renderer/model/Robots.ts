import {EventEmitter} from "events";
import AppInfo from './AppInfo';
import Robot, {RobotIntent} from './Robot';

export default class Robots extends EventEmitter {

    public robotList: Robot[];
    public robotMap: Map<string, Robot>;

    public lastUpdateTime: number = 0;
    public statusMessages: string;

    private _nextRobotNumber: number = 0;
    private _robotUpdatedHandler: any = this.onRobotUpdated.bind(this);
    private _robotStatusMessageUpdateHandler: any = this.onRobotStatusMessage.bind(this);
    private _robotIntentHandler: any = this.onRobotIntent.bind(this);

    constructor() {
        super();
        this.robotList = [];
        this.robotMap = new Map<string, Robot>();
        this.statusMessages = '';
    }

    initWithData(dataList: any[]): void {
        dataList.forEach((data: any) => {
            let robot: Robot = new Robot();
            robot.initWithData(data);
            this.addRobot(robot);
        })
    }

    onRobotUpdated(robot: Robot): void {
        this.emit('updateRobots', this);
    }


    onRobotStatusMessage(payload: any): void {
        if (payload && payload.message && payload.subsystem) {
            this.updateRobotsStatusMessages(payload.message, payload.subsystem);
        }
    }

    onRobotIntent(robotIntent: RobotIntent): void {
        this.emit('robotIntent', robotIntent);
    }

    updateRobotsStatusMessages(message: string, subsystem?: string, clearMessages: boolean = false): string {
        subsystem = subsystem || '';
        if (clearMessages) {
            this.statusMessages = '';
        } else {
            if (this.statusMessages) {
                this.statusMessages = `${this.statusMessages}\n${subsystem}: ${message}`;
            } else {
                this.statusMessages = `${subsystem}: ${message}`;
            }
        }
        this.emit('updateRobots', this);
        return this.statusMessages;
    }

    get json(): any {
        let json: any[] = [];
        this.robotList.forEach((robot: Robot) => {
            json.push(robot.json);
        });
        return json;
    }

    get robotNames(): string[] {
        let names: string[] = [];
        this.robotList.forEach(robot => {
            names.push(robot.name);
        });
        return names;
    }

    get connectedRobots(): Robot[] {
        let result: Robot[] = [];
        this.robotList.forEach((robot: Robot) => {
            if (robot.connected) {
                result.push(robot);
            }
        });
        return result;
    }

    get targetedRobots(): Robot[] {
        let result: Robot[] = [];
        this.robotList.forEach((robot: Robot) => {
            if (robot.targeted) {
                result.push(robot);
            }
        });
        return result;
    }

    get robotCount(): number {
        return this._nextRobotNumber;
    }

    getRobotWithName(name: string): Robot | undefined {
        return this.robotMap.get(name);
    }

    // enableRobot(robot: Robot, appInfo: AppInfo): void {
    //     robot.enabled = true;
    //
    // }
    //
    // disableRobot(robot: Robot): void {
    //     robot.enabled = false;
    // }

    connectRobot(robot: Robot, appInfo: AppInfo): void {
        robot.connect(appInfo);
    }

    disconnectRobot(robot: Robot): void {
        robot.disconnect();
    }

    addRobot(robot: Robot): void {
        this.robotList.push(robot);
        this.robotMap.set(robot.name, robot);
        robot.on('updateRobot', this._robotUpdatedHandler);
        robot.on('statusMessage', this._robotStatusMessageUpdateHandler);
        robot.on('robotIntent', this._robotIntentHandler);
        this.emit('updateRobots', this);
    }

    removeRobot(robotToRemove: Robot): void {
        let tempRobotList: Robot[] = [];
        let tempRobotMap: Map<string, Robot> = new Map<string, Robot>();
        this.robotList.forEach(robot => {
            if (robot != robotToRemove) {
                tempRobotList.push(robot);
                tempRobotMap.set(robot.name, robot);
            }
        });
        this.robotList = tempRobotList;
        this.robotMap = tempRobotMap;
        robotToRemove.removeListener('updateRobot', this._robotUpdatedHandler);
        robotToRemove.removeListener('statusMessage', this._robotStatusMessageUpdateHandler);
        robotToRemove.removeListener('robotIntent', this._robotIntentHandler);
        this.emit('updateRobots', this);
    }

    onUpdateStats(robot: Robot): void {
        this.lastUpdateTime = new Date().getTime();
        this.emit('updateStats', this);
    }

    getNextRobotInRobotList(robot: Robot): Robot {
      let result: Robot = this.robotList[1]; // skip <SIMULATOR> at index 0
      let index: number = this.robotList.indexOf(robot);
      if(index >= 0 && index < this.robotList.length - 1) {
         result = this.robotList[index + 1]
      }
      return result;
    }
}
