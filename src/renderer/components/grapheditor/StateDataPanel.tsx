import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";
import Draggable from "react-draggable";
import Titlebar from '../titlebar/Titlebar';

import GraphModel from './model/GraphModel';
import Robot from '../../model/Robot';

export interface StateDataPanelProps { id: string, graphModel: GraphModel, targetedRobots: Robot[], onClosePanel: any}
export interface StateDataPanelState { robot: Robot | undefined, data: string, lastUpdateTime: number }

export default class StateDataPanel extends React.Component<StateDataPanelProps, StateDataPanelState> {

    // private _setStateDataHandler: any = this.setStateData.bind(this);

    constructor(props: any) {
        super(props);
    }

    componentWillMount() {
        // console.log(`StateDataPanel: componentWillMount:`, this);
        this.setState({
            robot: undefined,
            data: JSON.stringify(this.props.graphModel.globalStateData, null, 2)
        });

        // this.props.graphModel.on('updateStateData', this._setStateDataHandler);
    }

    componentDidMount() {
        this.props.graphModel.addPanelWithId(this.props.id);
    }

    componentWillUnmount() {
        // this.props.graphModel.removeListener('updateStateData', this._setStateDataHandler);
    }

    handleInputChange(event: any) {
        let nativeEvent: any = event.nativeEvent;
        // console.log(`handleInputChange: ${nativeEvent.target.name} ${nativeEvent.target.value}`, this.state);
        switch(nativeEvent.target.name) {
            case 'data':
                this.setState({ data: nativeEvent.target.value});
                break;
        }
    }

    handleSubmit(event: any) {
      event.preventDefault();
    }

    onButtonClicked(action: string): void {
        // console.log(`onButtonClicked: ${action}`);
        switch (action) {
            case 'save':
                this.save();
                // this.props.graphModel.onRedraw();
                break;
            case 'delete':
                this.props.graphModel.deleteStateData(this.state.robot);
                // this.props.graphModel.onRedraw();
                break;
            case 'cancel':
                this.props.onClosePanel(this.props.id);
                break;
        }
    }

    onRobotButtonClicked(robot: Robot): void {
        console.log(`onRobotButtonClicked: `, robot);
        if (robot) {
            this.setState({
                robot: robot,
                data: JSON.stringify(robot.stateData, null, 2)
            });
        } else {
            this.setState({
                robot: undefined,
                data: JSON.stringify(this.props.graphModel.globalStateData, null, 2)
            });
        }
    }

    save(): void {
        let data: any = JSON.parse(this.state.data);
        this.props.graphModel.saveStateData(this.state.robot, data);
    }

    createRobotButtons(): any {
        let robotButtons: any[] = [];
        robotButtons.push(
            <ReactBootstrap.Button bsStyle={'default'} key={`scope_global`} style = {{width: 80}}
                onClick={this.onRobotButtonClicked.bind(this, undefined)}>global</ReactBootstrap.Button>
        )
        this.props.targetedRobots.forEach((robot: Robot) => {
            robotButtons.push(
                <ReactBootstrap.Button bsStyle={'default'} key={`scope_${robot.name}`} style = {{width: 80}}
                    onClick={this.onRobotButtonClicked.bind(this, robot)}>{robot.name}</ReactBootstrap.Button>
            )
        });
        return robotButtons;
    }

    handleClick(e: any): void {
        // console.log(`onPanelClick:`);
        this.props.graphModel.bringPanelToFront(this.props.id);
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
        let scope: string = 'global';
        if (this.state.robot) {
            scope = this.state.robot.name;
        }
        return  <Draggable handle=".handle">
                    <div className="editor-panel well" id="stateDataPanel">
                    <Titlebar
                        draggable={true}
                        handleClick={this.handleClick.bind(this)}
                        handleClose={this.handleClose.bind(this)}
                        handleMinimize={this.handleMinimize.bind(this)}
                        handleMaximize={this.handleMaximize.bind(this)}
                        handleFullScreen={this.handleFullScreen.bind(this)}>
                    </Titlebar>
                    <h4 className="pull-left handle" style={{marginBottom:20}}>State Data</h4>
                    <div className="clearfix"></div>
                    <ReactBootstrap.Table striped bordered condensed hover style = {{width: 400}}>
                        <tbody>
                            <tr>
                            <td>scope:</td>
                            <td>
                            <input name="scope" value={scope} onChange={this.handleInputChange.bind(this)} style={{width: 300}} />
                            </td>
                            </tr>
                            <tr>
                            <td>data:</td>
                            <td>
                            <textarea name="data" value={this.state.data} onChange={this.handleInputChange.bind(this)} style={{width: 300, height: 100}} />
                            </td>
                            </tr>
                        </tbody>
                    </ReactBootstrap.Table>
                    <div className="clearfix"></div>
                    {this.createRobotButtons()}
                    <div className="clearfix"></div>
                    <ReactBootstrap.Button bsStyle={'success'} key={"save"} style = {{width: 80}}
                        onClick={this.onButtonClicked.bind(this, "save")}>Save</ReactBootstrap.Button>
                    <ReactBootstrap.Button bsStyle={'danger'} key={"delete"} style = {{width: 80}}
                        onClick={this.onButtonClicked.bind(this, "delete")}>Delete</ReactBootstrap.Button>
                    <ReactBootstrap.Button bsStyle={'default'} key={"cancel"} style = {{width: 80}}
                        onClick={this.onButtonClicked.bind(this, "cancel")}>Cancel</ReactBootstrap.Button>
                </div></Draggable>
    }
}
