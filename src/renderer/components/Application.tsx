import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";

import AppInfoForm from './AppInfoForm';
import RobotList from './RobotList';
import Commands from './Commands';
// import BlocklyEditor from './blockly/BlocklyEditor';
// import QuizPanel from './QuizPanel';
import GraphEditor from './grapheditor/GraphEditor';

// import { MimPanel } from './MimPanel';
// import { PhotoPanel } from './PhotoPanel';
// import {StreamingPanel } from './StreamingPanel'
import Model from '../model/Model';

const {shell} = require('electron').remote;

const wwLogo = require('../../../assets/ww-logo-40.png')

export interface ApplicationProps { model: Model }
export interface ApplicationState {
    showAppInfoPanel: boolean;
    showRobotsPanel: boolean;
    showCommandsPanel: boolean;
    showWozGraphEditor: boolean;
    showBlocklyEditor: boolean;
    lastUpdateTime: number
}

export default class Application extends React.Component < ApplicationProps, ApplicationState > {

    componentWillMount() {
        // this.setState(({lastUpdateTime}) => ({lastUpdateTime: new Date().getTime()}));
        // this.props.model.on('updateModel', (model: Model) => {
        //     console.log(`Application: onUpdateModel`);
        //     this.setState(({lastUpdateTime}) => ({lastUpdateTime: new Date().getTime()}));
        // });
        this.setState({
            showAppInfoPanel: false,
            showRobotsPanel: false,
            showCommandsPanel: false,
            showWozGraphEditor: false,
            showBlocklyEditor: false,
            lastUpdateTime: 0
        });
    }

    componentDidMount() {
        console.log(`Application: componentDidMount`);
        this.props.model.addPanelWithId('appInfoPanel', 10, 60);
        this.props.model.addPanelWithId('robotsPanel', 10, 60);
        this.props.model.addPanelWithId('commandsPanel', 10, 60);
    }

    onLogoClicked(): void {
        shell.openExternal('http://robocommander.io');
    }

    onButtonClicked(action: string): void {
        // console.log(`onButtonClicked: ${action}`);
        switch (action) {
            case 'appInfo':
                this.setState({showAppInfoPanel: this.props.model.togglePanelOpenedWithId('appInfoPanel')});
                this.props.model.bringPanelToFront('appInfoPanel');
                break;
            case 'robots':
                this.setState({showRobotsPanel: this.props.model.togglePanelOpenedWithId('robotsPanel')});
                this.props.model.bringPanelToFront('robotsPanel');
                break;
            case 'commands':
                this.setState({showCommandsPanel: this.props.model.togglePanelOpenedWithId('commandsPanel')});
                this.props.model.bringPanelToFront('commandsPanel');
                break;
            case 'wozGraph':
                this.setState(prevState => ({showWozGraphEditor: !prevState.showWozGraphEditor}));
                break;
            case 'blockly':
                this.setState(prevState => ({showBlocklyEditor: !prevState.showBlocklyEditor}));
                break;
            case 'save':
                this.props.model.saveConfig();
                break;
            case 'reload':
                this.props.model.reloadConfig();
                break;
        }
    }

    onClosePanel(id: string): void {
        this.props.model.closePanelWithId(id);
        switch(id) {
            case 'appInfoPanel':
                this.setState({showAppInfoPanel: false});
                break;
            case 'robotsPanel':
                this.setState({showRobotsPanel: false});
                break;
            case 'commandsPanel':
                this.setState({showCommandsPanel: false});
                break;
        }
    }

    render() {
        let appInfoPanel: JSX.Element | null = this.state.showAppInfoPanel ? <AppInfoForm id='appInfoPanel' appInfo={this.props.model.appInfo} model={this.props.model} onClosePanel={this.onClosePanel.bind(this)}/> : null;
        let robotsPanel: JSX.Element | null = this.state.showRobotsPanel ? <RobotList id='robotsPanel' robots={this.props.model.robots} appInfo={this.props.model.appInfo} model={this.props.model} onClosePanel={this.onClosePanel.bind(this)}/> : null;
        let commandsPanel: JSX.Element | null = this.state.showCommandsPanel ? <Commands id='commandsPanel' model={this.props.model} onClosePanel={this.onClosePanel.bind(this)}/> : null;
        let wozGraphEditor: JSX.Element | null = this.state.showWozGraphEditor ? <GraphEditor commanderModel={this.props.model}/>: null;
        let blocklyEditor: JSX.Element | null = null; //this.state.showBlocklyEditor ? <BlocklyEditor model={this.props.model} /> : null;
        // <ReactBootstrap.Button bsStyle={'default'} key={"blockly"} style = {{width: 100}}
        //    onClick={this.onButtonClicked.bind(this, "blockly")}>Blockly</ReactBootstrap.Button>
        return(
            <div>
                <div id="commanderButtons">
                    <img className="pull-left" src={wwLogo} style={{width: 40}} onClick={this.onLogoClicked.bind(this)}/>
                    <h4 className="pull-left" style={{paddingLeft: 6, paddingRight: 6}} onClick={this.onLogoClicked.bind(this)}>RoboCommander.io</h4>
                    <h4 className="pull-right" style={{paddingLeft: 6, paddingRight: 6}} >v{this.props.model.getAppVerison()}</h4>
                    <ReactBootstrap.Button bsStyle={'default'} key={"appInfo"} style = {{width: 100}}
                        onClick={this.onButtonClicked.bind(this, "appInfo")}>App Info</ReactBootstrap.Button>
                    <ReactBootstrap.Button bsStyle={'default'} key={"robots"} style = {{width: 100}}
                        onClick={this.onButtonClicked.bind(this, "robots")}>Robots</ReactBootstrap.Button>
                    <ReactBootstrap.Button bsStyle={'default'} key={"commands"} style = {{width: 100}}
                        onClick={this.onButtonClicked.bind(this, "commands")}>Commands</ReactBootstrap.Button>
                    <ReactBootstrap.Button bsStyle={'default'} key={"wozGraph"} style = {{width: 100}}
                        onClick={this.onButtonClicked.bind(this, "wozGraph")}>WozGraph</ReactBootstrap.Button>

                    <ReactBootstrap.Button bsStyle={'success'} key={"save"} style = {{width: 100}}
                        onClick={this.onButtonClicked.bind(this, "save")}>Save Config</ReactBootstrap.Button>
                    <ReactBootstrap.Button bsStyle={'info'} key={"reload"} style = {{width: 120}}
                        onClick={this.onButtonClicked.bind(this, "reload")}>Reload Config</ReactBootstrap.Button>
                </div>
                {wozGraphEditor}
                {blocklyEditor}
                {commandsPanel}
                {robotsPanel}
                {appInfoPanel}
            </div>
        );
    }
}
