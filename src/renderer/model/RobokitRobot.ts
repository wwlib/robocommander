import Robot, { RobotType } from './Robot';
import AppInfo from './AppInfo';
import RomCommand from './RomCommand';
import RobokitConnection from './RobokitConnection';

export default class RobokitRobot extends Robot {

    constructor(options?: any) {
        options = options || {
            type: RobotType.robokit,
            name: '',
            ip: '',
            serialName: '',
            email: '',
            password: '',
        }
        options.type = RobotType.robokit
        super(options);
    }

    sendCommand(command: RomCommand): void {
        console.log(`sendCommand:`, command, this._robotConnection);
        if (this._robotConnection) {
            switch (command.type) {
                case "say":
                case "tts":
                    let prompt: string = command.data.text || command.data.prompt;
                    this._robotConnection.requester.expression.say(prompt);
                    break;
                case "blink":
                    this._robotConnection.requester.expression.blink();
                    break;
                case "lookAt":
                    this._robotConnection.requester.expression.lookAt(command.data);
                    break;
                case "ident":
                    this._robotConnection.requester.expression.ident(command.data);
                    break;

            }
        }
    }

    connect(appInfo: AppInfo): void {
        console.log(`RobokitRobot: connect:`, appInfo);
        this.appInfo = appInfo;
        this.updateRobotStatusMessages(`Attempting to connect...`);
        if (this._connected) {
            this.disconnect();
        }
        this._robotConnection = new RobokitConnection();
        this._robotConnection.connect();

        this._robotConnection.on('connected', () => {
            console.log(`RobokitRobot: connection: connected`);
            this._connected = true;
            this._targeted = true;
        });

        this._robotConnection.on('message', (message: any) => {
        });

        this._robotConnection.on('error', (error: any) => {
            console.log(error);
        });

        this._robotConnection.on('closed', () => {
            this._connected = false;
            this._targeted = false;
        });

    }

    keepAlive(): void {
        console.log(`keepAlive:`);
    }
}