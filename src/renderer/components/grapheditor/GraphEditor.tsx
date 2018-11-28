import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";
import Checkbox from '../Checkbox';
import FontAwesome from 'react-fontawesome';

const jsonic = require('jsonic');

import {
    select,
    Selection,
    event
} from 'd3-selection';
import { drag } from 'd3-drag';
import * as d3Zoom from 'd3-zoom';
import * as d3Force from 'd3-force';

import {
  Diagram,
  Model,
  Node,
  Relationship,
  LayoutModel,
  LayoutNode,
  LayoutRelationship
} from 'graph-diagram';

import ToolsPanel from './ToolsPanel';
import TTSPanel from './TTSPanel';
import ScriptPanel from './ScriptPanel';
import StateDataPanel from './StateDataPanel';
import NodePanel from './NodePanel';
import RelationshipPanel from './RelationshipPanel';
import GraphModel from './model/GraphModel';
import CommanderModel from '../../model/Model';
import { SavedTTS } from './model/GraphConfig';

import Robot, { RobotIntent, RobotIntentData, RobotIntentType } from '../../model/Robot';

export interface GraphEditorProps {
    commanderModel: CommanderModel
}

export interface GraphEditorState {
  scale: number;
  showNodePanel: boolean;
  showRelationshipPanel: boolean;
  showTTSPanel: boolean;
  showScriptPanel: boolean;
  showStateDataPanel: boolean;
  autoScroll: boolean;
  lastUpdateTime: number;
}

let thiz: GraphEditor;
let svgContainer: any;
let svg: Selection<Element, {}, any, any> | undefined;
let svg_g: Selection<Element, {}, any, any> | undefined;
let zoomer: any;
let simulation: any;
let simulationTickCount: number = 0;
let simulationMaxTicks: number;
let simNodes: any;
let simData: any;

export default class GraphEditor extends React.Component < GraphEditorProps, GraphEditorState > {

    public graphModel: GraphModel;
    public diagram: Diagram | undefined;

    private _clickHandler: any = this.clicked.bind(this);
    private _dragStartHandler: any = this.dragStart.bind(this);
    private _dragEndHandler: any = this.dragEnd.bind(this);
    private _dragNodeHandler: any = this.dragNode.bind(this);
    private _dragRingHandler: any = this.dragRing.bind(this);

    private _editRelationshipHandler: any = this.editRelationship.bind(this);
    private _onUpdateActiveGraphHandler: any = this.onUpdateActiveGraph.bind(this);
    private _onRedrawGraphHandler: any = this.onRedrawGraph.bind(this);
    private _onRobotIntentHandler: any = this.onRobotIntent.bind(this);

    constructor(props: GraphEditorProps) {
        super(props);
        this.graphModel = new GraphModel();

        this.graphModel.on('ready', () => {
            console.log(`GraphEditor: constructor: ready`);
            this.graphModel.on('redrawGraph', this._onRedrawGraphHandler);
            this.graphModel.on('updateActiveGraph', this._onUpdateActiveGraphHandler);
        });

        this.graphModel.on('tts', (prompt: SavedTTS) => {
            console.log(`GraphEditor: on tts: `, prompt);
            this.props.commanderModel.sendTTS(prompt.prompt);
        })
    }

    componentWillMount() {
        thiz = this;
        this.setState({
            scale: 1.0,
            showNodePanel: false,
            showRelationshipPanel: false,
            showTTSPanel: false,
            showScriptPanel: false,
            showStateDataPanel: false,
            autoScroll: true,
            lastUpdateTime: 0
        });

        this.props.commanderModel.on('robotIntent', this._onRobotIntentHandler);
      }

    componentDidMount() {
        this.graphModel.addPanelWithId('ttsPanel', 520, 150);
        this.graphModel.addPanelWithId('scriptPanel', 520, 150);
        this.graphModel.addPanelWithId('stateDataPanel', 520, 150);
    }

    componentWillUnmount() {
        this.graphModel.removeListener('redrawGraph', this._onRedrawGraphHandler);
        this.graphModel.removeListener('updateActiveGraph', this._onUpdateActiveGraphHandler);
        this.props.commanderModel.removeListener('robotIntent', this._onRobotIntentHandler);
    }

    componentWillReceiveProps(nextProps: GraphEditorProps) {
    }

