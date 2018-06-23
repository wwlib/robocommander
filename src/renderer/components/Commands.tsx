import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";
import Draggable from "react-draggable";

import * as three from 'three';
console.log(three);

import Model from '../model/Model';
import Robots from '../model/Robots';
import Robot from '../model/Robot';
import RomCommand from '../model/RomCommand';
import ModalCommandInfo from './ModalCommandInfo';
// import Checkbox from './Checkbox';

let WebMidi = require('webmidi');

export interface CommandsProps { model: Model }
export interface CommandsState { lastUpdateTime: number, value: string, targetedRobots: Robot[], commandList: RomCommand[], showModal: boolean, modalCommand: RomCommand, editMode: string, deleteMode: boolean }

export default class Commands extends React.Component<CommandsProps, CommandsState> {

    public commandButtons: any = {};
    public commandButtonsArray: any;
    public cycleRobots: boolean = false;
    public transactionEventHandler: any;
    public x: number = 0;
    public y: number = 0;
    public z: number = 0.5;
    public angle: number = 0;
    public sendflag: boolean = true;
    public previousController10Value: number = 0;
    public previousControllerTime: number = 0;

    private _updateRobotsHandler: any = this.onUpdateRobots.bind(this);


    constructor(props: any) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmitTTS = this.handleSubmitTTS.bind(this);
        this.setupWebMidi();

    }

    setupWebMidi(): void {
        WebMidi.enable((err: any) => {
            if (err) {
                console.log("WebMidi could not be enabled.", err);
            } else {
                console.log("WebMidi enabled!");
                console.log(WebMidi.inputs);
                console.log(WebMidi.outputs);

                // USB Oxygen 49
                // iRig Keys
                // MidiMock OUT
                // Network Andrew
                // MIDI Keys

                WebMidi.inputs.forEach((input: any) => {
                    console.log(`Commands: Adding Midi Input: ${input.name}`);

                    input.addListener('pitchbend', "all", (e: any) => {
                        console.log("Pitch value: " + e.value);
                    });

                    input.addListener('noteon', "all", (e: any) => {
                        console.log("Received 'noteon' message (" + e.note.number + ": " + e.note.name + e.note.octave + ").");
                        let command: RomCommand;
                        switch (e.note.number) {
                            case 49:
                                command = new RomCommand("", "tts", { text: "<anim name='Confident_02' nonBlocking='true' />My name is Jibo." });
                                this.sendCommand(command);
                                break;
                            case 51:
                                command = new RomCommand("", "tts", { text: "<anim cat='no' filter='head-shake' nonBlocking='true' />So far I haven't met anyone exactly like me. <anim name='Greetings_02' nonBlocking='true'/> But I don't get out much." });
                                this.sendCommand(command);
                                break;
                            case 54:
                                command = new RomCommand("", "tts", { text: "<anim cat='dance' filter='waltz' nonBlocking='true'/> I love to dance" });
                                this.sendCommand(command);
                                break;
                            case 57:
                                command = new RomCommand("", "tts", { text: "<anim name='Checking_04' nonBlocking='true'/> I'm pretty scared of ghosts" });
                                this.sendCommand(command);
                                break;

                            case 48:
                                command = new RomCommand("", "tts", { text: "<anim name='Confident_02' nonBlocking='true' />." });
                                this.sendCommand(command);
                                break;
                            case 50:
                                command = new RomCommand("Left", "lookAt", { vector: [0, 1, 0.5] });
                                this.sendCommand(command);
                                break;
                            case 52:
                                command = new RomCommand("Right", "lookAt", { vector: [0, -1, 0.5] });
                                this.sendCommand(command);
                                break;
                            case 53:
                                command = new RomCommand("Center", "lookAt", { vector: [1, 0, 0.5] });
                                this.sendCommand(command);
                                break;
                            case 55:
                                command = new RomCommand("Back", "lookAt", { vector: [-1, 0, 0.5] });
                                this.sendCommand(command);
                                break;
                            case 60:
                                command = new RomCommand("Left", "lookAt", { angle: 0.5 });
                                this.sendCommand(command);
                                break;
                            case 62:
                                command = new RomCommand("Right", "lookAt", { angle: -0.5 });
                                this.sendCommand(command);
                                break;
                            case 64:
                                command = new RomCommand("Back", "lookAt", { angle: 3.14159 });
                                this.sendCommand(command);
                                break;

                        }
                    });

                    input.addListener('noteoff', "all", (e: any) => {
                    });

                    input.addListener("keyaftertouch", "all", (e: any) => {
                        console.log("Received 'keyaftertouch' message: "); //, e);
                    });
                    input.addListener("controlchange", "all", (e: any) => {
                        console.log("Received 'controlchange' message (" + e.controller.number + ": " + e.channel + ": " + e.value + ").");
                        // const CENTER = [1, 0, 0.5];
                        // const RIGHT = [0, -1, 0.5];
                        // const LEFT = [0, 1, 0.5];
                        // const BACK = [-1, 0, 0.5];
                        // let angle = 0.5;
                        let controllerTime: number = new Date().getTime();
                        if (controllerTime - this.previousControllerTime > 200) {
                            this.previousControllerTime = controllerTime;
                            if (e.controller.number == 10) {
                                if (Math.abs(this.previousController10Value - e.controller.number) > 2) {
                                    // if (e.value > this.previousController10Value) {
                                    //     angle = -0.5;
                                    // }
                                    // let command: RomCommand = new RomCommand("", "lookAt", { angle: angle });
                                    // this.sendCommand(command);
                                    let up = new three.Vector3(0, 0, 1);
                                    let forward = new three.Vector3(1, 0, 0.5);
                                    let angleRads = Math.PI * 2 * e.value/128;
                                    let around = new three.Quaternion().setFromAxisAngle(up, angleRads);
                                    let threeVector =  forward.clone().applyQuaternion(around);
                                    let vector: [number, number, number] = [threeVector.x, threeVector.y, threeVector.z];
                                    console.log(`vector: `, vector);
                                    let command: RomCommand = new RomCommand("", "lookAtPosition", { vector: vector });
                                    this.sendCommand(command);
                                }
                                this.previousController10Value = e.value;
                            }
                        }
                    });
                    input.addListener("pitchbend", "all", (e: any) => {
                        console.log("pitch: ", e);
                    });
                    input.addListener("channelmode", "all", (e: any) => {
                        console.log("Received 'channelmode' message: "); //, e);
                    });
                    input.addListener("programchange", "all", (e: any) => {
                        console.log("Received 'programchange' message: ", e);
                    });
                    input.addListener("channelaftertouch", "all", (e: any) => {
                        console.log("Received 'channelaftertouch' message: "); //, e);
                    });
                });
            }
        });
    }

    componentWillMount() {
        this.setState({
            lastUpdateTime: new Date().getTime(),
            value: '',
            commandList: this.props.model.romCommands.commandList,
            showModal: false,
            editMode: '',
            deleteMode: false,
            targetedRobots: this.props.model.robots.targetedRobots
        });

        this.props.model.robots.on('updateRobots', this._updateRobotsHandler);
    }

    onUpdateRobots(robots: Robots): void {
        console.log(`Commands: onUpdateRobots`);
        this.setState({lastUpdateTime: new Date().getTime()});
    }

    handleChange(event: any) {
        let nativeEvent: any = event.nativeEvent;
        this.setState({value: nativeEvent.target.value});
    }

    handleSubmitTTS(event: any) {
      let command: RomCommand = new RomCommand("", "tts", { text: this.state.value });
      this.sendCommand(command);
      event.preventDefault();
    }

    handleClick(event: any) {
        event.target.bsStyle = 'primary';
    }

    sendCommandWithName(commandName: string) {
        console.log(`Commands: sendCommandWithName: `, commandName);
        let command: RomCommand | undefined = this.props.model.romCommands.getCommandWithName(commandName);
        if (command) {
            if (this.state.editMode === 'edit') {
                console.log(`  editing`);
                this.openCommandModal(command);
            } else if (this.state.deleteMode) {
                console.log(`  deleting`);
                this.props.model.romCommands.removeCommand(command);
                this.setState({commandList: this.props.model.romCommands.commandList});
            } else {
                console.log(`  executing`);
                this.props.model.sendRomCommand(command);
                if (this.cycleRobots) {
                  this.cycleTargetedRobots();
                }
            }
        }
    }

    sendCommand(command: RomCommand): void {
        console.log(`Commands: sendCommand: `, command);
        this.props.model.sendRomCommand(command);
    }

    onPanelClick(): void {
        // console.log(`onPanelClick:`);
        this.props.model.bringPanelToFront('commandsPanel');
    }

    render() {
        this.commandButtons = {};
        this.commandButtonsArray = [];
        let commandNames: string[] = this.props.model.romCommands.commandNames;
        commandNames.forEach((command_name) => {
            let button = <ReactBootstrap.Button key={command_name} style = {{width: 150}}
                onClick={this.sendCommandWithName.bind(this, command_name)}>{command_name}</ReactBootstrap.Button>;

            this.commandButtons[command_name] = button;
            this.commandButtonsArray.push(button);
        });

        // <Checkbox label={'Cycle Robots'} handleCheckboxChange={this.handleCheckboxChange.bind(this)}/>

        return (
            <Draggable handle=".handle"><div className="commander-panel well" id="commandsPanel" onClick={this.onPanelClick.bind(this)}>
                    <h2 className="pull-left handle" style={{marginBottom:20}}>Commands</h2>
                    <div className="clearfix"></div>
                    <ReactBootstrap.Table striped condensed hover>
                    <tbody>
                    <tr>
                    <td>
                    <ReactBootstrap.ButtonGroup vertical style = {{width: 180}}>
                        {this.createRobotButtons()}
                    </ReactBootstrap.ButtonGroup>
                    </td>
                    <td style = {{width: 10}} />
                    <td style = {{"verticalAlign": "top"}}>
                    <form onSubmit={this.handleSubmitTTS}>
                        <label>TTS:</label>
                        <input ref="tts" type="text" style = {{width: 600}}
                            value={this.state.value} onChange={this.handleChange} />
                        <input type="submit" value="Submit" />
                    </form>
                    <ReactBootstrap.ButtonGroup style = {{width: 600}}>
                        <ModalCommandInfo showModalProp={this.state.showModal} onClose={this.onCloseCommandModal.bind(this)} modalCommand={this.state.modalCommand} editMode={this.state.editMode} />
                        {this.commandButtonsArray}
                    </ReactBootstrap.ButtonGroup>
                    <div className="clearfix"></div>
                    <ReactBootstrap.Button bsStyle={"info"} key={"addCommand"} style = {{width: 150}}
                        onClick={this.onAddCommand.bind(this)}>Add Command</ReactBootstrap.Button>
                    <input type="radio" checked={!this.state.deleteMode && this.state.editMode != 'edit'} name="mode" value={"execute"} onChange={this.handleModeChange.bind(this)} style={{width: 20}} /> Execute Command
                    <input type="radio" checked={!this.state.deleteMode && this.state.editMode == 'edit'} name="mode" value={"edit"} onChange={this.handleModeChange.bind(this)} style={{width: 20}} /> Edit Command
                    <input type="radio" checked={this.state.deleteMode} name="mode" value={"delete"} onChange={this.handleModeChange.bind(this)} style={{width: 20}} /> Delete Command
                    </td>
                    </tr>
                    </tbody>
                    </ReactBootstrap.Table>
            </div></Draggable>
        );
    }

    handleModeChange(event: any): void {
        let nativeEvent: any = event.nativeEvent;
        switch(nativeEvent.target.value) {
            case 'execute':
                this.setState({ editMode: '', deleteMode: false });
                break;
            case 'edit':
                this.setState({ editMode: 'edit', deleteMode: false });
                break;
            case 'delete':
                this.setState({ editMode: '', deleteMode: true });
                break;
        }
    }

    handleCheckboxChange(event: any): void {
        this.cycleRobots = !this.cycleRobots;
    }

    onAddCommand(): void {
        let newCommand: RomCommand = new RomCommand();
        this.setState({ editMode: 'add'}, () => {
            this.openCommandModal(newCommand);
        });
    }

    onCloseCommandModal(editMode: string) {
        if (editMode === 'add' && this.state.modalCommand.name) {
            this.props.model.romCommands.addCommand(this.state.modalCommand);
        } else if (editMode === 'edit' && this.state.modalCommand.name) {
            this.props.model.romCommands.updateCommandWithName(this.state.modalCommand.name, this.state.modalCommand);
        }
        this.setState({ showModal: false });
    }

    openCommandModal(command: RomCommand) {
        this.setState({ showModal: true, modalCommand: command });
    }

    cycleTargetedRobots(): void {
      // TODO
    }

    onRobotButtonClicked(robot: Robot, action: string): void {
        switch (action) {
            case 'select':
                robot.toggleTargeted();
                this.setState({targetedRobots: this.props.model.robots.targetedRobots});
                break;
        }
    }

    createRobotButton(robot : Robot) {
        let bsStyle: string = 'default';
        if (robot.targeted) {
            bsStyle = 'primary';
        }
        return  <ReactBootstrap.Button bsStyle={bsStyle} key={robot.name + "_select"} style = {{width: 150}}
                        onClick={this.onRobotButtonClicked.bind(this, robot, "select")}>{robot.name}</ReactBootstrap.Button>
    }

    createRobotButtons() {
        return this.props.model.robots.connectedRobots.map(this.createRobotButton.bind(this));
    }
}
