import Neo4jController, { GraphConnection } from '../neo4j/Neo4jController';
// import { d3Types }  from '../neo4j/DataTypes';
import ActivityParser from './ActivityParser';
import AppInfo from '../model/AppInfo';
import Robot from '../model/Robot';
import { Joke } from './JokeSkill';

// const neo4jConfig: any = require ('../../../data/neo4j-config.json');

export default class PersistenceManager {

    private static _instance: PersistenceManager;

    public appInfo: AppInfo | undefined;
    public neo4jController: Neo4jController | undefined;
    public graphConnection: GraphConnection | undefined;

    private constructor(){


        // this.neo4jController.getNodesAndRelationships()
        //     .then((d3Data: d3Types.d3Graph) => {
        //         console.log(`PersistenceManager: d3Data: `, d3Data);
        //     })
        //     .catch((err: any) => {
        //         console.log(`PersistenceManager: construcor: err: `, err);
        //     })

        // this.getActivity('brown');
    }

    public static get Instance()
    {
        // Do you need arguments? Make it a regular method instead.
        return this._instance || (this._instance = new this());
    }

    public connect(appInfo: AppInfo, force: boolean=false): void {
        console.log(`PersistenceManager: connect: `, appInfo);
        this.appInfo = appInfo;
        if (this.appInfo && this.appInfo.neo4j_url && (!this.neo4jController || force)) {
            this.graphConnection = {
                type: 'neo4j',
                url: this.appInfo.neo4j_url,
                user: this.appInfo.neo4j_user,
                password: this.appInfo.neo4j_password
            }
            console.log(`PersistenceManager: connect: instantiating Neo4jController:`, this.graphConnection);
            this.neo4jController = new Neo4jController(this.graphConnection);
        }
    }

    public persistLaunchIntent(robotId: string, userId: string, intent: string, launchId: string): void {
        let timestamp: string = new Date().toLocaleString();
        let cypher: string = `MERGE (i:Intent {name: "${intent}"})
WITH i MERGE (n:Robot {name: "${robotId}"})
WITH i, n MERGE (n)-[r:LAUNCHED {robot: "${robotId}", user: "${userId}", time: "${timestamp}", launchId: "${launchId}"}]->(i) return n, i, r
`;
        let params: any = {};
        if (this.neo4jController) {
            this.neo4jController.call(cypher, params)
                .then((result: any) => {
                    console.log(`PersistenceManager: persistLaunchIntent: `, result, cypher);
                })
                .catch((err: any) => {
                    console.log(`PersistenceManager: persistLaunchIntent: err: `, err, cypher);
                })
        }
    }

    getActivity(robotId: string): Promise<string[]> {
        return new Promise<string[]>((resolve: any, reject: any) => {
            let cypher: string = `MATCH (n:Robot {name: "${robotId}"})-[r:LAUNCHED]->(i:Intent) return n,r,i`;
            let params: any = {};
            if (this.neo4jController) {
                this.neo4jController.getCypherAsD3(cypher, params)
                    .then((result: any) => {
                        console.log(`PersistenceManager: getActivity: `, result);
                        let activityParser: ActivityParser = new ActivityParser(result);
                        console.log(activityParser.events);
                    })
                    .catch((err: any) => {
                        console.log(`PersistenceManager: getActivity: err: `); //, err);
                    })
            }
        })
    }

    persistJoke(robot: Robot, joke: Joke, launchId: string): void {
        let cypher: string = `MERGE (j:Joke {id: "${joke.id}", name: "${joke.name}"})
WITH j MERGE (n:Robot {name: "${robot.name}"})
WITH j, n MERGE (n)-[r:TOLD {robot: "${robot.name}", launchId: "${launchId}"}]->(j) return n, j, r
`;
        let params: any = {};
        if (this.neo4jController) {
            this.neo4jController.call(cypher, params)
                .then((result: any) => {
                    console.log(`PersistenceManager: persistJoke: `, result, cypher);
                })
                .catch((err: any) => {
                    console.log(`PersistenceManager: persistJoke: err: `, err, cypher);
                })
        }
    }

    persistUserLikesThing(robot: Robot, thing: string, launchId: string, userId: string) {
        let cypher: string = `MERGE (e:Entity {name: "${thing}"})
WITH e MERGE (user:User {name: "${userId}"})
WITH e, user MERGE (user)-[r:LIKES {robot: "${robot.name}", launchId: "${launchId}"}]->(e) return user, e, r
`;
        let params: any = {};
        if (this.neo4jController) {
            this.neo4jController.call(cypher, params)
                .then((result: any) => {
                    console.log(`PersistenceManager: persistUserLikesThing: `, result, cypher);
                })
                .catch((err: any) => {
                    console.log(`PersistenceManager: persistUserLikesThing: err: `, err, cypher);
                })
        }
    }

}
