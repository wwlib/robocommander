import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";
import Draggable from "react-draggable";
import Titlebar from '../titlebar/Titlebar';

import GraphModel from './model/GraphModel';

export interface RelationshipPanelProps { id: string, graphModel: GraphModel, onClosePanel: any}
export interface RelationshipPanelState { type: string, properties: string }

export default class RelationshipPanel extends React.Component<RelationshipPanelProps, RelationshipPanelState> {

    private _setPropertiesHandler: any = this.setProperties.bind(this);

    constructor(props: any) {
        super(props);
    }

    componentWillMount() {
        this.setState({
            type: "",
            properties: ""
        });
        this.props.graphModel.on('updateActiveRelationship', this._setPropertiesHandler);
    }

    componentDidMount() {
        this.props.graphModel.addPanelWithId(this.props.id);
    }

    componentWillUnmount() {
        this.props.graphModel.removeListener('updateActiveRelationship', this._setPropertiesHandler);
    }

    setProperties(data: any): void {
        console.log(data);
        this.setState({
            type: data.label,
            properties: data.properties
        });
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
            case "reverse":
                this.props.graphModel.reverseActiveRelationship();
                this.props.graphModel.onRedraw();
                break;
            case "delete":
                this.props.graphModel.deleteActiveRelationship();
                this.props.graphModel.onRedraw();
                break;
            case 'cancel':
                break;
        }
        this.props.onClosePanel(this.props.id);
    }

    save(): void {
        this.props.graphModel.saveActiveRelationship(this.state.type, this.state.properties);
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
        let relationshipId: string = this.props.graphModel.activeRelationship ? this.props.graphModel.activeRelationship.id : ""
        return  <Draggable handle=".handle">
                    <div className="editor-panel well" id="relationshipEditorPanel">
                    <Titlebar
                        draggable={true}
                        handleClick={this.handleClick.bind(this)}
                        handleClose={this.handleClose.bind(this)}
                        handleMinimize={this.handleMinimize.bind(this)}
                        handleMaximize={this.handleMaximize.bind(this)}
                        handleFullScreen={this.handleFullScreen.bind(this)}>
                    </Titlebar>
                    <h4 className="pull-left handle" style={{marginBottom:20}}>Relationship [{relationshipId}]</h4>
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
                    <ReactBootstrap.Button bsStyle={'warning'} key={"reverse"} style = {{width: 80}}
                        onClick={this.onButtonClicked.bind(this, "reverse")}>Reverse</ReactBootstrap.Button>
                    <ReactBootstrap.Button bsStyle={'danger'} key={"delete"} style = {{width: 80}}
                        onClick={this.onButtonClicked.bind(this, "delete")}>Delete</ReactBootstrap.Button>
                    <ReactBootstrap.Button bsStyle={'default'} key={"cancel"} style = {{width: 80}}
                        onClick={this.onButtonClicked.bind(this, "cancel")}>Cancel</ReactBootstrap.Button>

                </div></Draggable>;
    }
}
