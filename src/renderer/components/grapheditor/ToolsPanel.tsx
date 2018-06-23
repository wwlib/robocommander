import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";

import GraphModel from './model/GraphModel';
import Graph from './model/Graph';
import ModalExport from './ModalExport';
import ModalFileDetails from './ModalFileDetails';

const {dialog, shell} = require('electron').remote;

export interface ToolsPanelProps { graphModel: GraphModel }
export interface ToolsPanelState {
  graphName: string,
  graphScale: number,
  showModal: boolean,
  exportMode: string,
  showFileDetailsModal: boolean,
  fileDetailsMode: string,
  lastUpdateTime: number
}

export default class ToolsPanel extends React.Component<ToolsPanelProps, ToolsPanelState> {

    // private _onUpdateActiveGraphHandler: any = this.onUpdateActiveGraph.bind(this);

    constructor(props: any) {
        super(props);
    }

    componentWillMount() {
        let graphName: string = "<filename>";
        if (this.props.graphModel.activeGraph) {
            graphName = this.props.graphModel.activeGraph.name;
        }
        this.setState(prevState => ({
            graphName: graphName,
            graphScale: 1.0,
            showModal: false,
            exportMode: "markup",
            showFileDetailsModal: false,
            fileDetailsMode: ''
        }));

        // this.props.graphModel.on('updateActiveGraph', this._onUpdateActiveGraphHandler);
    }

    componentDidMount() {
    }

    componentWillUnmount() {
        // this.props.graphModel.removeListener('updateActiveGraph', this._onUpdateActiveGraphHandler);
    }

    onUpdateActiveGraph(): void {
        this.setState(prevState => ({
            graphName: this.props.graphModel.activeGraph ? this.props.graphModel.activeGraph.name : '',
            graphScale: this.props.graphModel.activeGraph ? this.props.graphModel.activeGraph.scale : 1.0
        }));
    }

    handleInputChange(event: any) {
        let nativeEvent: any = event.nativeEvent;
        // console.log(`handleInputChange: ${nativeEvent.target.name} ${nativeEvent.target.value}`, this.state);
        switch(nativeEvent.target.name) {
            case 'graphName':
                this.setState({ graphName: nativeEvent.target.value});
                break;
        }
    }

    handleSubmit(event: any) {
        event.preventDefault();
    }

    onButtonClicked(action: string): void {
        // console.log(`onButtonClicked: ${action}`);
        switch (action) {
            case 'exportGraph':
        		this.openModalExport("graph");
        		break;
            case 'exportMarkup':
        		this.openModalExport("markup");
        		break;
            case 'exportD3':
        		this.openModalExport("d3");
        		break;
            case 'exportSVG':
        		this.openModalExport("svg");
        		break;
            case 'exportCSS':
        		this.openModalExport("css");
        		break;
            case 'exportDot':
        		this.openModalExport("dot");
        		break;
            case 'details':
                this.openModalFileDetails("details");
                break;
            case 'newFile':
                this.openModalFileDetails("newFile");
                break;
            case 'import':
                this.importGraphFile();
                break;
            case 'show':
                if (this.props.graphModel.settings.userDataPath) {
                    shell.showItemInFolder(this.props.graphModel.settings.userDataPath);
                }
                break;
            case 'save':
                this.save();
        		break;
        }
    }

    save(): void {
        if (this.state.graphName != '<filename>') {
            this.props.graphModel.saveActiveGraph();
        } else {
            this.openModalFileDetails("details");
        }
    }

    openModalExport(exportMode: string) {
        this.setState({ showModal: true, exportMode: exportMode });
    }

    onCloseModalExport() {
        this.setState({ showModal: false });
    }

    openModalFileDetails(mode: string = "") {
        this.setState(prevState => ({ showFileDetailsModal: true, fileDetailsMode: mode }));
    }

    importGraphFile(): void {
        dialog.showOpenDialog((fileNames: string[]) => {
            // fileNames is an array that contains all the selected
            if(fileNames === undefined){
                console.log("No file selected");
                return;
            }
            if (fileNames[0] && this.props.graphModel) {
                this.props.graphModel.initGraphWithPath(fileNames[0])
                    .then((graph: Graph) => {
                        if (this.props.graphModel && this.props.graphModel.graphSet) {
                            this.props.graphModel.graphSet.addGraph(graph);
                            this.props.graphModel.graphSet.saveGraph(graph);
                            this.setState(prevState => ({ graphName: graph.name }));
                        }

                    })
                    .catch((err: any) => {
                        console.log(err);
                    })
            }
        });
    }