    initGraphEditor(): void {
        this.diagram = new Diagram()
            .scaling(null)
            .overlay(function(layoutModel: LayoutModel, view: any) {
                // fixes a null reference when dragging
                let svgElement: Selection<SVGSVGElement, any, HTMLElement, any> = select<SVGSVGElement, any>('svg');
                view = svgElement.select('g.layer.overlay');

                var nodeOverlays = view.selectAll("circle.node.overlay")
                    .data(layoutModel.nodes);

                nodeOverlays.exit().remove();

                var nodeOverlaysEnter = nodeOverlays.enter().append("circle")
                    .attr("class", "node overlay");

                var merge = nodeOverlays.merge(nodeOverlaysEnter);

                merge
                    .call(drag().on("start", thiz._dragStartHandler).on( "drag", thiz._dragNodeHandler ).on( "end", thiz._dragEndHandler ) )
                    .on("click", thiz._clickHandler)
                    .attr("r", function(node: LayoutNode) {
                        return node.radius.outside();
                    })
                    .attr("stroke", "none")
                    .attr("fill", "rgba(255, 255, 255, 0)")
                    .attr("cx", function(node: LayoutNode) {
                        let graphNode: Node = node.model as Node;
                        return graphNode.ex();
                    })
                    .attr("cy", function(node: LayoutNode) {
                        let graphNode: Node = node.model as Node;
                        return graphNode.ey();
                    });

                var nodeRings = view.selectAll("circle.node.ring")
                    .data(layoutModel.nodes);

                nodeRings.exit().remove();

                var nodeRingsEnter = nodeRings.enter().append("circle")
                    .attr("class", "node ring");

                var merge = nodeRings.merge(nodeRingsEnter);

                merge
                    .call(drag().on( "drag", thiz._dragRingHandler).on( "end", thiz._dragEndHandler ) )
                    .attr("r", function(node: LayoutNode) {
                        return node.radius.outside() + 5;
                    })
                    .attr("fill", "none")
                    .attr("stroke", "rgba(255, 255, 255, 0)")
                    .attr("stroke-width", "10px")
                    .attr("cx", function(node: LayoutNode) {
                        let graphNode: Node = node.model as Node;
                        return graphNode.ex();
                    })
                    .attr("cy", function(node: LayoutNode) {
                        let graphNode: Node = node.model as Node;
                        return graphNode.ey();
                    });

                var relationshipsOverlays = view.selectAll("path.relationship.overlay")
                    .data(layoutModel.relationships);

                relationshipsOverlays.exit().remove();

                var relationshipsOverlaysEnter = relationshipsOverlays.enter().append("path")
                    .attr("class", "relationship overlay");

                var merge = relationshipsOverlays.merge(relationshipsOverlaysEnter);

                merge
                    .attr("fill", "rgba(255, 255, 255, 0)")
                    .attr("stroke", "rgba(255, 255, 255, 0)")
                    .attr("stroke-width", "10px")
                    .on( "dblclick", thiz._editRelationshipHandler)
                    .attr("transform", function(r: any) {
                        var angle = r.start.model.angleTo(r.end.model);
                        return "translate(" + r.start.model.ex() + "," + r.start.model.ey() + ") rotate(" + angle + ")";
                    } )
                    .attr("d", function(d: any) { return d.arrow.outline; } );
            });
        this.draw();

        // let showTTSPanel: boolean = true;
        // this.startSimulation();
        this.setState({
                scale: 1.0,
                showNodePanel: false,
                showRelationshipPanel: false
        });
    }

    onUpdateActiveGraph(): void {
        this.setupSvg();
        this.initGraphEditor();
    }

    onRedrawGraph(): void {
        this.draw();
    }

