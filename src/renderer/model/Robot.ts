import {EventEmitter} from "events";
import AppInfo from './AppInfo';
import RomCommand from './RomCommand';
import Hub, { NluData } from '../romulus/Hub';

const fs = require('fs');
const http = require('http');

import RobokitConnection from './RobokitConnection';
import {
    Account as JiboAccount,
    AccountCreds as JiboAccountCreds,
    Robot as JiboRobotConnection
} from '@jibo/apptoolkit-library';

import { CommandRequester } from '@jibo/command-requester';

export enum RobotType {
    jibo = 'jibo',
    robokit = 'robokit'
}

export interface RobotData {
    type: string;
    name: string;
    ip: string;
    serialName: string;
    email: string;
    password: string;
}

export enum RobotIntentType {
    LAUNCH,
    LISTEN,
    ACTION_COMPLETE
}

export interface RobotIntentData {
    nluType: string;
    asr: string;
    intent: string;
    launchId: string | undefined;
    nluData: any | undefined;
    userId: string | undefined;
}

export interface RobotIntent {
    robot: Robot;
    type: RobotIntentType;
    data: RobotIntentData;
}

export default class Robot extends EventEmitter {

    private _type: string = 'jibo';
    public name: string = '';
    public ip: string = '';
    public serialName: string = '';
    public email: string = '';
    public password: string = '';
    public appInfo: AppInfo | undefined;

    protected _connected: boolean;
    protected _targeted: boolean;
    protected _robotConnection: JiboRobotConnection | RobokitConnection | undefined;
    protected _hub: Hub;
    private _number: number = 0;
    private _muted: boolean = false;

    private _motionTrackToken: any;
    private _faceTrackToken: any;

    private _stateData: any
    private _keepAliveInterval: any;

    constructor(options?: any) {
        super();
        options = options || {
            type: this.type,
            name: this.name,
            ip: this.ip,
            serialName: this.serialName,
            email: this.email,
            password: this.password,
        }
        this.initWithData(options);
        this._connected = false;
        this._targeted = false;
        this._hub = new Hub(this);
        this._stateData = {userId: '', userName: ''};
    }

    get type(): string {
        return this._type;
    }

    set type(typeString: string) {
        this._type = typeString;
    }

    initWithData(data: RobotData): void {
        this.type = data.type || 'jibo';
        this.name = data.name;
        this.ip = data.ip;
        this.serialName = data.serialName;
        this.email = data.email;
        this.password = data.password;
    }

    updateRobotStatusMessages(message: string, subsystem?: string, clearMessages: boolean = false): string {
        subsystem = subsystem || `Robot<${this.name}>`;
        // if (clearMessages) {
        //     this.statusMessages = '';
        // } else {
        //     if (this.statusMessages) {
        //         this.statusMessages = `${this.statusMessages}\n${subsystem}: ${message}`;
        //     } else {
        //         this.statusMessages = `${subsystem}: ${message}`;
        //     }
        // }
        this.emit('statusMessage', {message: message, subsystem: subsystem});
        return '';
    }

    get number(): number {
        return this._number;
    }

    set number(number: number) {
        this._number = number;
    }

    get json(): RobotData {
        let json: RobotData = {
            type: this.type,
            name: this.name,
            ip: this.ip,
            serialName: this.serialName,
            email: this.email,
            password: this.password,
        };
        return json;
    }

    //// _stateData

    updateUserData(userId: string, userName: string): void {
        this._stateData.userId = userId;
        this._stateData.userName = userName;
    }

    get userData(): any {
        return { userId: this._stateData.userId, userName: this._stateData.userName };
    }

    updateStateData(data: any): any {
        this._stateData = Object.assign(this._stateData, data);
    }

    get stateData(): any {
        return this._stateData;
    }

    set stateData(data: any) {
        this._stateData = data;
    }

    onLaunchIntent(robotIntentData: RobotIntentData ): void {
        let robotIntent: RobotIntent = {robot: this, type: RobotIntentType.LAUNCH, data: robotIntentData};
        this.emit('robotIntent', robotIntent);
    }

    onListenIntent(robotIntentData: RobotIntentData): void {
        let robotIntent: RobotIntent = {robot: this, type: RobotIntentType.LISTEN, data: robotIntentData};
        this.emit('robotIntent', robotIntent);
    }

