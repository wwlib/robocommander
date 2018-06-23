const neo4j = require('neo4j-driver').v1;

import D3Helper from './helpers/D3Helper';

export type GraphConnection = {
    type?: string; // i.e. neo4j
    url: string;
    user: string;
    password: string;
    initialCypher?: string;
}

export default class Neo4jController {

    public driver: any;

    constructor(connection: GraphConnection) {
        try {
            this.driver = neo4j.driver(connection.url, neo4j.auth.basic(connection.user, connection.password));
        } catch (err) {
            console.log(`Neo4jController: constructor: `, err);
            this.driver = undefined;
        }

    }

    call(cypher:string, params?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            let session: any = this.driver.session();
            session.run(cypher, params)
                .then(function (result: any) {
                    session.close();
                    resolve(result);
                })
                .catch(function (error: any) {
                    reject(error);
                });
        });
    }

    getCypherAsD3(cypher: string, params?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.call(cypher, params)
                .then(response => {
                    resolve(D3Helper.data(response, neo4j));
                })
                .catch(error => {
                    reject(error);
                });
            });
    }

    getNodesAndRelationships(limit: number = 25): Promise<any> {
        return new Promise((resolve, reject) => {
            let cypher: string = `
                MATCH (n)-[r]-(p), (q) return n,r,p, q limit ${limit}
            `;
            this.call(cypher)
                .then(response => {
                    resolve(D3Helper.data(response, neo4j));
                })
                .catch(error => {
                    reject(error);
                });
            });
    }

    getNodesWithPropertyAndValue(property: string, value: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let cypher: string = `
                MATCH (n {${property}: "${value}"})-[r]-(p)
                return n,r,p
            `;
            this.call(cypher)
                .then(response => {
                    resolve(D3Helper.data(response, neo4j));
                })
                .catch(error => {
                    reject(error);
                });
            });
    }

    test() {
        this.call('MATCH (n) return n LIMIT 10')
            .then(result => {
                console.log(result);
            })
            .catch(error => {
                console.log(error);
            })
    }
}
