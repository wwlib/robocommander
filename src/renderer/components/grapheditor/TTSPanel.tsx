import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";
import * as ReactList from 'react-list';
import Draggable from "react-draggable";

import GraphModel from './model/GraphModel';
import { SavedTTS } from './model/GraphConfig';

export interface TTSPanelProps { graphModel: GraphModel}
export interface TTSPanelState { activeTTS: SavedTTS, selectedCyperIndex: number, status: string, lastUpdateTime: number }

export default class TTSPanel extends React.Component<TTSPanelProps, TTSPanelState> {

    private _savedTTSList: SavedTTS[] = [];
    private _savedTTSListLength: number = 0;
    private _onTTSExecutedHandler: any = this.onTTSExecuted.bind(this);
    private _onTTSExecutionErrorHandler: any = this.onTTSExecutionErrorHandler.bind(this);
    private _onUpdateActiveGraphHandler: any = this.onUpdateActiveGraph.bind(this);

    private _itemClickedPrevTime: number = 0;

    constructor(props: any) {
        super(props);
    }

    componentWillMount() {
        let item: SavedTTS = this.props.graphModel.getSavedTTSList()[0];
        this.setState(prevState => ({
            activeTTS: item || { name: '<name>', prompt: '<prompt>'} as SavedTTS,
            selectedCyperIndex: 0,
            status: ""
        }));

        this.props.graphModel.on('onTTSExecuted', this._onTTSExecutedHandler);
        this.props.graphModel.on('onTTSExecutionError', this._onTTSExecutionErrorHandler);
        this.props.graphModel.on('updateActiveGraph', this._onUpdateActiveGraphHandler);
    }

    componentDidMount() {
    }

    componentWillUnmount() {
        this.props.graphModel.removeListener('onTTSExecuted', this._onTTSExecutedHandler);
        this.props.graphModel.removeListener('onTTSExecutionError', this._onTTSExecutionErrorHandler);
        this.props.graphModel.removeListener('updateActiveGraph', this._onUpdateActiveGraphHandler);
    }

    onTTSExecuted(data: any): void {
        this.setState({
            status: 'OK' //JSON.stringify(data)
        });
    }

    onTTSExecutionErrorHandler(error: any): void {
        this.setState({
            status: error
        });
    }

    onUpdateActiveGraph(): void {
        let item: SavedTTS = this.props.graphModel.getSavedTTSList()[0];
        this.setState(prevState => ({
            activeTTS: item || { name: '<name>', prompt: '<prompt>'} as SavedTTS,
            selectedCyperIndex: 0,
            status: ""
        }));
    }

    handleInputChange(event: any) {
        let nativeEvent: any = event.nativeEvent;
        // console.log(`handleInputChange: ${nativeEvent.target.name} ${nativeEvent.target.value}`, this.state);
        let savedTTS: SavedTTS = this.state.activeTTS;
        switch(nativeEvent.target.name) {
            case 'promptName':
                savedTTS.name = nativeEvent.target.value
                break;
            case 'prompt':
                savedTTS.prompt = nativeEvent.target.value
                break;
            case 'promptStatus':
                this.setState({
                    status: nativeEvent.target.value,
                });
                break;
        }
        this.setState({ activeTTS: savedTTS});
    }

    handleSubmit(event: any) {
      event.preventDefault();
    }

    onButtonClicked(action: string): void {
        // console.log(`onButtonClicked: ${action}`);
        switch (action) {
            case 'run':
                this.sendTTS(this.state.activeTTS);
                break;
            case 'new':
                this.newSavedTTS();
                break;
            case 'delete':
                this.deleteSlectedTTS(this.state.activeTTS.index);
                    break;
        }
    }

    onItemClicked(index: number): void {
        // console.log(`onButtonClicked: ${index}`);
        let item: SavedTTS = this.props.graphModel.getSavedTTSList()[index];
        if (item) {
            this.setState({
                activeTTS: item,
                selectedCyperIndex: index
            });
        }
        let currentTime: number = new Date().getTime();
        let elapsedTime: number = currentTime - this._itemClickedPrevTime
        this._itemClickedPrevTime = currentTime;
        if (elapsedTime < 200) {
            this.sendTTS(item);
        }
    }

    sendTTS(activeTTS: SavedTTS): void {
        this.props.graphModel.sendTTS(activeTTS);
    }

    newSavedTTS(): void {
        let newIndex: number = this.props.graphModel.newSavedTTS();
        console.log(`newSavedTTS: ${newIndex}`);
        this.setState(prevState => {
            return {
                activeTTS: this.props.graphModel.getSavedTTSList()[newIndex],
                selectedCyperIndex: newIndex
            }
        });
    }

    deleteSlectedTTS(index: number): void {
        let newIndex: number = this.props.graphModel.deleteSavedTTS(this.state.activeTTS);
        this.setState({
            activeTTS: this.props.graphModel.getSavedTTSList()[newIndex],
            selectedCyperIndex: newIndex
        });
    }

    renderItem(index: number, key: string) {
      let item: SavedTTS = this._savedTTSList[index];
    //   let itemName: string = item.name;
    //   let itemTTS: string = item.prompt;
    //   let count: number = this._savedTTSListLength;
      let classname: string = 'item' + (index % 2 ? '' : ' even')
      if (index == this.state.selectedCyperIndex) {
          classname += ' selected';
      }
    //   console.log(`renderItem ${index} ${key} ${count} ${item.name} ${item.prompt}`)
      return  <div key={key} className={classname} onClick={this.onItemClicked.bind(this, index)}>
                {item.name}
              </div>;
   }

    render() {
        this._savedTTSList = this.props.graphModel.getSavedTTSList();
        this._savedTTSListLength = this._savedTTSList.length;

        // console.log(`render: `, this._savedTTSList);

        return  <Draggable handle=".handle"><div className="editor-panel well" id="ttsPanel">
                    <h4 className="pull-left handle" style={{marginBottom:20}}>Saved TTSs</h4>
                    <div className="clearfix"></div>
                    <ReactBootstrap.Table striped bordered condensed hover style = {{width: 400}}>
                            <tbody>
                            <tr>
                            <td>name:</td>
                            <td>
                            <input name="promptName" value={this.state.activeTTS.name} onChange={this.handleInputChange.bind(this)} style={{width: 400}} />
                            </td>
                            </tr>
                            <tr>
                            <td>prompt:</td>
                            <td>
                            <textarea name="prompt" value={this.state.activeTTS.prompt} onChange={this.handleInputChange.bind(this)} style={{width: 400, height: 50}} />
                            </td>
                            </tr>
                            <tr>
                            <td>saved:</td>
                            <td>
                            <div style={{overflow: 'auto', height: 200, maxHeight: 200}}>
                                <ReactList
                                  itemRenderer={this.renderItem.bind(this)}
                                  length={this._savedTTSListLength}
                                  type='uniform'
                                />
                            </div>
                            </td>
                            </tr>
                        </tbody>
                    </ReactBootstrap.Table>
                    <ReactBootstrap.Button bsStyle={'default'} key={"run"} style = {{width: 80}}
                        onClick={this.onButtonClicked.bind(this, "run")}>Run</ReactBootstrap.Button>
                    <ReactBootstrap.Button bsStyle={'default'} key={"new"} style = {{width: 80}}
                        onClick={this.onButtonClicked.bind(this, "new")}>New</ReactBootstrap.Button>
                    <ReactBootstrap.Button bsStyle={'default'} key={"delete"} style = {{width: 80}}
                        onClick={this.onButtonClicked.bind(this, "delete")}>Delete</ReactBootstrap.Button>

                </div></Draggable>
    }
}