    /** called with NLU results in response to an ask node **/
    onRobotIntent(robotIntent: RobotIntent): void {

        /** parse NLU results **/
        let robot: Robot = robotIntent.robot;
        let intentType: RobotIntentType = robotIntent.type;
        let intentData: RobotIntentData = robotIntent.data;
        let nluData: any = intentData.nluData;
        console.log(`GraphEditor: onRobotIntent: ${RobotIntentType[intentType]}`, robot, intentData);
        console.log(`  --: activeNode: `, this.graphModel.activeNode);
        if (robot) {
            this.graphModel.activeRobot = robot;
        }

        /** update robot state with NLU results **/
        if (robot && nluData && nluData.parameters) {
            console.log(`GraphEditor: onRobotIntent: updating robot state data:`, nluData.parameters);
            robot.updateStateData(nluData.parameters);
            console.log(robot.stateData);
        }

        /** auto execute **/
        let activeNode: Node | undefined = this.graphModel.activeNode;
        if (activeNode && intentData && robot) {
            let model: Model = activeNode.model;
            let nextNodeList: Node[] = [];
            switch (intentType) {
                case RobotIntentType.LAUNCH:
                    let nodes: Node[] = model.nodeList();
                    let launchNodeList: Node[] = [];
                    nodes.forEach((node: Node) => {
                        if (node.label == 'launch') {
                            launchNodeList.push(node);
                        }
                    });
                    launchNodeList.forEach((launchNode: Node) => {
                        let candidateNodes: Node[] = this.getCandidateNodes(launchNode, intentData.intent);
                        nextNodeList = nextNodeList.concat(candidateNodes);
                    });
                    break;
                case RobotIntentType.LISTEN:
                    nextNodeList = this.getCandidateNodes(activeNode, intentData.intent);
                    break;
                case RobotIntentType.ACTION_COMPLETE:
                    nextNodeList = this.getCandidateNodes(activeNode, intentData.intent);
                    break;
            }
            let nextNode: Node = nextNodeList[0];
            if (nextNode) {
                this.executeNode(nextNode, this.graphModel.activeRobot);
            }
        }
    }

    getCandidateNodes(activeNode: Node | undefined, relationshipType: string): Node[] {
        let nodes: Node[] = [];
        if (activeNode) {
            let model: Model = activeNode.model;
            let relationships: Relationship[];
            relationships = model.relationshipList();
            relationships.forEach((relationship: Relationship) => {
                if (relationship.start == activeNode) {
                    if (relationship.relationshipType == relationshipType) {
                        console.log(`queuing next node: ${relationship.end.label}`, relationship.end);
                        nodes.push(relationship.end);
                    }
                }
            });
        }
        return  nodes;
    }

    addNode() {
        this.graphModel.addNode();
    }

    clicked(__data__: any, i: number) {
        if (event.defaultPrevented) return; // dragged
        // console.log(`clicked: `, __data__, i);
        var layoutNode: LayoutNode = __data__ as LayoutNode;
        var graphNode: Node = layoutNode.model as Node;
        if (event.shiftKey) {
            this.editNode(graphNode);
        } else {
            this.executeNode(graphNode, this.graphModel.activeRobot);
        }
    }

    // bound to this via _dragStartHandler
    dragStart(__data__: any) {
        // console.log(`dragStart: `, __data__);
        this.graphModel.newNode = undefined;
    }

    dragNode(__data__: any)
    {
        var layoutNode: LayoutNode = __data__ as LayoutNode;
        var graphNode: Node = layoutNode.model as Node;
        graphNode.drag(event.dx, event.dy);
        this.draw();
    }

    dragRing(__data__: any)
    {
        this.graphModel.onDragRing(__data__, event);
        this.draw();
    }

    // bound to this via _dragEndHandler
    dragEnd()
    {
        this.graphModel.onDragEnd();
        this.draw();
    }

    editNode(node: Node)
    {
        this.showNodePanel();
        this.graphModel.activeNode = node;
    }

