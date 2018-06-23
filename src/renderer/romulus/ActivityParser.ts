export type ActivityEvent = {
    robot: string;
    time: Date;
    action: string;
    intent: string;
    loopMember: string;
    summary: string
}

export default class ActivityParser {

    public nodeMap: Map<number, any> = new Map<number, any>();
    public linkMap: Map<number, any> = new Map<number, any>();
    public events: ActivityEvent[] = [];

    constructor(data: any) {
        data.nodes.forEach((node: any) => {
            this.nodeMap.set(node.id, node);
        });
        data.links.forEach((link: any) => {
            this.linkMap.set(link.id, link);
            let startNode = this.nodeMap.get(link.startNode);
            let endNode = this.nodeMap.get(link.endNode);

            let activityEvent: ActivityEvent = {
                robot: startNode.properties.name,
                time: link.properties.time,
                action: link.type,
                intent: '',
                loopMember: link.properties.user,
                summary: ''
            }

            if (endNode.labels[0] == 'Intent') {
                activityEvent.intent = endNode.properties.name;
            }

            switch (activityEvent.intent) {
                case 'launchJoke':
                    activityEvent.summary = `I told a joke to ${activityEvent.loopMember}`;
                    break;
                case 'launchClock':
                    activityEvent.summary = `I told ${activityEvent.loopMember} the time`;
                    break;
            }

            this.events.push(activityEvent);
        });
    }
}
