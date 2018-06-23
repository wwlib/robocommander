// import { Robot } from './Robot';

export default class RobotGroup {

    public name: string;
    public robotList: string[];

    constructor(name?: string) {
        this.name = name || '';
        this.robotList = [];
    }

    // { "name": "Team A", "robots": ["salt", "maize"]}

    initWithData(data: any): void {
        if (data && data.name && data.robots) {
            let robotNames: string[] = data.robots;
            robotNames.forEach((robotName: string) => {
                this.robotList.push(robotName);
            });
        }
    }

    get json(): any {
        let json: any = {
            name: this.name,
            robots: []
        };

        this.robotList.forEach((robotName: string) => {
            json.robots.push(robotName);
        });
        return json;
    }

    get robotNames(): string[] {
        return this.robotList;
    }

    addRobotName(name: string): void {
        this.robotList.push(name);
    }

    removeRobotName(robotNameToRemove: string): void {
        let tempRobotList: string[] = [];
        this.robotList.forEach((robotName: string) => {
            if (robotName != robotNameToRemove) {
                tempRobotList.push(robotName);
            }
        });
    }
}