    executeNode(node: Node, robot?: Robot)
    {
        console.log(node);

        /** AutoScroll **/
        this.graphModel.activeNode = node;
        let model: Model = node.model;
        let relationships: Relationship[];
        let childCoordinatesList: any[] = [];
        relationships = model.relationshipList();
        relationships.forEach((relationship: Relationship) => {
            if (relationship.start == node) {
                console.log(`nextNode: ${relationship.end.label}: (${relationship.end.x}, ${relationship.end.y})`);
                childCoordinatesList.push({x:relationship.end.x, y:relationship.end.y})
            }
        });
        if (this.state.autoScroll && svg) {
            let svgtemp: any = svg;
            let svgTransform: any = d3Zoom.zoomTransform(svgtemp);
            if (childCoordinatesList.length) {
                let sum: any = childCoordinatesList.reduce((a: any, b: any) => ({x: a.x + b.x, y: a.y + b.y}));
                console.log(sum);
                let xavg: number = sum.x / childCoordinatesList.length;
                let yavg: number = sum.y / childCoordinatesList.length;
                // svgTransform.k = svgTransform.k + Math.random() * 0.001;
                svgTransform.x = this.graphModel.appDimensions.width / 2 - xavg;
                svgTransform.y = this.graphModel.appDimensions.height / 2 - yavg;
                console.log(svgTransform);
                //svg.transition().duration(750).call(zoomer.transform, trx);
                let svgAny: any = svg as any;
                svgAny.transition().duration(750).call(zoomer.translateTo, this.graphModel.appDimensions.width / 2, this.graphModel.appDimensions.height / 2);
                // zoomer.scaleBy(svg.transition().duration(750), 1.3);
            }
        }

        /** execution **/
        if (node) {

            /** script execution **/
            // if the node has a valid scriptName property, execute that script
            // if the node has a valid scriptContext property, execute the script using that data as context
            // otherwise execute the script using the active robot's stateData as context ()
            let scriptName: string = node.properties.has('scriptName');
            let scriptContext: any = node.properties.has('scriptContext');
            let scriptData: any;
            if (scriptContext) {
                try {
                    scriptData = jsonic(scriptContext);
                } catch (err) {
                    console.log(`GraphEditor: executeNode: error: `, err);
                }
            }
            let scriptOutput: any;
            if (scriptName) {
                if (scriptData) {
                    scriptOutput = this.graphModel.executeScriptWithName(scriptName, undefined, scriptData);
                } else {
                    scriptOutput = this.graphModel.executeScriptWithName(scriptName, robot);
                }
                console.log(`GraphEditor: executeNode: scriptOutput: `, scriptOutput);
            }

            /** excute the robotCommand specified by the node **/
            // if the scriptOutput contains a robotCommand property, send that command to the robot
            let robotCommand: string = node.properties.has('robotCommand');
            if (!robotCommand && scriptOutput && scriptOutput.sandbox && scriptOutput.sandbox.robotCommand) {
                robotCommand = scriptOutput.sandbox.robotCommand;
            }
            console.log(`robotCommand: robotCommand: `, robotCommand);
            if (robotCommand) {
                let command: any;
                try {
                    command = jsonic(robotCommand);
                    if (command.type && command.data) {
                        console.log(`robotCommand: sending: `, command);
                        this.props.commanderModel.sendRomCommandWithData(command, robot);
                    }
                } catch (err) {
                    console.log(err);
                }
            }

            /** parse the node's properties and send the specified command **/
            switch (node.label) {
                case 'tts':
                case 'esml':
                    var prompt: string = (node.properties.has('text') || node.properties.has('prompt') || node.properties.has('esml'));
                    prompt = this.graphModel.evaluateTTS(prompt, robot);
                    if (prompt) {
                        this.props.commanderModel.sendTTS(prompt, robot);
                    }
                    break;
                case 'ask':
                var prompt: string = (node.properties.has('text') || node.properties.has('prompt') || node.properties.has('esml'));
                    prompt = this.graphModel.evaluateTTS(prompt, robot);
                    var context: string = node.properties.has('context');
                    var contexts: string[] = [];
                    if (context) {
                        contexts= [ context ];
                    }
                    var nluType: string =  node.properties.has('nluType');
                    if (prompt) {
                        this.props.commanderModel.sendAsk(prompt, contexts, nluType, robot);
                    }
                    break;
                case 'lookAt':
                    var angleProperty: string = node.properties.has('angle');
                    var vectorProperty: string = node.properties.has('vector');
                    var angle;
                    var vector;
                    if (angleProperty) {
                        angle = Number(angleProperty);
                        this.props.commanderModel.sendLookAt({angle: angle}, robot);
                    } else if (vectorProperty) {
                        try {
                            vector = jsonic(vectorProperty);
                            this.props.commanderModel.sendLookAt({vector: vector}, robot);
                        } catch (err) {
                            console.log(`executeNode: error parsing vectorProperty`);
                        }
                    }
                    break;
                case 'volume':
                    var volume: number = Number(node.properties.has('volume'));
                    if (volume) {
                        this.props.commanderModel.sendRomCommandWithData({type: 'volume', data: {volume: volume}}, robot);
                    }
                    break;
                case 'attention':
                    var state: number = Number(node.properties.has('state'));
                    if (state) {
                        this.props.commanderModel.sendRomCommandWithData({type: 'attention', data: {state: state}}, robot);
                    }
                    break;
                case 'image':
                    var url: string = node.properties.has('url');
                    var name: string = node.properties.has('name') || 'image';
                    if (url) {
                        this.props.commanderModel.sendRomCommandWithData({type: 'image', data: {url: url, name: name}}, robot);
                    }
                    break;
                case 'eye':
                    this.props.commanderModel.sendRomCommandWithData({type: 'eye', data: {}}, robot);
                    break;
            }

        }
    }

