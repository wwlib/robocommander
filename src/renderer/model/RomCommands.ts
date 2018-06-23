import RomCommand from './RomCommand';

export default class RomCommands {

    public commandList: RomCommand[];
    public commandMap: Map<string, RomCommand>;

    constructor() {
        this.commandList = [];
        this.commandMap = new Map<string, RomCommand>();
    }

    initWithData(dataList: any[]): void {
        dataList.forEach((data: any) => {
            let command: RomCommand = new RomCommand();
            command.initWithData(data);
            this.commandList.push(command);
            this.commandMap.set(command.name, command);
        })
    }

    get json(): any {
        let json: any[] = [];
        this.commandList.forEach(command => {
            json.push(command.json);
        });
        return json;
    }

    get commandNames(): string[] {
        let names: string[] = [];
        this.commandList.forEach(command => {
            names.push(command.name);
        });
        return names;
    }

    getCommandWithName(name: string): RomCommand | undefined {
        let command: RomCommand | undefined = this.commandMap.get(name);
        let commandCopy: RomCommand | undefined;
        if (command) {
            commandCopy = new RomCommand(command.name, command.type, Object.assign({}, command.data));
        }
        return commandCopy;
    }

    addCommand(command: RomCommand): void {
        this.commandList.push(command);
        this.commandMap.set(command.name, command);
    }

    updateCommandWithName(commandName: string, command: RomCommand): void {
        let existingCommand: RomCommand | undefined = this.commandMap.get(command.name);
        if (existingCommand) {
            existingCommand.data = command.data;
            existingCommand.type = command.type;
        }
    }

    removeCommand(commandToRemove: RomCommand): void {
        console.log(`RomCommands: removeCommand: ${commandToRemove.name}`);
        let tempCommandList: RomCommand[] = [];
        let tempCommandMap: Map<string, RomCommand> = new Map<string, RomCommand>();
        this.commandList.forEach(command => {
            if (command.name != commandToRemove.name) {
                tempCommandList.push(command);
                tempCommandMap.set(command.name, command);
            }
        });

        this.commandList = tempCommandList;
        this.commandMap = tempCommandMap;
    }
}
