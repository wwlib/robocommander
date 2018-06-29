import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";
import Draggable from "react-draggable";
import Titlebar from './titlebar/Titlebar';

const PasswordMask = require('react-password-mask');
import Select from 'react-select';
import AppInfo from '../model/AppInfo';
import Model from '../model/Model';

export interface AppInfoFormProps { id: string, appInfo: AppInfo, model: Model, onClosePanel: any }
export interface AppInfoFormState {
    port: number;
    clientId: string;
    clientSecret: string;
    nluDefault: string;
    nluLUIS_endpoint: string;
    nluLUIS_appId: string;
    nluLUIS_subscriptionKey: string;
    nluDialogflow_clientToken: string;
    nluDialogflow_projectId: string;
    nluDialogflow_privateKey: string;
    nluDialogflow_clientEmail: string;
    neo4j_url: string;
    neo4j_user: string;
    neo4j_password: string;
}

export default class AppInfoForm extends React.Component<AppInfoFormProps, AppInfoFormState> {

    public networkInfo: any;

    constructor(props: any) {
        super(props);
    }

    componentWillMount() {
        this.setState({
            port: this.props.appInfo.port,
            clientId: this.props.appInfo.clientId,
            clientSecret: this.props.appInfo.clientSecret,
            nluDefault: this.props.appInfo.nluDefault,
            nluLUIS_endpoint: this.props.appInfo.nluLUIS_endpoint,
            nluLUIS_appId: this.props.appInfo.nluLUIS_appId,
            nluLUIS_subscriptionKey: this.props.appInfo.nluLUIS_subscriptionKey,
            nluDialogflow_clientToken: this.props.appInfo.nluDialogflow_clientToken,
            nluDialogflow_projectId: this.props.appInfo.nluDialogflow_projectId,
            nluDialogflow_privateKey: this.props.appInfo.nluDialogflow_privateKey,
            nluDialogflow_clientEmail: this.props.appInfo.nluDialogflow_clientEmail,
            neo4j_url: this.props.appInfo.neo4j_url,
            neo4j_user: this.props.appInfo.neo4j_user,
            neo4j_password: this.props.appInfo.neo4j_password
        });
    }

    componentDidMount() {
        this.props.model.addPanelWithId(this.props.id);
    }

    handleInputChange(event: any) {
        let nativeEvent: any = event.nativeEvent;
        console.log(`handleInputChange: ${nativeEvent.target.name} ${nativeEvent.target.value}`, this.state);
        switch(nativeEvent.target.name) {
            case 'port':
                this.setState(prevState => { this.props.appInfo.port = nativeEvent.target.value; return {port: nativeEvent.target.value} });
                break;
            case 'clientId':
                this.setState(prevState => { this.props.appInfo.clientId = nativeEvent.target.value; return {clientId: nativeEvent.target.value} });
                break;
            case 'clientSecret':
                this.setState(prevState => { this.props.appInfo.clientSecret = nativeEvent.target.value; return {clientSecret: nativeEvent.target.value} });
                break;
            case 'nluLUIS_endpoint':
                this.setState(prevState => { this.props.appInfo.nluLUIS_endpoint = nativeEvent.target.value; return {nluLUIS_endpoint: nativeEvent.target.value} });
                break;
            case 'nluLUIS_appId':
                this.setState(prevState => { this.props.appInfo.nluLUIS_appId = nativeEvent.target.value; return {nluLUIS_appId: nativeEvent.target.value} });
                break;
            case 'nluLUIS_subscriptionKey':
                this.setState(prevState => { this.props.appInfo.nluLUIS_subscriptionKey = nativeEvent.target.value; return {nluLUIS_subscriptionKey: nativeEvent.target.value} });
                break;
            case 'nluDialogflow_clientToken':
                this.setState(prevState => { this.props.appInfo.nluDialogflow_clientToken = nativeEvent.target.value; return {nluDialogflow_clientToken: nativeEvent.target.value} });
                break;
            case 'nluDialogflow_projectId':
                this.setState(prevState => { this.props.appInfo.nluDialogflow_projectId = nativeEvent.target.value; return {nluDialogflow_clientToken: nativeEvent.target.value} });
                break;
            case 'nluDialogflow_privateKey':
                this.setState(prevState => { this.props.appInfo.nluDialogflow_privateKey = nativeEvent.target.value; return {nluDialogflow_clientToken: nativeEvent.target.value} });
                break;
            case 'nluDialogflow_clientEmail':
                this.setState(prevState => { this.props.appInfo.nluDialogflow_clientEmail = nativeEvent.target.value; return {nluDialogflow_clientToken: nativeEvent.target.value} });
                break;
            case 'neo4j_url':
                this.setState(prevState => { this.props.appInfo.neo4j_url = nativeEvent.target.value; return {neo4j_url: nativeEvent.target.value} });
                break;
            case 'neo4j_user':
                this.setState(prevState => { this.props.appInfo.neo4j_user = nativeEvent.target.value; return {neo4j_user: nativeEvent.target.value} });
                break;
            case 'neo4j_password':
                this.setState(prevState => { this.props.appInfo.neo4j_password = nativeEvent.target.value; return {neo4j_password: nativeEvent.target.value} });
                break;
        }
    }