    editRelationship(__data__: any)
    {
        this.showRelationshipPanel();
        this.graphModel.activeRelationship = __data__.model as Relationship;
    }

    setupSvg() {
      if (svg) {
        select("svg").remove();
        svg = undefined;
        svg_g = undefined;
      }

      svgContainer = select("#svgContainer")

      svg = svgContainer.append("svg:svg");
      if (svg) {
          zoomer = d3Zoom.zoom();
          let svgtemp: any = svg;
          let svgTransform: any = d3Zoom.zoomTransform(svgtemp);
          svgTransform.k = 1;
          svgTransform.x = 0;
          svgTransform.y = 0;
          svg_g = svg
             .attr("class", "graphdiagram")
             .attr("id", "svgElement")
             .attr("width", "100%")
             .attr("height", "100%")
             .call(zoomer.on("zoom", function () {
                 if (svg_g) {
                     svg_g.attr("transform", event.transform);
                 }
             }))
             .on("dblclick.zoom", null)
             .append("g")
      }


      var svgElement = document.getElementById('svgElement');

      let x: number = svgElement ? svgElement.clientWidth / 2 : this.graphModel.appDimensions.width / 2;
      let y: number = svgElement ? svgElement.clientHeight / 2 : this.graphModel.appDimensions.height / 2;

      var w = 10,
      h = 10,
      s = '#999999',
      so = 0.5,
      sw = '1px';

      if (svg_g) {
          svg_g.append('line')
              .attr('x1', x - w / 2)
              .attr('y1', y)
              .attr('x2', x + w / 2)
              .attr('y2', y)
              .style('stroke', s)
              .style('stroke-opacity', so)
              .style('stroke-width', sw);

          svg_g.append('line')
              .attr('x1', x)
              .attr('y1', y - h / 2)
              .attr('x2', x)
              .attr('y2', y + h / 2)
              .style('stroke', s)
              .style('stroke-opacity', so)
              .style('stroke-width', sw);
      }
    }

    generateSimData(diagram: Diagram): any {
        let layoutNodes: LayoutNode[] = diagram.layout.layoutModel.nodes;
        let layoutRelationships: LayoutRelationship[] = diagram.layout.layoutModel.relationships;

        let nodes: any[] = [];
        let links: any[] = [];
        let nodeDictionary: any = {};
        let nodeIndex: number = 0;

        layoutNodes.forEach((layoutNode: LayoutNode) => {
            let node: any = {};
            node.layoutNode = layoutNode;
            node.r = layoutNode.radius.insideRadius * 2;
            nodeDictionary[layoutNode.model.id] = nodeIndex++;
            nodes.push(node);
        });

        layoutRelationships.forEach((layoutRelationship: LayoutRelationship) => {
            let link: any = {};
            link.layoutRelationship = layoutRelationship;
            link.source = nodeDictionary[layoutRelationship.start.model.id];
            link.target = nodeDictionary[layoutRelationship.end.model.id];
            links.push(link);
        });

        return {
            nodes: nodes,
            links: links
        }
    }

