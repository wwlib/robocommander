import * as React from "react";

export interface CheckboxProps {
    handleCheckboxChange : any,
    label : string;
    isChecked?: boolean;
}

export interface CheckboxState {
    isChecked : boolean;
}

export default class Checkbox extends React.Component < CheckboxProps, CheckboxState > {

    // static propTypes : any = {
    //     label: React.PropTypes.string.isRequired,
    //     handleCheckboxChange: React.PropTypes.func.isRequired
    // };

    constructor(props : any) {
        super(props);
    }

    componentWillMount() {
        let isChecked: boolean = false;
        if (this.props.isChecked) {
            isChecked = this.props.isChecked;
        }
        this.setState({isChecked: isChecked});
    }

    toggleCheckboxChange() {
        const handleCheckboxChange : any = this.props.handleCheckboxChange;
        const label : string = this.props.label;

        this.setState({isChecked: !this.state.isChecked});

        handleCheckboxChange(label);
    }

    render() {
        const label : string = this.props.label;
        const isChecked : boolean = this.state.isChecked;

        return (
            <div className="checkbox">
                <label>
                    <input type="checkbox" value={label} checked={isChecked} onChange={this.toggleCheckboxChange.bind(this)}/> {label}
                </label>
            </div>
        );
    }
}
