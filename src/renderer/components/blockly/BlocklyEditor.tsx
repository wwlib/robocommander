import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";
import Draggable from "react-draggable";

const Blockly = require('node-blockly/browser');
// const BlocklyDrawer = require('react-blockly-drawer-ts');
// console.log(`BlocklyDrawer: `, BlocklyDrawer);
// const Block = BlocklyDrawer.Block;
// const Category = BlocklyDrawer.Category;

declare global {
    interface Window { LoopTrap: any; }
}

import BlocklyDrawer, { Block, Category, Mutation, Value, Shadow, Field } from './BlocklyDrawer';
// console.log(`BlocklyDrawer: `, BlocklyDrawer, Block, Category);

import Model from '../../model/Model';
import Robots from '../../model/Robots';
import Robot from '../../model/Robot';
import RomCommand from '../../model/RomCommand';

export interface BlocklyEditorProps { model: Model }
export interface BlocklyEditorState {
    lastUpdateTime: number;
    value: string;
    targetedRobots: Robot[]
 }

export default class BlocklyEditor extends React.Component<BlocklyEditorProps, BlocklyEditorState> {

    public code: string = '';
    public workspace: any;

    private helloWorld: any;
    private _updateRobotsHandler: any = this.onUpdateRobots.bind(this);

    constructor(props: any) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmitTTS = this.handleSubmitTTS.bind(this);
        this.initBlockly();
    }

    initBlockly(): void {
        this.helloWorld = {
            name: 'HelloWorld',
            category: 'Demo',
            block: {
                init: function() {
                    let thiz: any = this;
                    thiz.jsonInit({
                        message0: 'Hello %1',
                        args0: [
                            {
                                type: 'field_input',
                                name: 'NAME',
                                check: 'String',
                            },
                        ],
                        output: 'String',
                        colour: 160,
                        tooltip: 'Says Hello',
                    });
                },
            },
            generator: (block: any) => {
                const message = `'${block.getFieldValue('NAME')}'` || '\'\'';
                const code = `console.log('Hello ${message}')`;
                return [code, Blockly.JavaScript.ORDER_MEMBER];
            },
        };
    }

    componentWillMount() {
        this.setState({
            lastUpdateTime: new Date().getTime(),
            value: '',
            targetedRobots: [],
        });

        this.props.model.robots.on('updateRobots', this._updateRobotsHandler);
    }

    onUpdateRobots(robots: Robots): void {
        console.log(`BlocklyEditor: onUpdateRobots`);
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

    sendCommand(command: RomCommand): void {
        console.log(`BlocklyEditor: sendCommand: `, command, this.state.targetedRobots);
        this.props.model.sendRomCommand(command);
    }

    startBlocklyEditor(): void {
    }

    runBlockly() : void {
        // Generate JavaScript code and run it.
        window.LoopTrap = 1000;
        Blockly.JavaScript.INFINITE_LOOP_TRAP = 'if (--window.LoopTrap == 0) throw "Infinite loop.";\n';
        if (this.code) { // && this.state.workspace) {
            // var code = Blockly.JavaScript.workspaceToCode(this.state.workspace);
            Blockly.JavaScript.INFINITE_LOOP_TRAP = null;
            try {
                eval(this.code);
            } catch(e) {
                alert(e);
            }
        }
    }

    showBlocklyCode() {
      // Generate JavaScript code and display it.
      Blockly.JavaScript.INFINITE_LOOP_TRAP = null;
      // var code = Blockly.JavaScript.workspaceToCode(this.code);
      alert(this.code);
    }

    toggleTargetedRobot(robotToToggle: Robot): void {
        let tempRobotList: Robot[] = [];
        let robotAlreadyTargeted: boolean = false;
        this.state.targetedRobots.forEach(robot => {
            if (robot != robotToToggle) {
                tempRobotList.push(robot);
            } else {
                robotAlreadyTargeted = true;
            }
        });
        if (!robotAlreadyTargeted) {
            tempRobotList.push(robotToToggle);
        }
        this.setState({targetedRobots: tempRobotList});
    }

    isRobotTargeted(robotToTest: Robot): boolean {
        let result: boolean = false;
        this.state.targetedRobots.forEach(robot => {
            if (robot == robotToTest) {
                result = true;
            }
        });
        return result;
    }

    onRobotButtonClicked(robot: Robot, action: string): void {
        switch (action) {
            case 'select':
                this.toggleTargetedRobot(robot);
                break;
        }
    }

    createRobotButton(robot : Robot) {
        let bsStyle: string = 'default';
        if (this.isRobotTargeted(robot)) {
            bsStyle = 'primary';
        }
        return  <ReactBootstrap.Button bsStyle={bsStyle} key={robot.name + "_select"} style = {{width: 150}}
                        onClick={this.onRobotButtonClicked.bind(this, robot, "select")}>{robot.name}</ReactBootstrap.Button>
    }

    createRobotButtons() {
        return this.props.model.robots.targetedRobots.map(this.createRobotButton.bind(this));
    }

    render() {
        return (
            <Draggable handle=".handle"><div className="commander-panel well" id="blocklyEditor">
                    <h2 className="pull-left handle" style={{marginBottom:20}}>Blockly Editor</h2>
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
                    {/* <form onSubmit={this.handleSubmitTTS}>
                        <label>TTS:</label>
                        <input ref="tts" type="text" style = {{width: 600}}
                            value={this.state.value} onChange={this.handleChange} />
                        <input type="submit" value="Submit" />
                    </form>
                    <div className="clearfix"></div>*/}
                    <ReactBootstrap.Button bsStyle={"info"} key={"runBlockly"} style = {{width: 150}}
                        onClick={this.runBlockly.bind(this)}>Run Blockly</ReactBootstrap.Button>
                    <ReactBootstrap.Button bsStyle={"info"} key={"showBlocklyCode"} style = {{width: 150}}
                        onClick={this.showBlocklyCode.bind(this)}>Show Blockly Code</ReactBootstrap.Button>
                    </td>
                    </tr>
                    </tbody>
                    </ReactBootstrap.Table>
                    <BlocklyDrawer
                        tools = { [this.helloWorld]}
                        onChange = {(code: any, workspace: any) => {
                            console.log(code, workspace);
                            this.code = code;
                            this.workspace = workspace;
                        }}
                    >
                        <Category name="Logic">
                            <Block type="controls_if"/>
                            <Block type="logic_compare"/>
                            <Block type="logic_operation"/>
                            <Block type="logic_negate"/>
                            <Block type="logic_boolean"/>
                        </Category>
                        <Category name="Loops">
                            <Block type="controls_repeat_ext"></Block>
                            <Block type="controls_whileUntil"></Block>
                        </Category>
                        <Category name="Math">
                            <Block type="math_number"></Block>
                            <Block type="math_arithmetic"></Block>
                            <Block type="math_single"></Block>
                        </Category>
                        <Category name="Text">
                            <Block type="text"></Block>
                            <Block type="text_length"></Block>
                            <Block type="text_print"></Block>
                            <Block type="text_prompt_ext"></Block>
                        </Category>
                        <Category name="Lists">
                            <Block type="lists_create_with"></Block>
                            <Block type="lists_create_with">
                                <Mutation items="0"></Mutation>
                            </Block>
                            <Block type="lists_repeat">
                                <Value name="NUM">
                                    <Shadow type="math_number">
                                        <Field name="NUM">5</Field>
                                    </Shadow>
                                </Value>
                            </Block>
                            <Block type="lists_indexOf">
                                <Value name="VALUE">
                                    <Block type="variables_get">
                                        <Field name="VAR">{'{listVariable}'}</Field>
                                    </Block>
                                </Value>
                            </Block>
                        </Category>
                        <Category name="Variables" custom="VARIABLE" />
                        <Category name="Functions" custom="PROCEDURE" />
                        <Category name="Values">
                            <Block type="math_number" />
                            <Block type="text" />
                        </Category>
                    </BlocklyDrawer >
            </div></Draggable>
        );
    }
}