    sendCommand(command: RomCommand): void {
        this.resetKeepAlive();
        if (this._robotConnection) {
            switch (command.type) {
                case "say":
                case "tts":
                    if (!this._muted && command.data && (command.data.text || command.data.prompt)) {
                        let prompt: string = command.data.text || command.data.prompt;
                        let p = this._robotConnection.requester.expression.say(prompt).complete;
                        p.then( () => {
                            // console.log(`Robot: sendCommand: done`);
                            let robotIntentData: RobotIntentData = {nluType: 'none', asr: '', intent: 'OK', launchId: undefined, nluData: undefined, userId: undefined};
                            let robotIntent: RobotIntent = {robot: this, type: RobotIntentType.ACTION_COMPLETE, data: robotIntentData};
                            this.emit('robotIntent', robotIntent);
                        })
                        .catch((result: any) => {
                            console.log(result);
                            this.updateRobotStatusMessages(JSON.stringify(result, null, 2))
                        })
                    }
                    break;
                case "ask":
                    if (!this._muted && command.data && command.data.prompt) {
                        let prompt: string = command.data.prompt;
                        let contexts:string[] = command.data.contexts || [];
                        let nluDefault: string = 'none';
                        if (this.appInfo && this.appInfo.nluDefault) {
                            nluDefault = this.appInfo.nluDefault;
                        }
                        let nluType: string = command.data.nluType || nluDefault;
                        let p = this._robotConnection.requester.expression.say(prompt).complete;
                        p.then( () => {
                            if (this._robotConnection) {
                                let listenToken = this._robotConnection.requester.listen.start();
                                listenToken.update.on((listenResultEvent: JIBO.v1.ListenResultEvent | undefined) => {
                                    console.log("Hey! I think i heard something: ", listenResultEvent);
                                    // {Event: "onListenResult", LanguageCode: "en-US", Speech: "I'd like to order a pepperoni pizza"}
                                    if (listenResultEvent && listenResultEvent.Event == 'onListenResult' && listenResultEvent.Speech) {
                                        let robotIntentData: RobotIntentData = {nluType: nluType, asr: listenResultEvent.Speech, intent: '', launchId: undefined, nluData: undefined, userId: undefined};
                                        if (nluType != 'none') {
                                            this._hub.getIntent(listenResultEvent.Speech, contexts, nluType)
                                                .then((nluData: NluData) => {
                                                    robotIntentData.intent = nluData.intent;
                                                    robotIntentData.nluData = nluData;
                                                    this.onListenIntent(robotIntentData);
                                                })
                                                .catch((err: any) => {
                                                    console.log(err);
                                                })
                                        } else {
                                            this.onListenIntent(robotIntentData);
                                        }
                                    } else {
                                        this.updateRobotStatusMessages(`Error: invalid listen result: ask`);
                                    }
                                });
                            } else {
                                this.updateRobotStatusMessages(`Error starting listen for command: ask`);
                            }
                        })
                        .catch((result: any) => {
                            console.log(result);
                            this.updateRobotStatusMessages(JSON.stringify(result, null, 2))
                        })


                    }
                    break;
                case "lookAtPosition":
                case "lookAt":
                    if (!this._muted && command.data && (command.data.angle || command.data.vector)) {
                        let p;
                        if (command.data.angle) {
                            let angleVector: CommandRequester.AngleVector = {theta: command.data.angle, psi: 0};
                            let lookAtTarget: CommandRequester.expression.LookAtTarget = { type: "ANGLE", angle: angleVector, levelHead: true};
                            p = this._robotConnection.requester.expression.look(lookAtTarget).complete;
                        } else if (command.data.vector) {
                            let vector: CommandRequester.Vector3 = {x: command.data.vector[0], y: command.data.vector[1], z:command.data.vector[2]}
                            let position: CommandRequester.expression.Position = { type: "POSITION", position: vector, levelHead: true};
                            p = this._robotConnection.requester.expression.look(position).complete;
                        }
                        if (p) {
                            console.log(`p:`, p);
                            p.then( () => {
                                // console.log(`Robot: sendCommand: done`);
                            })
                            .catch((result: any) => {
                                console.log(result);
                                this.updateRobotStatusMessages(JSON.stringify(result, null, 2))
                            })
                        }
                    }
                    break;
                case "attention":
                    if (!this._muted && command.data && command.data.state) {
                        let mode: JIBO.v1.AttentionModes.AttentionModeType = 'OFF';
                        switch (command.data.state) {
                            case "OFF":
                                mode = 'OFF';
                                break;
                            case "IDLE":
                                mode = 'IDLE'
                        }
                        let p = this._robotConnection.requester.expression.setAttention(mode as any).complete
                        p.then( () => {
                            // console.log(`Robot: sendCommand: done`);
                        })
                        .catch((result: any) => {
                            console.log(result);
                            this.updateRobotStatusMessages(JSON.stringify(result, null, 2))
                        })
                    }
                    break;
                case "volume":
                    if (!this._muted && command.data && command.data.volume) {
                        let configOptions: CommandRequester.config.SetConfigOptions = {
                            mixer: Number(command.data.volume)
                        };
                        let p = this._robotConnection.requester.config.set(configOptions).complete;
                        p.then( () => {
                            // console.log(`Robot: sendCommand: done`);
                        })
                        .catch((result: any) => {
                            console.log(result);
                            this.updateRobotStatusMessages(JSON.stringify(result, null, 2))
                        })
                    }
                    break;
                case "mute":
                    this.mute(true);
                    break;
                case "unmute":
                    this.mute(false);
                    break;
                case "image":
                    if (!this._muted && command.data && command.data.url) {
                        let data:JIBO.v1.ImageView = {
                            Type: "Image", //DisplayViewType.Image,
                            Name: command.data.name,
                            Image: {
                                name: command.data.name,
                                src: command.data.url
                            }

                        }
                        let p = this._robotConnection.requester.display.swap(data).complete;
                        p.then( () => {
                            // console.log(`Robot: sendCommand: done`);
                        })
                        .catch((result: any) => {
                            console.log(result);
                            this.updateRobotStatusMessages(JSON.stringify(result, null, 2))
                        })
                    }
                    break;
                case "eye":
                    if (!this._muted) {
                        let data:JIBO.v1.EyeView = {
                            Type: "Eye", //DisplayViewType.Eye,
                            Name: "eye"
                        }
                        let p = this._robotConnection.requester.display.swap(data).complete;
                        p.then( () => {
                            // console.log(`Robot: sendCommand: done`);
                        })
                        .catch((result: any) => {
                            console.log(result);
                            this.updateRobotStatusMessages(JSON.stringify(result, null, 2))
                        })
                    }
                    break;
                case "motion":
                    if (!this._muted && command.data && command.data.state) {
                        if (command.data.state == 'ON') {
                            if (!this._motionTrackToken) {
                                this._motionTrackToken =  this._robotConnection.requester.perception.subscribe.motion()  //this._requester.motionTrack.trackMotions();
                                this._motionTrackToken.update.on((detectedMotions: any) => {
                                    console.log(detectedMotions);
                                    console.log(`detectedMotion: update: count: ${detectedMotions.length}:`, detectedMotions);

                                });
                            }
                        } else if (command.data.state == 'OFF') {
                            if (this._motionTrackToken) {
                                this._motionTrackToken.cancel();
                                this._motionTrackToken = undefined;
                            }
                        }
                    }
                    break;
                case "faces":
                    if (!this._muted && command.data && command.data.state) {
                        if (command.data.state == 'ON') {

                            this._faceTrackToken = this._robotConnection.requester.perception.subscribe.face() //this._requester.faceTrack.trackFaces();
                            this._faceTrackToken.gained.on((detectedEntities: any) => {
                                if (detectedEntities.length > 0) {
                                    var id: number = detectedEntities[0].EntityID;
                                    console.log(`detectedFaces: gained: count: ${detectedEntities.length}, id: ${id}`, detectedEntities);
                                }

                            });
                            this._faceTrackToken.update.on((updatedEntities: any) => {
                                if (updatedEntities.length > 0) {
                                    var id: number = updatedEntities[0].EntityID;
                                    console.log(`detectedFaces: update: count: ${updatedEntities.length}, id: ${id}`, updatedEntities);
                                }
                            });
                        } else if (command.data.state == 'OFF') {
                            if (this._faceTrackToken) {
                                this._faceTrackToken.cancel();
                                this._faceTrackToken = undefined;
                            }
                        }
                    }
                    break;
                case "photo":
                    console.log(this._robotConnection.requester);
                    console.log(this._robotConnection.requester.media.capture);
                    console.log(this._robotConnection.requester.media.capture.photoRequest);
                    try {
                        let p = this._robotConnection.requester.media.capture.photo().complete;  //photo.takePhoto().complete;
                        p.then( (data: any) => {
                            const uri = data.URI;
                            console.log(data);
                            console.log('photo ready - uri: ', uri);
                            //start getting the thing
                            const file = fs.createWriteStream('./PhotoIzHere.jpg');
                            http.get({
                                hostname: this.ip,
                                port: 8160, //7160, //8160,
                                path: uri
                            }, function(response: any) {
                               response.pipe(file);
                               console.log('Your photo was saved as PhotoIzHere.jpg');
                               var cp = require("child_process");
                               cp.exec("open PhotoIzHere.jpg");
                            });
                        })
                        .catch((result: any) => {
                            console.log(result);
                            this.updateRobotStatusMessages(JSON.stringify(result, null, 2))
                        });
                    } catch (err) {
                        console.log(err);
                    }
                    break;
            }
        }
    }