    onCloseModalFileDetails(options?: any) {
        console.log(`ToolsPanel: onCloseModalFileDetails:`, options);
        if (options) {
            if (options.fileDetailsMode == "newFile") { //save
                this.props.graphModel.newBlankGraph(options.name);
                this.setState(prevState => ({ showFileDetailsModal: false, graphName: options.name }));
            } else { //saveAs
                if (this.props.graphModel.activeGraph && this.props.graphModel.graphSet) {
                    this.props.graphModel.activeGraph.name = options.name;
                    // this.props.graphModel.activeGraph.connection = options.connection;
                    this.props.graphModel.graphSet.addGraph(this.props.graphModel.activeGraph); //TODO if name hass changed, the graph should be copied
                    this.props.graphModel.graphSet.saveGraph(this.props.graphModel.activeGraph);
                    this.setState(prevState => ({ showFileDetailsModal: false, graphName: options.name }));
                } else {
                    this.setState(prevState => ({ showFileDetailsModal: false}));
                }
            }
        } else {
            this.setState(prevState => ({ showFileDetailsModal: false}));
        }

    }

    onMenuItemSelected(value: string) {
        this.setState({ graphName: value});
        this.props.graphModel.initGraphWithName(value);
    }

    renderFilenameMenuItems(): any {
        let menuItems: JSX.Element[] = [];
        if (this.props.graphModel.graphSet) {
            this.props.graphModel.graphSet.getGraphNames().forEach((graphName: string) => {
                let active: boolean = false;
                if (graphName == this.state.graphName) {
                    active = true;
                }
                menuItems.push(
                    <ReactBootstrap.MenuItem active={active} key={graphName} eventKey={graphName} onSelect={this.onMenuItemSelected.bind(this, graphName)}>{graphName}</ReactBootstrap.MenuItem>
                )
            });
        }
        return menuItems;
    }

    renderFilenameSplitButton() {
        return (
            <ReactBootstrap.SplitButton
                bsStyle={"default"}
                title={this.state.graphName}
                key={`filename-splitbutton`}
                id={`filename-splitbutton`}
            >
                {this.renderFilenameMenuItems()}
            </ReactBootstrap.SplitButton>
        );
    }

    render() {
        // <ReactBootstrap.Button bsStyle={'default'} key={"exportDot"} style = {{width: 80}}
        // onClick={this.onButtonClicked.bind(this, "exportDot")}>Dot</ReactBootstrap.Button>
        // <ReactBootstrap.Button bsStyle={'default'} key={"exportMarkup"} style = {{width: 80}}
        // onClick={this.onButtonClicked.bind(this, "exportMarkup")}>Markup</ReactBootstrap.Button>

        return  <div className="editor-panel well" id="toolsPanel">
                  <div className="tools form-inline">
                    <ModalExport showModalProp={this.state.showModal} onClose={this.onCloseModalExport.bind(this)} graphModel={this.props.graphModel} exportMode={this.state.exportMode} />
                    <ModalFileDetails showModalProp={this.state.showFileDetailsModal} onClose={this.onCloseModalFileDetails.bind(this)} graphModel={this.props.graphModel} fileDetailsMode={this.state.fileDetailsMode} />
                    <ReactBootstrap.Button bsStyle={'default'} key={"exportGraph"} style = {{width: 80}}
                      onClick={this.onButtonClicked.bind(this, "exportGraph")}>Graph</ReactBootstrap.Button>
                    <ReactBootstrap.Button bsStyle={'default'} key={"exportD3"} style = {{width: 80}}
                      onClick={this.onButtonClicked.bind(this, "exportD3")}>D3</ReactBootstrap.Button>
                    <ReactBootstrap.Button bsStyle={'default'} key={"exportSVG"} style = {{width: 80}}
                      onClick={this.onButtonClicked.bind(this, "exportSVG")}>SVG</ReactBootstrap.Button>
                    <ReactBootstrap.Button bsStyle={'default'} key={"exportCSS"} style = {{width: 80}}
                      onClick={this.onButtonClicked.bind(this, "exportCSS")}>CSS</ReactBootstrap.Button>
                  <ReactBootstrap.Button bsStyle={'default'} key={"import"} style = {{width: 80}}
                      onClick={this.onButtonClicked.bind(this, "import")}>Import</ReactBootstrap.Button>
                  <ReactBootstrap.Button bsStyle={'default'} key={"show"} style = {{width: 80}}
                      onClick={this.onButtonClicked.bind(this, "show")}>Show</ReactBootstrap.Button>

                    <div>
                        <label className="input-label">Open:</label>
                        {this.renderFilenameSplitButton()}
                        <datalist id="graphlist"></datalist>
                        <ReactBootstrap.Button bsStyle={'default'} key={"save"} style = {{width: 80}}
                          onClick={this.onButtonClicked.bind(this, "save")}>Save</ReactBootstrap.Button>
                        <ReactBootstrap.Button bsStyle={'default'} key={"details"} style = {{width: 80}}
                          onClick={this.onButtonClicked.bind(this, "details")}>Details</ReactBootstrap.Button>
                        <ReactBootstrap.Button bsStyle={'default'} key={"newFile"} style = {{width: 80}}
                            onClick={this.onButtonClicked.bind(this, "newFile")}>New File</ReactBootstrap.Button>

                    </div>
                  </div>
                </div>;
    }
}