    startSimulation(ticks?: number): void {
        simulationTickCount = 0;
        simulationMaxTicks = ticks || 100;
        // console.log(`startSimulation:`);
        var svgElement = document.getElementById('svgElement');
        let width: number = svgElement ? svgElement.clientWidth / 2 : this.graphModel.appDimensions.width / 2;
        let height: number = svgElement ? svgElement.clientHeight / 2 : this.graphModel.appDimensions.height / 2;

        // https://bl.ocks.org/wnghdcjfe/c2b04ee8430afa32ce76596daa4d8123
        simulation = d3Force.forceSimulation()
            .force("link", d3Force.forceLink().id(function(d: any) { return d.index })) //.distance((d:any) => {return  d.source.r + d.target.r + 45}).strength(1))
            .force("collide",d3Force.forceCollide( function(d: any){return d.r + 25 }))
            .force("charge", d3Force.forceManyBody()) //.strength(-5000).distanceMin(500).distanceMax(2000))
            .force("center", d3Force.forceCenter(width, height))
            .force("y", d3Force.forceY(0.001))
            .force("x", d3Force.forceX(0.001))

        // from neo4j-browser
        // linkDistance = 45
        // d3force = d3.layout.force()
        // .linkDistance((relationship) -> relationship.source.radius + relationship.target.radius + linkDistance)
        // .charge(-1000)

        if (thiz.diagram) {
            simData = thiz.generateSimData(thiz.diagram);
        }

        if (svg_g) {
            simNodes = svg_g.select( "g.layer.nodes" )
                .selectAll("circle")
                .data(simData.nodes)

            svg_g.select( "g.layer.node_properties" )
                .attr( "display", "none");
            svg_g.select( "g.layer.relationships" )
                .attr( "display", "none");
            svg_g.select( "g.layer.relationship_properties" )
                .attr( "display", "none");
            svg_g.select( "g.layer.nodes" ).selectAll( "g.caption")
                .attr( "display", "none");
        }

        simulation
            .nodes(simData.nodes)
            .on("tick", thiz.ticked)
            .on("end", thiz.ended);

        simulation.force("link")
            .links(simData.links);
    }

    ticked() {
        simNodes
            .attr("cx", function(d: any) { return d.x; })
            .attr("cy", function(d: any) { return d.y; });

        simulationTickCount++
        if (simulationTickCount >= simulationMaxTicks) {
            thiz.ended();
        }
    }

    ended() {
        simulation.stop();
        simData.nodes.forEach((node: any) => {
            node.layoutNode.x = node.x;
            node.layoutNode.y = node.y;
            node.layoutNode.model.x = node.x;
            node.layoutNode.model.y = node.y;
        });
        if (svg_g) {
            svg_g.select( "g.layer.node_properties" )
                .attr( "display", "block");
            svg_g.select( "g.layer.relationships" )
                .attr( "display", "block");
            svg_g.select( "g.layer.relationship_properties" )
                .attr( "display", "block");
            svg_g.select( "g.layer.nodes" ).selectAll( "g.caption")
                .attr( "display", "block");
        }
        thiz.draw();
    }

    draw()
    {
        if (this.diagram && svg_g) {
            svg_g
                .data([this.graphModel.graphDiagramModel])
                .call(this.diagram.render);
        }
    }

    onButtonClicked(action: string): void {
        switch (action) {
            case 'addNode':
                this.addNode();
                break;
            case 'bubbles':
                if (this.diagram) {
                    this.diagram.toggleRenderPropertyBubblesFlag();
                    this.draw();
                }
                break;
            case 'forceLayout':
                this.startSimulation(100);
                break;
            case 'ttsPanel':
                this.setState({showTTSPanel: this.graphModel.togglePanelOpenedWithId('ttsPanel')});
                this.graphModel.bringPanelToFront('ttsPanel');
                break;
            case 'scriptPanel':
                this.setState({showScriptPanel: this.graphModel.togglePanelOpenedWithId('scriptPanel')});
                this.graphModel.bringPanelToFront('scriptPanel');
                break;
            case 'stateDataPanel':
                this.setState({showStateDataPanel: this.graphModel.togglePanelOpenedWithId('stateDataPanel')});
                this.graphModel.bringPanelToFront('stateDataPanel');
                break;
        }
    }

    handleCheckboxChange(event: any): void {
        this.setState(prevState => ({autoScroll: !prevState.autoScroll}));
    }

    changeInternalScale() {
        var temp: any = select("#internalScale").node();
        if (this.graphModel.graphDiagramModel) {
            this.graphModel.graphDiagramModel.internalScale = temp.value;
            this.setState({
                scale: temp.value
            });
            this.draw();
        }
    }

    showNodePanel(): void {
        this.setState({
            showNodePanel: true
        });
        this.graphModel.openPanelWithId('nodeEditorPanel');
        this.graphModel.bringPanelToFront('nodeEditorPanel');
    }