    keepAlive(): void {
        let command: RomCommand = new RomCommand("", "say", { text: '.' });
        this.sendCommand(command);
    }

    clearKeepAlive(): void {
        if (this._keepAliveInterval) {
            clearInterval(this._keepAliveInterval)
            this._keepAliveInterval = undefined;
        }
    }

    resetKeepAlive(): void {
        this.clearKeepAlive();
        this._keepAliveInterval = setInterval(this.keepAlive.bind(this), 60000);
    }

    connect(appInfo: AppInfo): void {
        console.log(`connect:`, appInfo);
        this.appInfo = appInfo;
        this.updateRobotStatusMessages(`Attempting to connect...`);
        if (this._connected) {
            this.disconnect();
        }
        let creds: JiboAccountCreds = {
            clientId: appInfo.clientId,
            clientSecret: appInfo.clientSecret,
            email: this.email,
            password: this.password,
        };
        this.loginToAccount(creds)
            .then((account: JiboAccount) => {
                console.log(`connect: connected:`, account);
                // let obj: any = account;
                // console.log(obj, obj.constants);
                this.getRobot(account, this.serialName)
                    .then((connection: JiboRobotConnection) => {
                        console.log(`connection:`, connection);
                        this._robotConnection = connection;
                        this._robotConnection.on('status', (status: string) => {
                            console.info(`connection: status: ${status}`);
                            this.updateRobotStatusMessages(status);
                        });
                        this._robotConnection.connect()
                            .then(() => {
                                console.log(`connect: Robot connected!`);
                                if (this._robotConnection) {
                                    const connectionObj: any = this._robotConnection;
                                    this.ip = connectionObj['_ip'];
                                    this._robotConnection.once('disconnect', () => {
                                        console.info('connect: Robot disconnected.');
                                        this.updateRobotStatusMessages('connect: Robot disconnected.');
                                        this._connected = false;
                                    });
                                    this._connected = true;
                                    this._targeted = true;
                                    this._hub.onRobotConnected();
                                    this.emit('updateRobot', this);
                                    this.resetKeepAlive();
                                } else {
                                    console.log(`connect: error: _robotConnection undefined.`);
                                    this._connected = false;
                                    this.updateRobotStatusMessages(`connect: error: _robotConnection undefined.`);
                                }
                            })
                            .catch((err: any) => {
                                console.log(`connect: connection.connect: error:`, err);
                                this.updateRobotStatusMessages(`connect: connection.connect: error: ${err}`);
                            })
                    })
                    .catch((err: any) => {
                        console.log(`connect: getRobot: error:`, err);
                    })
            })
            .catch((err: any) => {
                console.log(`connect: loginToAccount: error:`, err);
            })
    }

