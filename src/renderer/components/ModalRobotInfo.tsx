import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";
const PasswordMask = require('react-password-mask');
import 'react-select/dist/react-select.css';
import Robot, { RobotType } from '../model/Robot';

export interface ModalRobotInfoProps { showModalProp: boolean, onClose: any, modalRobot: Robot }
export interface ModalRobotInfoState {
    showModalState: boolean;
    type: string;
    name: string;
    ip: string;
    aliasName: string;
    email: string;
    password: string;
}

export default class ModalRobotInfo extends React.Component<ModalRobotInfoProps, ModalRobotInfoState> {

    constructor(props: any) {
        super(props);
    }

    componentWillMount() {
        this.setState({ showModalState: false, type: '', name: '', password: ''}, () => {
        });
    }

    componentWillReceiveProps(nextProps: ModalRobotInfoProps) {
        if (nextProps.modalRobot) {
            let ip: string = `<jibo ip is set-automatically>`;
            if (nextProps.modalRobot.ip) {
                ip = nextProps.modalRobot.ip;
            }
            this.setState({
                showModalState: nextProps.showModalProp,
                type: nextProps.modalRobot.type,
                name: nextProps.modalRobot.name,
                ip: ip,
                aliasName: nextProps.modalRobot.serialName,
                email: nextProps.modalRobot.email,
                password: nextProps.modalRobot.password

            }, () => {
                console.log(this.state.type, this.state.name, this.state.ip, this.state.aliasName, this.state.email);
            });
        }
    }

    componentDidUpdate(nextProps: ModalRobotInfoProps, nextState: ModalRobotInfoState): void {
    }

    close(cancel: boolean = true) {
        this.setState({ showModalState: false, type: '', name: '', ip: '', aliasName: '', email: '', password: ''}, () => {
            this.props.onClose(cancel);
        });
    }

    save() {
        this.props.modalRobot.type = this.state.type;
        this.props.modalRobot.name = this.state.name;
        this.props.modalRobot.serialName = this.state.aliasName;
        this.props.modalRobot.email = this.state.email;
        this.props.modalRobot.password = this.state.password;
        this.props.modalRobot.ip = this.state.ip;
        this.close(false);
    }

    onHide() {
        console.log(`ModalRobotInfo: onHide`);
    }

    handleInputChange(event: any) {
        let nativeEvent: any = event.nativeEvent;
        switch(nativeEvent.target.name) {
            case 'name':
                this.setState({ name: nativeEvent.target.value});
                break;
            case 'aliasName':
                this.setState({ aliasName: nativeEvent.target.value});
                break;
            case 'email':
                this.setState({ email: nativeEvent.target.value});
                break;
            case 'password':
                this.setState({ password: nativeEvent.target.value});
                break;
            case 'ip':
                let ip: string = `<jibo ip is set-automatically>`;
                if (this.state.type == RobotType.robokit) {
                    ip = nativeEvent.target.value
                }
                this.setState({ ip: ip});
                break;
        }
    }

    onMenuItemSelected(value: string) {
        let ip: string = `<jibo ip is set-automatically>`;
        if (value == RobotType.robokit) {
            ip = '';
        }
        this.setState({ type: value, ip: ip });
    }

    renderRobotTypeItems(): any {
        let menuItems: JSX.Element[] = [];
        for (var robotType in RobotType) {
            let active: boolean = false;
            if (robotType == this.state.type) {
                active = true;
            }
            menuItems.push(
                <ReactBootstrap.MenuItem active={active} key={robotType} eventKey={robotType} onSelect={this.onMenuItemSelected.bind(this, robotType)}>{robotType}</ReactBootstrap.MenuItem>
            )
        }

        return menuItems;
    }

    renderRobotTypeSplitButton() {
        return (
            <ReactBootstrap.SplitButton
                bsStyle={"default"}
                title={this.state.type}
                key={`filename-splitbutton`}
                id={`filename-splitbutton`}
            >
                {this.renderRobotTypeItems()}
            </ReactBootstrap.SplitButton>
        );
    }

    render() {
        return  <div className="static-modal">
                    <ReactBootstrap.Modal show={this.state.showModalState} onHide={this.onHide.bind(this)}>
                      <ReactBootstrap.Modal.Header>
                        <ReactBootstrap.Modal.Title>Robot Info</ReactBootstrap.Modal.Title>
                      </ReactBootstrap.Modal.Header>

                      <ReactBootstrap.Modal.Body>
                      <ReactBootstrap.Table striped bordered condensed hover style = {{width: 300}}>
                          <tbody>


                          <tr><td>type:</td><td>
                          {this.renderRobotTypeSplitButton()}
                          </td></tr>

                          <tr><td>name:</td><td>
                          <input name="name" value={this.state.name} onChange={this.handleInputChange.bind(this)} style={{width: 300}} />
                          </td></tr>

                          <tr><td>aliasName:</td><td>
                          <input name="aliasName" value={this.state.aliasName} onChange={this.handleInputChange.bind(this)} style={{width: 300}} />
                          </td></tr>

                          <tr><td>email:</td><td>
                          <input name="email" value={this.state.email} onChange={this.handleInputChange.bind(this)} style={{width: 300}} />
                          </td></tr>

                          <tr><td>password:</td><td>
                          <PasswordMask id="password" name="password" value={this.state.password} onChange={this.handleInputChange.bind(this)} style={{width: 300}} />
                          </td></tr>

                          <tr><td>ip:</td><td>
                          <textarea name="ip" value={this.state.ip} onChange={this.handleInputChange.bind(this)} style={{width: 300, height: 24}} />
                          </td></tr>


                          </tbody>
                      </ReactBootstrap.Table>
                      </ReactBootstrap.Modal.Body>

                      <ReactBootstrap.Modal.Footer>
                        <ReactBootstrap.Button onClick={() => this.close()}>Cancel</ReactBootstrap.Button>
                        <ReactBootstrap.Button bsStyle="primary" onClick={this.save.bind(this)}>Save changes</ReactBootstrap.Button>
                      </ReactBootstrap.Modal.Footer>

                    </ReactBootstrap.Modal>
                    </div>
                }
}
