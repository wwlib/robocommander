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
console.log(`Application: image:`, wwLogo);

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

    onLogoClicked(): void {
        shell.openExternal('http://robocommander.io');
    }

    onButtonClicked(action: string): void {
        console.log(`onButtonClicked: ${action}`);
        switch (action) {
            case 'appInfo':
                this.setState(prevState => ({showAppInfoPanel: !prevState.showAppInfoPanel}));
                break;
            case 'robots':
                this.setState(prevState => ({showRobotsPanel: !prevState.showRobotsPanel}));
                break;
            case 'commands':
                this.setState(prevState => ({showCommandsPanel: !prevState.showCommandsPanel}));
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

    render() {
        let appInfoPanel: JSX.Element | null = this.state.showAppInfoPanel ? <AppInfoForm appInfo={this.props.model.appInfo} model={this.props.model}/> : null;
        let robotsPanel: JSX.Element | null = this.state.showRobotsPanel ? <RobotList robots={this.props.model.robots} appInfo={this.props.model.appInfo} model={this.props.model}/> : null;
        let commandsPanel: JSX.Element | null = this.state.showCommandsPanel ? <Commands model={this.props.model} /> : null;
        let wozGraphEditor: JSX.Element | null = this.state.showWozGraphEditor ? <GraphEditor commanderModel={this.props.model}/>: null;
        let blocklyEditor: JSX.Element | null = null; //this.state.showBlocklyEditor ? <BlocklyEditor model={this.props.model} /> : null;
        // <ReactBootstrap.Button bsStyle={'default'} key={"blockly"} style = {{width: 100}}
        //    onClick={this.onButtonClicked.bind(this, "blockly")}>Blockly</ReactBootstrap.Button>
        return(
            <div>
                <div id="commanderButtons">
                    <img className="pull-left" src={wwLogo} style={{width: 40}} onClick={this.onLogoClicked.bind(this)}/>
                    <h4 className="pull-left" style={{paddingLeft: 6, paddingRight: 6}} onClick={this.onLogoClicked.bind(this)}>RoboCommander.io</h4>
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