    handleNluDefaultChange(selectedOption: any) {
        // console.log(`handleEndpointChange: `, selectedOption);
        this.setState(prevState => { this.props.appInfo.nluDefault = selectedOption.value; return {nluDefault: selectedOption.value} });
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
        let nluOptions: any[] = [
            {value: 'none', label: 'none'},
            {value: 'luis', label: 'LUIS'},
            {value: 'dialogflow', label: 'Dialogflow'}
        ]

        return  <Draggable handle=".handle">
                    <div className="commander-panel well" id="appInfoPanel" ref="appInfoPanel">
                    <Titlebar
                        draggable={true}
                        handleClick={this.handleClick.bind(this)}
                        handleClose={this.handleClose.bind(this)}
                        handleMinimize={this.handleMinimize.bind(this)}
                        handleMaximize={this.handleMaximize.bind(this)}
                        handleFullScreen={this.handleFullScreen.bind(this)}>
                    </Titlebar>
                    <h4 className="pull-left handle" style={{marginBottom:20}}>RoboCommander Info</h4>
                    <div className="clearfix"></div>
                    <ReactBootstrap.Table striped bordered condensed hover style = {{width: 900}}>
                        <tbody>
                            <tr><td>port:</td><td>
                            <input name="port" value={this.state.port} onChange={this.handleInputChange.bind(this)} style={{width: 300}} />
                            </td></tr>

                            <tr><td>clientId:</td><td>
                            <PasswordMask id="password" name="clientId" value={this.state.clientId} onChange={this.handleInputChange.bind(this)} style={{width: 300}} />
                            </td></tr>

                            <tr><td>clientSecret:</td><td>
                            <PasswordMask id="password" name="clientSecret" value={this.state.clientSecret} onChange={this.handleInputChange.bind(this)} style={{width: 300}} />
                            </td></tr>

                            <tr><td>nluDefault:</td><td>
                            <Select name="nluDefault" value={this.state.nluDefault} options={nluOptions} onChange={this.handleNluDefaultChange.bind(this)} style={{width: 300}} />
                            </td></tr>

                            <tr><td>nluLUIS_endpoint:</td><td>
                            <input name="nluLUIS_endpoint" value={this.state.nluLUIS_endpoint} onChange={this.handleInputChange.bind(this)} style={{width: 675}} />
                            </td></tr>

                            <tr><td>nluLUIS_appId:</td><td>
                            <PasswordMask id="password" name="nluLUIS_appId" value={this.state.nluLUIS_appId} onChange={this.handleInputChange.bind(this)} style={{width: 300}} />
                            </td></tr>

                            <tr><td>nluLUIS_subscriptionKey:</td><td>
                            <PasswordMask id="password" name="nluLUIS_subscriptionKey" value={this.state.nluLUIS_subscriptionKey} onChange={this.handleInputChange.bind(this)} style={{width: 300}} />
                            </td></tr>

                            <tr><td>nluDialogflow_clientToken:</td><td>
                            <PasswordMask id="password" name="nluDialogflow_clientToken" value={this.state.nluDialogflow_clientToken} onChange={this.handleInputChange.bind(this)} style={{width: 300}} />
                            </td></tr>

                            <tr><td>nluDialogflow_projectId:</td><td>
                            <PasswordMask id="password" name="nluDialogflow_projectId" value={this.state.nluDialogflow_projectId} onChange={this.handleInputChange.bind(this)} style={{width: 300}} />
                            </td></tr>

                            <tr><td>nluDialogflow_privateKey:</td><td>
                            <PasswordMask id="password" name="nluDialogflow_privateKey" value={this.state.nluDialogflow_privateKey} onChange={this.handleInputChange.bind(this)} style={{width: 300}} />
                            </td></tr>

                            <tr><td>nluDialogflow_clientEmail:</td><td>
                            <PasswordMask id="password" name="nluDialogflow_clientEmail" value={this.state.nluDialogflow_clientEmail} onChange={this.handleInputChange.bind(this)} style={{width: 300}} />
                            </td></tr>

                            <tr><td>neo4j_url:</td><td>
                            <input name="neo4j_url" value={this.state.neo4j_url} onChange={this.handleInputChange.bind(this)} style={{width: 300}} />
                            </td></tr>

                            <tr><td>neo4j_user:</td><td>
                            <input name="neo4j_user" value={this.state.neo4j_user} onChange={this.handleInputChange.bind(this)} style={{width: 300}} />
                            </td></tr>

                            <tr><td>neo4j_password:</td><td>
                            <PasswordMask id="password" name="neo4j_password" value={this.state.neo4j_password} onChange={this.handleInputChange.bind(this)} style={{width: 300}} />
                            </td></tr>
                        </tbody>
                    </ReactBootstrap.Table>
                </div></Draggable>;
    }
}