    showRelationshipPanel(): void {
        this.setState({
            showRelationshipPanel: true
        });
        this.graphModel.openPanelWithId('relationshipEditorPanel');
        this.graphModel.bringPanelToFront('relationshipEditorPanel');
    }

    onClosePanel(id: string): void {
        this.graphModel.closePanelWithId(id);
        switch(id) {
            case 'nodeEditorPanel':
                this.setState({showNodePanel: false});
                break;
            case 'relationshipEditorPanel':
                this.setState({showRelationshipPanel: false});
                break;
            case 'ttsPanel':
                this.setState({showTTSPanel: false});
                break;
            case 'scriptPanel':
                this.setState({showScriptPanel: false});
                break;
            case 'stateDataPanel':
                this.setState({showStateDataPanel: false});
                break;
        }
    }

    render() {
        let nodePanel: JSX.Element | null = this.state.showNodePanel ? <NodePanel id='nodeEditorPanel' graphModel={this.graphModel} onClosePanel={this.onClosePanel.bind(this)}/> : null;
        let relationshipPanel: JSX.Element | null = this.state.showRelationshipPanel ? <RelationshipPanel id='relationshipEditorPanel' graphModel={this.graphModel} onClosePanel={this.onClosePanel.bind(this)}/> : null;
        let ttsPanel: JSX.Element | null = this.state.showTTSPanel ? <TTSPanel id='ttsPanel' graphModel={this.graphModel} onClosePanel={this.onClosePanel.bind(this)}/> : null;
        let scriptPanel: JSX.Element | null = this.state.showScriptPanel ? <ScriptPanel id='scriptPanel' graphModel={this.graphModel} onClosePanel={this.onClosePanel.bind(this)}/> : null;
        let stateDataPanel: JSX.Element | null = this.state.showStateDataPanel ? <StateDataPanel id='stateDataPanel' graphModel={this.graphModel} targetedRobots={this.props.commanderModel.targetedRobots} onClosePanel={this.onClosePanel.bind(this)}/> : null;
        // <input id="internalScale" type="range" min="0.1" max="5" value={this.state.scale} step="0.01" onChange={this.changeInternalScale.bind(this)}/>
        // <ReactBootstrap.Button id="forceLayoutButton" bsStyle={'default'} key={"forceLayout"} style = {{width: 80}}
        //     onClick={this.onButtonClicked.bind(this, "forceLayout")}>Force</ReactBootstrap.Button>

        return (
            <div id="graphEditorContainer">
                <div id="svgContainer"></div>
                <div id="graphEditorButtons" className="well">
                    <ReactBootstrap.Button id="addNodeButton" bsStyle={'default'} key={"addNode"} style = {{width: 80}}
                        onClick={this.onButtonClicked.bind(this, "addNode")}><FontAwesome name='plus'/> Node</ReactBootstrap.Button>
                    <ReactBootstrap.Button id="bubblesButton" bsStyle={'default'} key={"bubbles"} style = {{width: 80}}
                        onClick={this.onButtonClicked.bind(this, "bubbles")}>Bubbles</ReactBootstrap.Button>
                    <ReactBootstrap.Button id="ttsPanelButton" bsStyle={'default'} key={"ttsPanel"}
                        onClick={this.onButtonClicked.bind(this, "ttsPanel")}>SavedTTS</ReactBootstrap.Button>
                    <ReactBootstrap.Button id="scriptPanelButton" bsStyle={'default'} key={"scriptPanel"}
                        onClick={this.onButtonClicked.bind(this, "scriptPanel")}>Scripts</ReactBootstrap.Button>
                    <ReactBootstrap.Button id="stateDataPanelButton" bsStyle={'default'} key={"stateDataPanel"}
                        onClick={this.onButtonClicked.bind(this, "stateDataPanel")}>State</ReactBootstrap.Button>
                    <Checkbox label={'AutoScroll'} isChecked={true} handleCheckboxChange={this.handleCheckboxChange.bind(this)}/>
                </div>
                <ToolsPanel graphModel={this.graphModel} />
                {nodePanel}
                {ttsPanel}
                {scriptPanel}
                {stateDataPanel}
                {relationshipPanel}
            </div>
        );
    }
}
