import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";
import Draggable from "react-draggable";
import Titlebar from './titlebar/Titlebar';

import Robots from '../model/Robots';
import Robot from '../model/Robot';
import AppInfo from '../model/AppInfo';
import Model from '../model/Model';
import ModalRobotInfo from './ModalRobotInfo';

export interface RobotListProps { id: string, robots: Robots; appInfo: AppInfo, model: Model, onClosePanel: any }
export interface RobotListState {
    lastUpdateTime: number;
    statusMessages: string;
    showModal: boolean;
    modalRobot: Robot;
}

export default class RobotList extends React.Component<RobotListProps, RobotListState> {

    public bsStyle: string = 'primary';

    private _updateRobotsHandler: any = this.onUpdateRobots.bind(this);

    constructor(props: any) {
        super(props);
    }

    componentWillMount() {
        this.setState({showModal: false, lastUpdateTime: new Date().getTime(), statusMessages: ''});
        this.props.robots.on('updateRobots', this._updateRobotsHandler);
    }

    componentDidMount() {
        this.props.model.addPanelWithId(this.props.id);
    }

    componentWillUnmount() {
        this.props.robots.removeListener('updateRobots', this._updateRobotsHandler);
    }

    onUpdateRobots(robots: Robots): void {
        // console.log(`RobotList: onUpdateRobots`);
        this.setState({lastUpdateTime: new Date().getTime(), statusMessages: this.props.robots.statusMessages});
    }

    handleClick(e: any): void {
        // console.log(`onPanelClick:`);
        this.props.model.bringPanelToFront(this.props.id);
    }

    handleClose(e: any) {
        this.props.onClosePanel(this.props.id);
    }

    handleMinimize(e: any) {
        console.log('minimize');
    }

    handleMaximize(e: any) {
        console.log('maximize');
    }

    handleFullScreen(e: any) {
        console.log('fullscreen');
    }

    render() {
        return  <Draggable handle=".handle">
                        <div className="commander-panel well" id="robotsPanel">
                        <Titlebar
                            draggable={true}
                            handleClick={this.handleClick.bind(this)}
                            handleClose={this.handleClose.bind(this)}
                            handleMinimize={this.handleMinimize.bind(this)}
                            handleMaximize={this.handleMaximize.bind(this)}
                            handleFullScreen={this.handleFullScreen.bind(this)}>
                        </Titlebar>
                        <h4 className="pull-left handle" style={{marginBottom:20}}>Robot List</h4>
                        <div className="clearfix"></div>
                        <ReactBootstrap.Table striped condensed hover>
                        <tbody>
                        <tr>
                        <td style = {{width: 300}}>
                        <ReactBootstrap.ButtonGroup vertical style = {{width: 300}}>
                            <ModalRobotInfo showModalProp={this.state.showModal} onClose={this.onCloseRobotModal.bind(this)} modalRobot={this.state.modalRobot} />
                            {this.createRobotButtons()}
                        </ReactBootstrap.ButtonGroup>
                        <div className="clearfix"></div>
                        <ReactBootstrap.Button bsStyle={"info"} key={"addRobot"} style = {{width: 100}}
                            onClick={this.onAddRobot.bind(this)}>Add Robot</ReactBootstrap.Button>
                        </td>
                        <td>
                        <textarea id="statusMessages" name="statusMessages" value={this.state.statusMessages} onChange={this.handleInputChange.bind(this)} style={{maxHeight: 300, minHeight: 200, width: '100%'}} />
                        <ReactBootstrap.Button bsStyle={"info"} key={"clearMessages"} style = {{width: 130}}
                            onClick={this.onClearMessages.bind(this)}>Clear Messages</ReactBootstrap.Button>
                        </td>
                        </tr>
                        </tbody>
                        </ReactBootstrap.Table>
                </div></Draggable>
    }

    handleInputChange(event: any) {
        let nativeEvent: any = event.nativeEvent;
        // console.log(`handleInputChange: ${nativeEvent.target.name} ${nativeEvent.target.value}`, this.state);
        switch(nativeEvent.target.name) {
        }
    }

    onCloseRobotModal() {
        // console.log(`RobotList: onCloseRobotModal`);
        this.setState({ showModal: false });
    }

    openRobotModal(robot: Robot) {
        // console.log(`RobotList: openRobotModal`);
        this.setState({ showModal: true, modalRobot: robot });
    }

    onButtonClicked(robot: Robot, action: string): void {
        console.log(`onButtonClicked: ${robot.name}: ${action}`);
        switch (action) {
            case 'select':
                if (robot.connected) {
                    this.props.robots.disconnectRobot(robot);
                } else {
                    this.props.robots.connectRobot(robot, this.props.appInfo);
                }
                break;
            case 'edit':
                this.openRobotModal(robot);
                break;
            case 'delete':
                this.props.robots.removeRobot(robot);
                this.setState({lastUpdateTime: new Date().getTime()});
                break;
            default:
                break;
        }
    }

    onAddRobot(): void {
        let newRobot: Robot = new Robot();
        this.props.robots.addRobot(newRobot);
        this.openRobotModal(newRobot);
    }

    onClearMessages(): void {
        this.props.robots.updateRobotsStatusMessages('', '', true);
    }

    createRobotButton(robot : Robot) {
        let rbStyle: string = 'default';
        // if (robot.enabled) {
        //     rbStyle = 'info';
        // }
        if (robot.connected) {
            rbStyle = 'primary';
        }
        return  <div key={robot.name}>
                    <ReactBootstrap.Button bsStyle={rbStyle} key={robot.name + "_select"} style = {{width: 150}}
                        onClick={this.onButtonClicked.bind(this, robot, "select")}>{robot.name}</ReactBootstrap.Button>
                    <ReactBootstrap.Button bsStyle={"info"} key={robot.name + "_edit"} style = {{width: 80}}
                        onClick={this.onButtonClicked.bind(this, robot, "edit")}>Edit</ReactBootstrap.Button>
                    <ReactBootstrap.Button bsStyle={"danger"} key={robot.name + "_delete"} style = {{width: 40}}
                        onClick={this.onButtonClicked.bind(this, robot, "delete")}>X</ReactBootstrap.Button>
                </div>
    }

    createRobotButtons() {
        return this.props.robots.robotList.map(this.createRobotButton.bind(this));
    }
}
