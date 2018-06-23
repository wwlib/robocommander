import RobotGroup from './RobotGroup';

export default class RobotGroups {

    public robotGroupsList: RobotGroup[];
    public robotGroupsMap: Map<string, RobotGroup>;

    constructor() {
        this.robotGroupsList = [];
        this.robotGroupsMap = new Map<string, RobotGroup>();
    }

    initWithData(dataList: any[]): void {
        dataList.forEach((data: any) => {
            let robotGroup: RobotGroup = new RobotGroup();
            robotGroup.initWithData(data);
            this.robotGroupsList.push(robotGroup);
            this.robotGroupsMap.set(robotGroup.name, robotGroup);
        })
    }

    get json(): any[] {
        let json: any[] = [];
        this.robotGroupsList.forEach(robotGroup => {
            json.push(robotGroup.json);
        });
        return json;
    }

    get robotGroupNames(): string[] {
        let names: string[] = [];
        this.robotGroupsList.forEach(robotGroup => {
            names.push(robotGroup.name);
        });
        return names;
    }

    getRobotGroupWithName(name: string): RobotGroup | undefined {
        return this.robotGroupsMap.get(name);
    }

    addRobotGroup(robotGroup: RobotGroup): void {
        this.robotGroupsList.push(robotGroup);
        this.robotGroupsMap.set(robotGroup.name, robotGroup);
    }

    removeRobotGroup(robotGroupToRemove: RobotGroup): void {
        let tempRobotGroupsList: RobotGroup[] = [];
        let tempRobotGroupsMap: Map<string, RobotGroup> = new Map<string, RobotGroup>();
        this.robotGroupsList.forEach(robotGroup => {
            if (robotGroup != robotGroupToRemove) {
                tempRobotGroupsList.push(robotGroup);
                tempRobotGroupsMap.set(robotGroup.name, robotGroup);
            }
        });
    }
}
