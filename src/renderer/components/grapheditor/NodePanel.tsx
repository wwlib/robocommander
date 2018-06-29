import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";
import Draggable from "react-draggable";
import Titlebar from '../titlebar/Titlebar';

import GraphModel from './model/GraphModel';

export interface NodePanelProps { id: string, graphModel: GraphModel, onClosePanel: any}
export interface NodePanelState { type: string, properties: string, lastUpdateTime: number }

export default class NodePanel extends React.Component<NodePanelProps, NodePanelState> {

    private _oldLabel: string = '';
    private _setPropertiesHandler: any = this.setProperties.bind(this);

    constructor(props: any) {
        super(props);
    }

    componentWillMount() {
        // console.log(`nodePanel: componentWillMount:`, this);
        this._oldLabel = '';
        this.setState({
            type: "",
            properties: ""
        });

        this.props.graphModel.on('updateActiveNode', this._setPropertiesHandler);
    }

    setProperties(data: any): void {
        this._oldLabel = data.label;
        this.setState({
            type: data.label,
            properties: data.properties
        });
    }

    componentDidMount() {
        this.props.graphModel.addPanelWithId(this.props.id);
    }

    componentWillUnmount() {
        this.props.graphModel.removeListener('updateActiveNode', this._setPropertiesHandler);
    }

    handleInputChange(event: any) {
        let nativeEvent: any = event.nativeEvent;
        // console.log(`handleInputChange: ${nativeEvent.target.name} ${nativeEvent.target.value}`, this.state);
        switch(nativeEvent.target.name) {
            case 'type':
                this.setState({ type: nativeEvent.target.value});
                break;
            case 'properties':
                this.setState({ properties: nativeEvent.target.value});
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
                this.props.graphModel.onRedraw();
                break;
            case 'delete':
                this.props.graphModel.deleteActiveNode();
                this.props.graphModel.onRedraw();
                break;
            case 'cancel':
                break;
        }
        this.props.onClosePanel(this.props.id);
    }

    save(): void {
        this.props.graphModel.saveActiveNode(this.state.type, this.state.properties, this._oldLabel);
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
        let nodeId: string = this.props.graphModel.activeNode ? this.props.graphModel.activeNode.id : ""
        return  <Draggable handle=".handle">
                    <div className="editor-panel well" id="nodeEditorPanel">
                    <Titlebar
                        draggable={true}
                        handleClick={this.handleClick.bind(this)}
                        handleClose={this.handleClose.bind(this)}
                        handleMinimize={this.handleMinimize.bind(this)}
                        handleMaximize={this.handleMaximize.bind(this)}
                        handleFullScreen={this.handleFullScreen.bind(this)}>
                    </Titlebar>
                    <h4 className="pull-left handle" style={{marginBottom:20}}>Node [{nodeId}]</h4>
                    <div className="clearfix"></div>
                    <ReactBootstrap.Table striped bordered condensed hover style = {{width: 400}}>
                        <tbody>
                            <tr>
                            <td>type:</td>
                            <td>
                            <input name="type" value={this.state.type} onChange={this.handleInputChange.bind(this)} style={{width: 300}} />
                            </td>
                            </tr>
                            <tr>
                            <td>properties:</td>
                            <td>
                            <textarea name="properties" value={this.state.properties} onChange={this.handleInputChange.bind(this)} style={{width: 300, height: 100}} />
                            </td>
                            </tr>
                        </tbody>
                    </ReactBootstrap.Table>
                    <ReactBootstrap.Button bsStyle={'success'} key={"save"} style = {{width: 80}}
                        onClick={this.onButtonClicked.bind(this, "save")}>Save</ReactBootstrap.Button>
                    <ReactBootstrap.Button bsStyle={'danger'} key={"delete"} style = {{width: 80}}
                        onClick={this.onButtonClicked.bind(this, "delete")}>Delete</ReactBootstrap.Button>
                    <ReactBootstrap.Button bsStyle={'default'} key={"cancel"} style = {{width: 80}}
                        onClick={this.onButtonClicked.bind(this, "cancel")}>Cancel</ReactBootstrap.Button>
                </div></Draggable>
    }
}
