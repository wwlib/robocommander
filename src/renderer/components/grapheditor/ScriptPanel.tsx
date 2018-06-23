import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";
import * as ReactList from 'react-list';
import Draggable from "react-draggable";

import GraphModel from './model/GraphModel';
import { SavedScript } from './model/ScriptConfig';

export interface ScriptPanelProps { graphModel: GraphModel}
export interface ScriptPanelState { activeScript: SavedScript, selectedCyperIndex: number, status: string, lastUpdateTime: number }

export default class ScriptPanel extends React.Component<ScriptPanelProps, ScriptPanelState> {

    private _savedScriptList: SavedScript[] = [];
    private _savedScriptListLength: number = 0;
    private _onScriptExecutedHandler: any = this.onScriptExecuted.bind(this);
    private _onScriptExecutionErrorHandler: any = this.onScriptExecutionErrorHandler.bind(this);
    private _onUpdateActiveGraphHandler: any = this.onUpdateActiveGraph.bind(this);

    private _itemClickedPrevTime: number = 0;

    constructor(props: any) {
        super(props);
    }

    componentWillMount() {
        let item: SavedScript = this.props.graphModel.getSavedScriptList()[0];
        this.setState(prevState => ({
            activeScript: item || { name: '<name>', script: '<script>'} as SavedScript,
            selectedCyperIndex: 0,
            status: ""
        }));

        this.props.graphModel.on('onScriptExecuted', this._onScriptExecutedHandler);
        this.props.graphModel.on('onScriptExecutionError', this._onScriptExecutionErrorHandler);
        this.props.graphModel.on('updateActiveGraph', this._onUpdateActiveGraphHandler);
    }

    componentDidMount() {
    }

    componentWillUnmount() {
        this.props.graphModel.removeListener('onScriptExecuted', this._onScriptExecutedHandler);
        this.props.graphModel.removeListener('onScriptExecutionError', this._onScriptExecutionErrorHandler);
        this.props.graphModel.removeListener('updateActiveGraph', this._onUpdateActiveGraphHandler);
    }

    onScriptExecuted(data: any): void {
        this.setState({
            status: 'OK' //JSON.stringify(data)
        });
    }

    onScriptExecutionErrorHandler(error: any): void {
        this.setState({
            status: error
        });
    }

    onUpdateActiveGraph(): void {
        let item: SavedScript = this.props.graphModel.getSavedScriptList()[0];
        this.setState(prevState => ({
            activeScript: item || { name: '<name>', script: '<script>'} as SavedScript,
            selectedCyperIndex: 0,
            status: ""
        }));
    }

    handleInputChange(event: any) {
        let nativeEvent: any = event.nativeEvent;
        // console.log(`handleInputChange: ${nativeEvent.target.name} ${nativeEvent.target.value}`, this.state);
        let savedScript: SavedScript = this.state.activeScript;
        switch(nativeEvent.target.name) {
            case 'scriptName':
                savedScript.name = nativeEvent.target.value
                break;
            case 'script':
                savedScript.script = nativeEvent.target.value
                break;
            case 'scriptStatus':
                this.setState({
                    status: nativeEvent.target.value,
                });
                break;
        }
        this.setState({ activeScript: savedScript});
    }

    handleSubmit(event: any) {
      event.preventDefault();
    }

    onButtonClicked(action: string): void {
        // console.log(`onButtonClicked: ${action}`);
        switch (action) {
            case 'execute':
                this.executeScript(this.state.activeScript);
                break;
            case 'new':
                this.newSavedScript();
                break;
            case 'delete':
                this.deleteSlectedScript(this.state.activeScript.index);
                    break;
        }
    }

    onItemClicked(index: number): void {
        // console.log(`onButtonClicked: ${index}`);
        let item: SavedScript = this.props.graphModel.getSavedScriptList()[index];
        if (item) {
            this.setState({
                activeScript: item,
                selectedCyperIndex: index
            });
        }
        let currentTime: number = new Date().getTime();
        let elapsedTime: number = currentTime - this._itemClickedPrevTime
        this._itemClickedPrevTime = currentTime;
        if (elapsedTime < 200) {
            this.executeScript(item);
        }
    }

    executeScript(activeScript: SavedScript): void {
        this.props.graphModel.executeScript(activeScript);
    }

    newSavedScript(): void {
        let newIndex: number = this.props.graphModel.newSavedScript();
        console.log(`newSavedScript: ${newIndex}`);
        this.setState(prevState => {
            return {
                activeScript: this.props.graphModel.getSavedScriptList()[newIndex],
                selectedCyperIndex: newIndex
            }
        });
    }

    deleteSlectedScript(index: number): void {
        let newIndex: number = this.props.graphModel.deleteSavedScript(this.state.activeScript);
        this.setState({
            activeScript: this.props.graphModel.getSavedScriptList()[newIndex],
            selectedCyperIndex: newIndex
        });
    }

    renderItem(index: number, key: string) {
      let item: SavedScript = this._savedScriptList[index];
    //   let itemName: string = item.name;
    //   let itemScript: string = item.script;
    //   let count: number = this._savedScriptListLength;
      let classname: string = 'item' + (index % 2 ? '' : ' even')
      if (index == this.state.selectedCyperIndex) {
          classname += ' selected';
      }
    //   console.log(`renderItem ${index} ${key} ${count} ${item.name} ${item.script}`)
      return  <div key={key} className={classname} onClick={this.onItemClicked.bind(this, index)}>
                {item.name}
              </div>;
   }

    render() {
        this._savedScriptList = this.props.graphModel.getSavedScriptList();
        this._savedScriptListLength = this._savedScriptList.length;

        // console.log(`render: `, this._savedScriptList);

        return  <Draggable handle=".handle"><div className="editor-panel well" id="scriptPanel">
                    <h4 className="pull-left handle" style={{marginBottom:20}}>Saved Scripts</h4>
                    <div className="clearfix"></div>
                    <ReactBootstrap.Table striped bordered condensed hover style = {{width: 400}}>
                            <tbody>
                            <tr>
                            <td>name:</td>
                            <td>
                            <input name="scriptName" value={this.state.activeScript.name} onChange={this.handleInputChange.bind(this)} style={{width: 400}} />
                            </td>
                            </tr>
                            <tr>
                            <td>script:</td>
                            <td>
                            <textarea name="script" value={this.state.activeScript.script} onChange={this.handleInputChange.bind(this)} style={{width: 400, height: 150}} />
                            </td>
                            </tr>
                            <tr>
                            <td>saved:</td>
                            <td>
                            <div style={{overflow: 'auto', height: 200, maxHeight: 200}}>
                                <ReactList
                                  itemRenderer={this.renderItem.bind(this)}
                                  length={this._savedScriptListLength}
                                  type='uniform'
                                />
                            </div>
                            </td>
                            </tr>
                        </tbody>
                    </ReactBootstrap.Table>
                    <ReactBootstrap.Button bsStyle={'default'} key={"execute"} style = {{width: 80}}
                        onClick={this.onButtonClicked.bind(this, "execute")}>Execute</ReactBootstrap.Button>
                    <ReactBootstrap.Button bsStyle={'default'} key={"new"} style = {{width: 80}}
                        onClick={this.onButtonClicked.bind(this, "new")}>New</ReactBootstrap.Button>
                    <ReactBootstrap.Button bsStyle={'default'} key={"delete"} style = {{width: 80}}
                        onClick={this.onButtonClicked.bind(this, "delete")}>Delete</ReactBootstrap.Button>

                </div></Draggable>
    }
}