    async loginToAccount(creds: JiboAccountCreds): Promise<JiboAccount> {
        let account: JiboAccount = new JiboAccount(creds);
        console.log(`jiboConnect: Logging in... `);
        // Call the account.login function
        await account.login();
        console.info('done');
        return account;
    }

    async getRobot(account: JiboAccount, name: string): Promise<JiboRobotConnection> {
        process.stdout.write('Getting robot info... ');
        // Call the account.getRobots API to get a list of all robots associated with the account
        const robots = await account.getRobots();
        console.info('done');
        // Select the robot that matches the desired robot name
        const robot = robots.find(robot => robot.serialName === name);
        // Log an error if the robot can't be found on the account
        if (!robot) {
            console.info('Robots on account:');
            console.info(robots.map(robot => robot.serialName).join('\n'));
            throw new Error(`Robot ${name} not found`);
        }
        return robot;
    }

    disconnect(): void {
        this.updateRobotStatusMessages(`Attempting to disconnect...`);
        try {
            if (this._connected && this._robotConnection) {
                this._robotConnection.disconnect();
                this._robotConnection = undefined;
            }
        } catch (err) {
            console.log(`Robot: disconnect: error:`, err);
        }

        this._connected = false;
        this.clearKeepAlive();
    }

    get connected(): boolean {
        return this._connected;
    }

    get targeted(): boolean {
        return this._targeted;
    }

    get requester(): any | undefined {
        let result: any;
        if (this._robotConnection) {
            result = this._robotConnection.requester;
        }
        return result;
    }

    toggleTargeted(): void {
        this._targeted = !this._targeted;
    }

    mute(state: boolean = true): void {
        this._muted = state;
        console.log(`muted: `, this._muted);
    }

}
