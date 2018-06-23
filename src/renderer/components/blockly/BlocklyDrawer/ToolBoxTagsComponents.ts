import * as React from 'react';
// import { Component } from 'react';

export const Block = (props: any) => {
    return React.createElement('block', props)
};
export const Category = (props: any) => {
    return React.createElement('category', props);
};
export const Mutation = (props: any) => {
    return React.createElement('mutation', props);
};
export const Value = (props: any) => {
    return React.createElement('value', props);
};
export const Shadow = (props: any) => {
    return React.createElement('shadow', props);
};
export const Field = (props: any) => {
    return React.createElement('field', props);
};

export interface XmlComponentProps {
    onRef: any;
    tools: any[];
    onChange: any;
    injectOptions: any;
    workspaceXML: any;
    language: any;
}

export interface XmlComponentState {}

export default class XmlComponent extends React.Component<XmlComponentProps, XmlComponentState> {

    static defaultProps: XmlComponentProps = {
        onRef: () => {},
    } as XmlComponentProps;

    render() {
        const injectedProps: any = Object.assign(
            {},
            this.props,
            {
                ref: (x: any) => this.props.onRef(x)
            });
        delete injectedProps.onRef;
        return React.createElement('xml', injectedProps);
    }
}

export const Xml: any = XmlComponent;
