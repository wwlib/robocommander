import * as React from 'react';
// import * as PropTypes from 'prop-types';
import {
    Block,
    Xml,
    Category
} from './ToolBoxTagsComponents';

let styles: any = null;

export interface BlocklyToolboxProps {
    onRef: any;
    tools: any[];
    children: React.ReactNode;
}

export interface BlocklyToolboxState {}

export default class BlocklyToolbox extends React.Component<BlocklyToolboxProps, BlocklyToolboxState> {

    static defaultProps: BlocklyToolboxProps = {
        onRef: () => {},
    } as BlocklyToolboxProps;

    public groupedByCategory: any;
    public elements: any;

    constructor(props: any) {
        super(props);

        this.groupedByCategory = props.tools.reduce(
            (accumulated: any, item: any) => {
                const result = accumulated;
                result[item.category] = result[item.category] || [];
                result[item.category].push(item.name);
                return result;
            },
            {}
        );

        this.elements = Object.keys(this.groupedByCategory).map((key) => {
            const blocks = this.groupedByCategory[key].map((type: any) => {
                return <Block type={type} key={type} />;
            });
            return (
                <Category key={key} name={key}>
                    {blocks}
                </Category>
            );
        });
    }

    render() {
        return (
            <Xml
              style={styles.toolbox}
              onRef={this.props.onRef}
            >
              {this.elements}
              {this.props.children}
            </Xml>        );
    }
}

styles = {
    toolbox: {
        display: 'none',
    },
};

// BlocklyToolbox.propTypes = {
//     onRef: PropTypes.func,
//     tools: PropTypes.arrayOf(Object).isRequired,
//     children: PropTypes.oneOfType([
//         PropTypes.arrayOf(PropTypes.node),
//         PropTypes.node
//     ])
// };
