import { EventEmitter } from "events";
import AppInfo from './AppInfo';
import Robot from './Robot';
import Robots from './Robots';
import {RobotIntent} from './Robot';
import RomCommands from './RomCommands';
import RomCommand from './RomCommand';
import Config from "./Config";
import WindowComponent from './WindowComponent';

let configDataTemplate: any = require('../../../data/robocommander-template.json');

export default class Model extends EventEmitter {

    public config: Config;
    public appInfo: AppInfo;
    public robots: Robots;
    public romCommands: RomCommands;
    // public quiz: Quiz;
    public statusMessages: string;
    public panelZIndexMap: Map<string, number>;

    constructor() {
        super();
        this.config = new Config();
        this.appInfo = new AppInfo();
        this.robots = new Robots();
        this.romCommands = new RomCommands();
        this.panelZIndexMap = new Map<string, number>();
        this.config.load((err: any, obj: any) => {
            if (err || !this.config.data) {
                console.log(`Model: Config not found. Using template.`);
                this.config.data = configDataTemplate;
                this.initWithData(this.config.data);
                this.saveConfig();
            } else {
                this.initWithData(this.config.data);
            }
            this.emit('ready', this);
        });

        // this.quiz = new Quiz();
        this.statusMessages = '';
    }

    initWithData(data: any): void {
        this.appInfo = new AppInfo();
        this.appInfo.initWithData(data.appInfo);
        this.robots = new Robots();
        this.robots.initWithData(data.robots);
        this.robots.on('updateRobots', this.onUpdateRobots.bind(this));
        this.robots.on('updateStats', this.onUpdateRobotsStats.bind(this));
        this.robots.on('robotIntent', this.onRobotIntent.bind(this));
        this.romCommands = new RomCommands();
        this.romCommands.initWithData(data.romCommands);
    }

    get json(): any {
        let result: any = {}
        result.timestamp = 0;
        result.appInfo = this.appInfo.json;
        result.robots = this.robots.json;
        result.romCommands = this.romCommands.json;
        return result;
    }

    saveConfig(): void {
        console.log(`saveConfig: `, this.json);
        this.config.data = this.json;
        this.config.save((err: any) => {
            if (err) {
                console.log(`Model: Error saving config: `, err);
            }
        });
    }

    reloadConfig(): void {
        this.config.load((err: any, obj: any) => {
            if (err || !this.config.data) {
                console.log(`Model: Config not found. Using template.`);
                this.config.data = configDataTemplate;
                this.initWithData(this.config.data);
            } else {
                this.initWithData(this.config.data);
            }

            this.emit('updateModel', this);
        });
    }

    updateAppStatusMessages(message: string, subsystem?: string, clearMessages: boolean = false): string {
        subsystem = subsystem || '';
        if (clearMessages) {
            this.statusMessages = '';
        }
        this.statusMessages = `${subsystem}: ${this.statusMessages}\n${message}`;
        this.emit('updateModel', this);
        return this.statusMessages;
    }

    onUpdateRobots(event: any): void {
        this.emit('updateModel', this);
    }

    onUpdateRobotsStats(event: any): void {
        this.emit('updateModel', this);
    }

    onRobotIntent(robotIntent: RobotIntent): void {
        this.emit('robotIntent', robotIntent)
    }

    sendRomCommand(command: RomCommand, robot?: Robot): void {
        if (robot) {
            robot.sendCommand(command);
        } else if (this.robots && this.robots.targetedRobots) {
            this.robots.targetedRobots.forEach(robot => {
              robot.sendCommand(command);
            });
        }
    }

    sendTTS(prompt: string, robot?: Robot): void {
        let command: RomCommand = new RomCommand("", "say", { text: prompt });
        this.sendRomCommand(command, robot);
    }

    sendAsk(prompt: string, contexts: string[], nluType: string, robot?: Robot): void {
        let command: RomCommand = new RomCommand("", "ask", { prompt: prompt, contexts: contexts, nluType: nluType });
        this.sendRomCommand(command, robot);
    }

    sendLookAt(data: any, robot?: Robot): void {
        let command: RomCommand = new RomCommand("", "lookAt", data);
        this.sendRomCommand(command, robot);
    }

    sendRomCommandWithData(data: any, robot?: Robot): void {
        if (data.type & data.data) {
            let type: string = data.type;
            let commandData = data.data;
            let command: RomCommand = new RomCommand("", type, commandData);
            this.sendRomCommand(command, robot);
        }

    }

    // Window Management

    getPanelOpenedWithId(panelId: string): boolean {
        let result: boolean = false;
        let window: WindowComponent | undefined = WindowComponent.getWindowComponentWithId(panelId);
        if (window) {
            result = window.opened;
        }
        return result;
    }

    togglePanelOpenedWithId(panelId: string): boolean {
        let window: WindowComponent | undefined = WindowComponent.getWindowComponentWithId(panelId);
        if (!window) {
            return true; // open the panel if it is not yet instantiated
        } else {
            return window.toggleOpened();
        }
    }

    openPanelWithId(panelId: string): void {
        WindowComponent.openWithId(panelId);
    }

    closePanelWithId(panelId: string): void {
        WindowComponent.closeWithId(panelId);
    }

    bringPanelToFront(panelId: string): void {
        WindowComponent.addWindowWithId(panelId);
        WindowComponent.bringWindowToFrontWithId(panelId);
    }

    addPanelWithId(panelId: string, x: number = 0, y: number = 0, z: number = 0): void {
        WindowComponent.addWindowWithId(panelId, x, y, z);
    }

    get targetedRobots(): Robot[] {
        return this.robots.targetedRobots
    }

    dispose(): void {
        configDataTemplate = null;
        delete(this.config);// = null;
        delete(this.appInfo);// = null;
        delete(this.robots);// = null;
        delete(this.romCommands );// = null;
    }
}
