import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";

import GraphModel from './model/GraphModel';
import Graph from './model/Graph';

export interface ModalExportProps { showModalProp: boolean, onClose: any, graphModel: GraphModel, exportMode: string }
export interface ModalExportState { showModalState: boolean, exportedData: string }

export default class ModalExport extends React.Component<ModalExportProps, ModalExportState> {

    constructor(props: any) {
        super(props);
    }

    componentWillMount() {
        this.setState(prevState => ({ showModalState: false, exportedData: ''}));
    }

    componentWillUnmount() {
    }

    componentWillReceiveProps(nextProps: ModalExportProps) {
        // console.log(`ModalExport: componentWillReceiveProps`, nextProps);
        if (nextProps.showModalProp && nextProps.graphModel && nextProps.graphModel.activeGraph) {
            let exportedData: string = "DATA";
            switch(nextProps.exportMode) {
                case "graph":
                    let activeGraph: Graph | undefined = this.props.graphModel.activeGraph;
                    if (activeGraph) {
                        exportedData = JSON.stringify(activeGraph.toJSON(), null, 2);
                    }
                    break;
                case "markup":
                    exportedData = this.props.graphModel.getMarkup();
                    break;
                case "d3":
                    exportedData = this.props.graphModel.getD3();
                    break;
                case "svg":
                    exportedData = this.props.graphModel.getSVG();
                    break;
                case "css":
                    exportedData = this.props.graphModel.getCSS();
                    break;
                case "dot":
                    exportedData = '';
                    break;
            }
            this.setState(prevState => ({
                showModalState: nextProps.showModalProp,
                exportedData: exportedData
            }));
        }
    }

    componentDidUpdate(nextProps: ModalExportProps, nextState: ModalExportState): void {
    }

    close() {
        this.setState(prevState => {
            this.props.onClose();
            return { showModalState: false, exportedData: ''};
        });
    }

    onHide() {
        this.close();
    }

    save() {
        // console.log(`ModalExport: save: ${this.props.exportMode}`);
        let options: any = {};
        switch(this.props.exportMode) {
            case "graph":
                try {
                    options = JSON.parse(this.state.exportedData);
                    this.props.graphModel.newGraphWithOptions(options);
                } catch (e) {
                    console.log(`ModalExport: save: `, e);
                }
                break;
            case "markup":
                options = {
                    markup: this.state.exportedData
                }
                this.props.graphModel.newGraphWithOptions(options);
                break;
            case "d3":
                options = {
                    d3Graph: JSON.parse(this.state.exportedData)
                }
                this.props.graphModel.newGraphWithOptions(options);
                break;
            case "svg":

                break;
            case "css":
                this.props.graphModel.applyActiveGraphCss(this.state.exportedData);
                break;
            case "dot":
                options = {
                    dot: this.state.exportedData
                }
                this.props.graphModel.newGraphWithOptions(options);
                break;
        }

        this.close();
    }

    onButtonClicked(action: string): void {
        switch (action) {
            case 'save':
                this.save();
                break;
            case 'cancel':
                this.close();
                break;
            case 'close':
                this.close();
                break;
        }
    }

    handleInputChange(event: any) {
        let nativeEvent: any = event.nativeEvent;
        switch(nativeEvent.target.name) {
            case 'exportedData':
                this.setState(prevState => ({ exportedData: nativeEvent.target.value}));
                break;
        }
    }

    render() {
        return  <ReactBootstrap.Modal className="modal-export" show={this.state.showModalState} onHide={this.onHide.bind(this)}>
                      <ReactBootstrap.Modal.Header>
                          <ReactBootstrap.Modal.Title>Exported Data: {this.props.exportMode}</ReactBootstrap.Modal.Title>
                      </ReactBootstrap.Modal.Header>

                      <ReactBootstrap.Modal.Body className="modal-export-body">
                          <textarea name="exportedData" className="code" value={this.state.exportedData} onChange={this.handleInputChange.bind(this)}/>
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
