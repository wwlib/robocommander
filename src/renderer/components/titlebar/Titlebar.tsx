import * as React from "react";

var util = require('util');
// var fs = require('fs');
var defaultcss = require('defaultcss');
var classNames = require('classnames');

var stoplightPNG = require('./stoplight.png');
var stoplightURL = stoplightPNG.toString('base64');

import styleCss from './titlebar-css'
var style = util.format(styleCss, stoplightURL);

var ALT = 18;


export interface TitlebarProps {
    draggable: boolean;
    handleClick: any;
    handleClose: any;
    handleMinimize: any;
    handleMaximize: any;
    handleFullScreen: any;
}

export interface TitlebarState {
    altDown: boolean;
    draggable: boolean;
}

export default class Titlebar extends React.Component<TitlebarProps, TitlebarState> {

    private _keyDownHandler: any = this.handleKeyDown.bind(this);
    private _keyUpHandler: any = this.handleKeyUp.bind(this);


    constructor(props: any) {
        super(props);
    }

    componentWillMount() {
        this.setState({ altDown: false, draggable: true });
    }

    componentWillReceiveProps(nextProps: TitlebarProps) {
        if (nextProps.draggable) {
            try {
                this.setState({
                    draggable: nextProps.draggable
                }, () => {
                    // console.log(this.state.draggable, this.state.atlDown);
                });
            } catch (e) {
                console.log(e);
            }
        }
    }

    componentDidMount() {
        document.body.addEventListener('keydown', this._keyDownHandler);
        document.body.addEventListener('keyup', this._keyUpHandler);
    }

    componentWillUnMount() {
        document.body.removeEventListener('keydown', this._keyDownHandler);
        document.body.removeEventListener('keyup', this._keyUpHandler);
    }

    handleKeyDown(e: any) {
        if (e.keyCode === ALT) {
            this.setState({ altDown: true });
        }
    }

    handleKeyUp(e: any) {
        if (e.keyCode === ALT) {
            this.setState({ altDown: false });
        }
    }

    handleMaximize(e: any) {
        if (this.state.altDown) {
            // maximize
            this.props.handleMaximize(e);
        } else {
            this.props.handleFullScreen(e);
        }
    }

    // simply prevent event
    handleNop(e: any) {
        e.preventDefault();
        e.stopPropagation();
    }

    render() {
        var classes = classNames('handle', 'titlebar',
        {
            'webkit-draggable': this.state.draggable,
            'alt': this.state.altDown,
        });

        // set default CSS
        defaultcss('titlebar', style);

        return (
            <div className={classes} id="titlebar" onClick={this.props.handleClick}>
            	<div className="titlebar-stoplight">
            		<div onDoubleClick={this.handleNop} onClick={this.props.handleClose} className="titlebar-close"></div>
            		<div onDoubleClick={this.handleNop} onClick={this.props.handleMinimize} className="titlebar-minimize"></div>
            		<div onDoubleClick={this.handleNop} onClick={this.handleMaximize.bind(this)} className="titlebar-fullscreen"></div>
            	</div>
                {this.props.children}
            </div>
        )
    }
}
