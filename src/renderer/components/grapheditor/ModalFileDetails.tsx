import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";

import GraphModel from './model/GraphModel';

export interface ModalFileDetailsProps { showModalProp: boolean, onClose: any, graphModel: GraphModel, fileDetailsMode: string }
export interface ModalFileDetailsState { showModalState: boolean, graphName: string, graphNameStyle: any }

export default class ModalFileDetails extends React.Component<ModalFileDetailsProps, ModalFileDetailsState> {

    constructor(props: any) {
        super(props);
    }

    componentWillMount() {
        this.setState(prevState => ({
                showModalState: false,
                graphName: "",
                graphNameStyle: {color: 'black'}
        }));
    }

    componentWillUnmount() {

    }

    componentWillReceiveProps(nextProps: ModalFileDetailsProps) {
        // console.log(`ModalFileDetails: componentWillReceiveProps`, nextProps);
        let graphName: string = "";
        switch (nextProps.fileDetailsMode) {
            case "details":
                graphName = nextProps.graphModel.activeGraph ? nextProps.graphModel.activeGraph.name : '';
                break;
            case "newFile":
                graphName = "<filename>";
                break;
        }
        if (nextProps.showModalProp) {
            this.setState(prevState => ({
                showModalState: nextProps.showModalProp,
                graphName: graphName,
                graphNameStyle: {color: 'black'},
            }));
        }
    }

    componentDidUpdate(nextProps: ModalFileDetailsProps, nextState: ModalFileDetailsState): void {
    }

    close(options?: any) {
        console.log(`ModalFileDetails: close: ${options}`);
        this.setState(prevState => {
            this.props.onClose(options);
            return { showModalState: false, graphName: ''};
        });
    }

    onHide() {
        console.log(`ModalFileDetails: onHide: `);
        this.close();
    }

    save() {
        let options: any = {};
        options.fileDetailsMode = this.props.fileDetailsMode;
        options.name = this.state.graphName;
        this.close(options);
    }

    onButtonClicked(action: string): void {
        switch (action) {
            case 'save':
                if (this.state.graphName != "<filename>") {
                    this.save();
                } else {
                    this.setState(prevState => ({graphNameStyle: {color: 'red'}}));
                }
                break;
            case 'cancel':
                this.close();
                break;
        }
    }

    handleInputChange(event: any) {
        let nativeEvent: any = event.nativeEvent;
        switch(nativeEvent.target.name) {
            case 'graphName':
                this.setState(prevState => ({ graphName: nativeEvent.target.value}));
                break;
        }
    }

    render() {
        return  <ReactBootstrap.Modal show={this.state.showModalState} onHide={this.onHide.bind(this)}>
                      <ReactBootstrap.Modal.Header>
                          <ReactBootstrap.Modal.Title>Graph Details: {this.props.fileDetailsMode}</ReactBootstrap.Modal.Title>
                      </ReactBootstrap.Modal.Header>

                      <ReactBootstrap.Modal.Body >
                          <div className="pull-left" style={{paddingRight: 6}}>Filename:</div><input name="graphName"  id="graphName" type="text" value={this.state.graphName}
                            onChange={this.handleInputChange.bind(this)} style={this.state.graphNameStyle}/>
                      </ReactBootstrap.Modal.Body>

                      <ReactBootstrap.Modal.Footer>
                          <ReactBootstrap.Button bsStyle={'success'} key={"cancel"} style = {{width: 150}}
                              onClick={this.onButtonClicked.bind(this, "cancel")}>Cancel</ReactBootstrap.Button>
                          <ReactBootstrap.Button bsStyle={'success'} key={"save"} style = {{width: 150}}
                              onClick={this.onButtonClicked.bind(this, "save")}>Save</ReactBootstrap.Button>
                      </ReactBootstrap.Modal.Footer>
                </ReactBootstrap.Modal>
    }
}
