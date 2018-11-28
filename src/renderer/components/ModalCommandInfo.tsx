import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";
import RomCommand from '../model/RomCommand';

const jsonic = require('jsonic');


export interface ModalCommandInfoProps { showModalProp: boolean, onClose: any, modalCommand: RomCommand, editMode: string }
export interface ModalCommandInfoState { showModalState: boolean, name: string, type: string, data: any }

export default class ModalCommandInfo extends React.Component<ModalCommandInfoProps, ModalCommandInfoState> {

    constructor(props: any) {
        super(props);
    }

    componentWillMount() {
        // console.log(`ModalCommandInfo: componentWillMount`);
        this.setState({ showModalState: false, name: ''}, () => {
        });
    }

    componentWillReceiveProps(nextProps: ModalCommandInfoProps) {
        // console.log(`ModalCommandInfo: componentWillReceiveProps`, nextProps);
        if (nextProps.modalCommand) {
            try {
                this.setState({
                    showModalState: nextProps.showModalProp,
                    name: nextProps.modalCommand.name,
                    type: nextProps.modalCommand.type,
                    data: jsonic.stringify(nextProps.modalCommand.data),
                }, () => {
                    // console.log(this.state.name, this.state.type, this.state.data, this.state);
                });
            } catch (e) {
                console.log(e);
            }
        }
    }

    componentDidUpdate(nextProps: ModalCommandInfoProps, nextState: ModalCommandInfoState): void {
        // console.log(`ModalCommandInfo: componentDidUpdate`);
    }

    close() {
        // console.log(`ModalCommandInfo: close`);
        this.setState({ showModalState: false, name: '', type: '', data: {} }, () => {
            this.props.onClose(this.props.editMode);
        });
    }

    save() {
        console.log(`ModalCommandInfo: save`);
        console.log(this.state);
        try {
            this.props.modalCommand.name = this.state.name;
            this.props.modalCommand.type = this.state.type;
            this.props.modalCommand.data = jsonic(this.state.data);
            console.log(this.props.modalCommand);
            this.close();
        } catch (e) {
            console.log(e);
        }
    }

    onHide() {
        console.log(`ModalCommandInfo: onHide`);
    }

    handleInputChange(event: any) {
        let nativeEvent: any = event.nativeEvent;
        // console.log(`handleInputChange: ${nativeEvent.target.name} ${nativeEvent.target.value}`, this.state);
        switch(nativeEvent.target.name) {
            case 'name':
                this.setState({ name: nativeEvent.target.value});
                break;
            case 'type':
                this.setState({ type: nativeEvent.target.value});
                break;
            case 'data':
                this.setState({ data: nativeEvent.target.value});
                break;
        }
    }

    render() {
        return  <div className="static-modal">
                    <ReactBootstrap.Modal show={this.state.showModalState} onHide={this.onHide.bind(this)}>
                      <ReactBootstrap.Modal.Header>
                        <ReactBootstrap.Modal.Title>Command Info</ReactBootstrap.Modal.Title>
                      </ReactBootstrap.Modal.Header>

                      <ReactBootstrap.Modal.Body>
                      <ReactBootstrap.Table striped bordered condensed hover style = {{width: 300}}>
                          <tbody>
                              <tr>
                              <td>name:</td>
                              <td>
                              <input name="name" value={this.state.name} onChange={this.handleInputChange.bind(this)} style={{width: 300}} />
                              </td>
                              </tr>
                              <tr>
                              <td>type:</td>
                              <td>
                              <input name="type" value={this.state.type} onChange={this.handleInputChange.bind(this)} style={{width: 300}} />
                              </td>
                              </tr>
                              <tr>
                              <td>data:</td>
                              <td>
                              <textarea name="data" value={this.state.data} onChange={this.handleInputChange.bind(this)} style={{width: 300, height: 150}} />
                              </td>
                              </tr>
                          </tbody>
                      </ReactBootstrap.Table>
                      </ReactBootstrap.Modal.Body>

                      <ReactBootstrap.Modal.Footer>
                        <ReactBootstrap.Button onClick={this.close.bind(this)}>Cancel</ReactBootstrap.Button>
                        <ReactBootstrap.Button bsStyle="primary" onClick={this.save.bind(this)}>Save</ReactBootstrap.Button>
                      </ReactBootstrap.Modal.Footer>

                    </ReactBootstrap.Modal>
                    </div>
                }
}
