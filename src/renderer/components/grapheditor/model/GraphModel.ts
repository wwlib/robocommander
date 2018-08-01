const pd = require('pretty-data').pd;

import {
    select
} from 'd3-selection';

import { EventEmitter } from "events";
import AppSettings from './AppSettings';
import GraphSet from './GraphSet';
import Graph from './Graph';

import {
  Model,
  ModelToD3,
  Markup,
  Node,
  Relationship
} from 'graph-diagram';

import GraphConfig, { SavedTTS } from './GraphConfig';
import ScriptConfig, { SavedScript } from './ScriptConfig';
import ModelToDot from './ModelToDot';
import WindowComponent from './WindowComponent';

import Robot from '../../../model/Robot';

const vm = require('vm');

export default class GraphModel extends EventEmitter {

    public settings: AppSettings;
    public appSettingsData: any;
    public userDataPath: string = '';
    public graphSet: GraphSet | undefined;
    public graphDiagramModel: Model | undefined;
    public activeGraph: Graph | undefined;
    public appDimensions: {width: number, height: number} = {width: 1280, height:720}

    private _activeNode: Node | undefined;
    private _activeRelationship: Relationship  | undefined;
    private _newNode: Node | undefined;
    private _newRelationship: Relationship | undefined;
    private _globalStateData: any = {global: true, robot: undefined};

    constructor() {
        super();
        this.settings = new AppSettings();
        this.userDataPath = this.settings.userDataPath;
        this.settings.load((err: any, obj: any) => {
            if (err || !this.settings.data) {
                this.settings.data = {
                }
                console.log(`GraphModel: Settings not found. Using default.`, this.settings.data);
                this.initWithData(this.settings.data);
                this.saveSettings();
            } else {
                this.initWithData(this.settings.data);
            }

            this.graphSet = new GraphSet(this);
            this.graphSet.loadGraphNames()
                .then(() => {
                //    this.initGraphWithName('example-file'); //this.graphSet.getGraphNames()[1]);
                   this.emit('ready', this);
                   this.newBlankGraph();
                });
        });
    }

    parseMarkup( markup: any )
    {
        var container: any = select( "body" ).append( "div" );
        container.node().innerHTML = markup;
        var model = Markup.parse( container.select("ul.graph-diagram-markup"));
        container.remove();
        return model;
    }

    newBlankGraph(name?: string): void {
        let svgElement = document.getElementById('svgElement');
        let x: number = svgElement ? svgElement.clientWidth / 2 : this.appDimensions.width / 2;
        let y: number = svgElement ? svgElement.clientHeight / 2 : this.appDimensions.height / 2;
        let options: any = {name: name};
        let newGraph: Graph = new Graph().initWithJson(options);
        this.graphDiagramModel = new Model();
        let node: Node = this.graphDiagramModel.createNode();
        node.x = x;
        node.y = y;
        node.caption = 'New Node';
        this._activeNode = this.graphDiagramModel.nodeList()[0];
        this._activeRelationship = undefined;
        this.activeGraph = newGraph;
        this.applyActiveGraphCss();
        this.onUpdateActiveGraph();

        if (name && this.graphSet) {
            this.graphSet.addGraph(newGraph);
            this.initGraph(newGraph);
            this.saveGraph(newGraph);
        }
    }

    newGraphWithOptions(options: any): void {
        console.log(`newGraphWithOptions: `, options);
        let newGraph: Graph = new Graph().initWithJson(options);
        if (this.graphSet) {
            this.graphSet.addGraph(newGraph);
            this.initGraph(newGraph);
            this.saveGraph(newGraph);
        }
    }

    initGraphWithName(name: string) {
        // console.log(`initGraphWithName: ${name}`);
        if (this.graphSet) {
            this.graphSet.loadGraphWithName(name)
                .then((graph:Graph) => {
                    this.initGraph(graph);
                });
        }

    }

    initGraphWithPath(path: string): Promise<Graph> {
        return new Promise<Graph>((resolve, reject) => {
            console.log(`initGraphWithPath: ${path}`);
            if (this.graphSet) {
                this.graphSet.loadGraphWithPath(path)
                    .then((graph:Graph) => {
                        this.initGraph(graph);
                        resolve(graph);
                    })
                    .catch((err: any) => {
                        reject(err);
                    });
            }
        });
    }

    getSvgOrigin(): any {
        let svgElement = document.getElementById('svgElement');
        let x: number = svgElement ? svgElement.clientWidth / 2 : this.appDimensions.width / 2;
        let y: number = svgElement ? svgElement.clientHeight / 2 : this.appDimensions.height / 2;
        return { x: x, y: y };
    }

    initGraph(graph: Graph): void {
        switch(graph.type) {
            case "file":
                if (graph.d3Graph) {
                    this.graphDiagramModel = ModelToD3.parseD3(graph.d3Graph, undefined, this.getSvgOrigin());
                } else if (graph.markup) {
                    this.graphDiagramModel = this.parseMarkup(graph.markup);
                } else if (graph.dot) {
                    this.graphDiagramModel = ModelToDot.parseDot(graph.dot, undefined, this.getSvgOrigin());
                }
                if (this.graphDiagramModel) {
                    this._activeNode = this.graphDiagramModel.nodeList()[0];
                    this._activeRelationship = this.graphDiagramModel.relationshipList()[0];
                }
                this.activeGraph = graph;
                this.applyActiveGraphCss();
                this.onUpdateActiveGraph();
                break;
        }
    }

    saveActiveNode(label: string, propertiesText: any, oldLabel?: string): void {
        console.log(`GraphModel: saveActiveNode: `, label, propertiesText, oldLabel, this.activeGraph);
        if (this._activeNode) {
            this._activeNode.caption = label;
            this._activeNode.properties.clearAll();
            propertiesText.split("\n").forEach((line: string) => {
                let tokens = line.split(/: +/);
                if (tokens.length === 2) {
                    var key = tokens[0].trim();
                    var value = tokens[1].trim();
                    if (key.length > 0 && value.length > 0) {
                        if (this._activeNode) {
                            this._activeNode.properties.set(key, value);
                        }
                    }
                }
            });
        }
    }

    saveActiveRelationship(label: string, propertiesText: any): void {
        if (this._activeRelationship) {
            this._activeRelationship.relationshipType = label;
            this._activeRelationship.properties.clearAll();
            propertiesText.split("\n").forEach((line: string) => {
                let tokens = line.split(/: */);
                if (tokens.length === 2) {
                    var key = tokens[0].trim();
                    var value = tokens[1].trim();
                    if (this._activeRelationship) {
                        if (key.length > 0 && value.length > 0) {
                            this._activeRelationship.properties.set(key, value);
                        }
                    }
                }
            });
        }
    }

    reverseActiveRelationship(): void {
        if (this._activeRelationship && this.activeGraph) {
                this._activeRelationship.reverse();
                this.onRedraw();
        }
    }

    onUpdateActiveGraph(event?: any): void {
        this.emit('updateActiveGraph');
    }

    onUpdateActiveNode(event?: any): void {
        let data: any = {
            label: this.getActiveNodeLabel(),
            properties: this.getActiveNodePropertiesAsText()
        }
        this.emit('updateActiveNode', data);
    }

    onUpdateActiveRelationship(event?: any): void {
        let data: any = {
            label: this.getActiveRelationshipLabel(),
            properties: this.getActiveRelationshipPropertiesAsText()
        }
        this.emit('updateActiveRelationship', data);
    }

    onRedraw(): void {
        this.emit('redrawGraph', this);
    }

    initWithData(data: any): void {
        this.appSettingsData = data;
    }

    get json(): any {
        return this.appSettingsData;
    }

    saveSettings(): void {
        this.settings.data = this.json;
        this.settings.save((err: any) => {
            if (err) {
                console.log(`GraphModel: Error saving settings: `, err);
            } else {
                console.log(`GraphModel: Settings saved.`)
            }
        });
    }

    getMarkup(): string {
        var container: any = select( "body" ).append( "div" );
        var markup: string = '';
        if (this.graphDiagramModel) {
            Markup.format( this.graphDiagramModel, container );
            markup= container.node().innerHTML;
            markup = markup
                .replace( /<li/g, "\n  <li" )
                .replace( /<span/g, "\n    <span" )
                .replace( /<\/span><\/li/g, "</span>\n  </li" )
                .replace( /<\/ul/, "\n</ul" );
            container.remove();
        }
        return markup;
    }

    getD3(): string {
        return this.graphDiagramModel ? JSON.stringify(ModelToD3.convert(this.graphDiagramModel), null, 2) : '';
    }

    getSVG(): string {
        let svg: any = select("#svgContainer svg");
        svg.select("g")
            .attr("id", "firstg")
        let style = svg.select("#firststyle")
        if (style.empty()) {
            style = svg.insert("style", "#firstg")
                .attr("id", "firststyle");
        }
        style.html(this.getCSS());

        let xml: any = select("#svgContainer svg").node();
        let rawSvg: any = new XMLSerializer().serializeToString(xml);
        let xml_pp = pd.xml(rawSvg);
        return xml_pp;
    }

    getCSS(): string {
        let styleData = this.activeGraph ? this.activeGraph.css : '';
        // styleData = `/* <![CDATA[ */\n${styleData}\n/* ]]> */`;
        let css_pp = pd.css(styleData)
        return css_pp;
    }

    //// Saved TTS

    getSavedTTSList(): any[] {
        // console.log(`getSavedTTSList: `, this.activeGraph);
        let result: any[] = [];
        if (this.activeGraph) {
            let graphConfig: GraphConfig = this.activeGraph.config;
            result = graphConfig.savedTTSToArray();
        }
        return result;
    }

    newSavedTTS(): number {
        let result: number = 0;
        if (this.activeGraph) {
            let graphConfig: GraphConfig = this.activeGraph.config;
            result = graphConfig.addSavedTTS('<prompt name>', '<prompt>');
        }
        return result;
    }

    deleteSavedTTS(savedTTS: SavedTTS): number {
        if (this.activeGraph) {
            let graphConfig: GraphConfig = this.activeGraph.config;
            graphConfig.deleteSavedTTSWithIndex(savedTTS.index);
        }
        return 0
    }

    sendTTS(activeTTS: SavedTTS): void {
        console.log(`GraphModel: sendTTS:`, activeTTS);
        this.emit('tts', activeTTS);
    }

    //// Saved Script

    getSavedScriptList(): any[] {
        // console.log(`getSavedScriptList: `, this.activeGraph);
        let result: any[] = [];
        if (this.activeGraph) {
            let scriptConfig: ScriptConfig = this.activeGraph.scriptConfig;
            result = scriptConfig.savedScriptToArray();
        }
        return result;
    }

    // getScriptWithName(name: string): string | undefined {
    //     let result: string | undefined = undefined;
    //     if (this.activeGraph) {
    //         let scriptConfig: ScriptConfig = this.activeGraph.scriptConfig;
    //         let savedScript: SavedScript | undefined = scriptConfig.getSavedScriptWithName(name);
    //         if (savedScript) {
    //             result = savedScript.script
    //         }
    //     }
    //     return result;
    // }

    newSavedScript(): number {
        let result: number = 0;
        if (this.activeGraph) {
            let scriptConfig: ScriptConfig = this.activeGraph.scriptConfig;
            result = scriptConfig.addSavedScript('<script name>', '<script>');
        }
        return result;
    }

    deleteSavedScript(savedScript: SavedScript): number {
        if (this.activeGraph) {
            let scriptConfig: ScriptConfig = this.activeGraph.scriptConfig;
            scriptConfig.deleteSavedScriptWithIndex(savedScript.index);
        }
        return 0
    }

    executeScriptWithName(scriptName: string, robot?: Robot): any {
        let result: any = undefined;
        if (this.activeGraph) {
            let scriptConfig: ScriptConfig = this.activeGraph.scriptConfig;
            console.log(`GraphModel: executeScriptWithName: scriptConfig:`, scriptConfig);
            let savedScript: SavedScript | undefined = scriptConfig.getSavedScriptWithName(scriptName);
            if (savedScript) {
                result = this.executeScript(savedScript, robot);
            } else {
                console.log(`executeScriptWithName: error: no script found with name: ${scriptName}`);
            }
        }
        return result;
    }

    executeScript(activeScript: SavedScript, robot?: Robot, data?: any): any {
        console.log(`GraphModel: executeScript:`, activeScript, robot, data);
        let output: any = undefined;
        if (robot) {
            output = this.evaluateScriptWithData(activeScript.script, robot.stateData);
        } else {
            if (!data) {
                data = this._globalStateData;
            }
            output = this.evaluateScriptWithData(activeScript.script, data);
        }
        console.log(`GraphModel: executeScript: output:`, output);
        return output;
    }

    evaluateTTS(prompt: string, robot?: Robot): string {
        let result: string = '';
        let script = '`' + prompt + '`';
        if (robot && robot.stateData) {
            result = this.evaluateScriptWithData(script, robot.stateData);
        } else {
            result = this.evaluateScriptWithData(script, this._globalStateData);
        }
        return result;
    }

    evaluateScriptWithData(scriptText: string, scriptData: any): string {
        let scriptDataSandbox:any;
        scriptDataSandbox = this.getSandbox(scriptData);

        // let script = '`' + scriptText + '`';
        //do a safe eval on the condition
        try {
            return vm.runInContext(scriptText, scriptDataSandbox);
        } catch (e) {
            console.log(`evaluateScriptWithData: error evaluating: ${scriptText}: ${scriptData} - error: ${e.message}`);
            return '';
        }
    }

    getSandbox(promptData:any): any {
        return vm.createContext(promptData);
    }

    deleteStateData(robot?: Robot): void {
        if (robot){
            robot.stateData = {};
        } else {
            this._globalStateData = {};
        }

    }

    saveStateData(robot: Robot | undefined, data: any): void {
        if (robot) {
            robot.stateData = data;
        } else {
            this._globalStateData = data;
        }
    }

    get globalStateData(): any {
        return this._globalStateData;
    }

    set activeNode(node: Node | undefined) {
        this._activeNode = node;
        this.onUpdateActiveNode();
    }

    get activeNode(): Node | undefined{
        return this._activeNode;
    }

    set newNode(node: Node | undefined) {
        this._newNode = node;
    }

    get newNode(): Node | undefined {
        return this._newNode;
    }

    onDragRing(__data__:any, event: any): void {
        var node: Node = __data__.model as Node;
        if ( !this._newNode )
        {
            this._newNode = this.addLocalNode(event.x, event.y);
            if (this._newNode) {
                this._newRelationship = this.addLocalRelationship( node, this._newNode );
            }
        }
        if (this._newNode && this._newRelationship) {
            var connectionNode = this.findClosestOverlappingNode( this._newNode );
            if ( connectionNode )
            {
                this._newRelationship.end = connectionNode
            } else
            {
                this._newRelationship.end = this._newNode;
            }
            this._newNode.drag(event.dx, event.dy);
        }
    }

    async onDragEnd() {
        // console.log(`GraphModel: onDragEnd`, this._newNode, this._newRelationship);
        if ( this._newNode && this._newRelationship && this.activeGraph)
        {
            this._newNode.dragEnd();
            if ( this._newRelationship && this._newRelationship.end !== this._newNode )
            {
                this.deleteLocalNode( this._newNode );
            }
        }

        this._newNode = undefined;
        this._newRelationship = undefined;
    }

    findClosestOverlappingNode( node: Node ): Node | undefined
    {
        var closestNode = undefined;
        var closestDistance = Number.MAX_VALUE;

        if (this.graphDiagramModel) {
            var allNodes = this.graphDiagramModel.nodeList();
            for ( var i = 0; i < allNodes.length; i++ )
            {
                var candidateNode = allNodes[i];
                if ( candidateNode !== node )
                {
                    var candidateDistance = node.distanceTo( candidateNode ) * this.graphDiagramModel.internalScale;
                    if ( candidateDistance < 50 && candidateDistance < closestDistance )
                    {
                        closestNode = candidateNode;
                        closestDistance = candidateDistance;
                    }
                }
            }
        }
        return closestNode;
    }

    set activeRelationship(relationship: Relationship | undefined) {
        this._activeRelationship = relationship;
        this.onUpdateActiveRelationship();
    }

    get activeRelationship(): Relationship | undefined {
        return this._activeRelationship;
    }

    set newRelationship(relationship: Relationship | undefined) {
        this._newRelationship = relationship;
    }

    get newRelationship(): Relationship | undefined {
        return this._newRelationship;
    }

    getActiveRelationshipLabel(): string {
        let label: string = '';
        if (this._activeRelationship && this._activeRelationship.relationshipType) {
            label = this._activeRelationship.relationshipType;
        }
        return label;
    }

    getActiveRelationshipPropertiesAsText(): string {
        let properties: string = '';
        if (this._activeRelationship) {
            if (this._activeRelationship.properties.listEditable().length > 0) {
                properties = this._activeRelationship.properties.listEditable().reduce(
                (previous: string, property: any) => {
                    return previous + property.key + ': ' + property.value + '\n';
                }, '');
            }
        }
        return properties;
    }

    getActiveNodeLabel(): string {
        return this._activeNode ? this._activeNode.caption : '';
    }

    getActiveNodePropertiesAsText(): string {
        let properties: string = "";
        if (this._activeNode && this._activeNode.properties.listEditable().length > 0) {
            properties = this._activeNode.properties.listEditable().reduce(
                (previous: string, property: any) => {
                    return previous + property.key + ": " + property.value + "\n";
                }, "");
        }
        return properties;
    }

    addLocalNode(x?: number, y?: number): Node  | undefined{
        var svgElement = document.getElementById('svgElement');
        if (svgElement && this.graphDiagramModel) {
            x = x || svgElement.clientWidth / 2;
            y = y || svgElement.clientHeight / 2;
            this._activeNode = this.graphDiagramModel.createNode();
            this._activeNode.x = x;
            this._activeNode.y = y;
            return this._activeNode;
        } else {
            return undefined
        }

    }

    addNode(x?: number, y?: number): Node | undefined {
        this._activeNode = this.addLocalNode(x, y);
        this.onRedraw();
        return this._activeNode;
    }

    addLocalRelationship(start: Node, end: Node): Relationship | undefined {
        let relationship: Relationship | undefined = undefined;
        if (this.graphDiagramModel && this.activeGraph) {
            relationship = this.graphDiagramModel.createRelationship(start, end);
        }
        return relationship;
    }

    deleteLocalNode(node: Node): void {
        if (this.graphDiagramModel) {
            this.graphDiagramModel.deleteNode(node);
            if (node == this._newNode) {
                this._newNode = undefined;
            }
        }
    }

    deleteActiveNode()
    {
        if (this._activeNode && this.activeGraph) {
                if (this.graphDiagramModel) {
                    this.graphDiagramModel.deleteNode(this._activeNode);
                    this.onRedraw();
                }
        }
    }

    deleteActiveRelationship()
    {
        if (this._activeRelationship && this.activeGraph) {
                if (this.graphDiagramModel) {
                    this.graphDiagramModel.deleteRelationship(this._activeRelationship);
                    this.onRedraw();
                }
        }
    }

    applyActiveGraphCss(css?: string): void {
        if (this.activeGraph) {
            this.activeGraph.css = css || this.activeGraph.css;
            let graphEditorStyleSheet = document.getElementById('graph-editor-style');
            if (graphEditorStyleSheet) {
                graphEditorStyleSheet.innerHTML = pd.css(this.activeGraph.css);
            }
        }
    }

    saveActiveGraph(): void {
        // console.log(`saveActiveGraph: `, this.activeGraph, this.graphDiagramModel);
        if (this.activeGraph) {
            this.saveGraph(this.activeGraph);
        }
    }

    saveGraph(graph: Graph): void {
        if (graph && this.graphDiagramModel && this.graphSet) {
            if (graph.type == "file") {
                graph.d3Graph = ModelToD3.convert(this.graphDiagramModel);
                // graph.markup = this.getMarkup();
            }
            this.graphSet.saveGraph(graph);
        }
    }

    // Window Management

    getPanelOpenedWithId(panelId: string): boolean {
        let result: boolean = false;
        let window: WindowComponent | undefined = WindowComponent.getWindowComponentWithId(panelId);
        if (window) {
            result = window.opened;
        }
        return result;
    }

    togglePanelOpenedWithId(panelId: string): boolean {
        let window: WindowComponent | undefined = WindowComponent.getWindowComponentWithId(panelId);
        if (!window) {
            return true; // open the panel if it is not yet instantiated
        } else {
            return window.toggleOpened();
        }
    }

    openPanelWithId(panelId: string): void {
        WindowComponent.openWithId(panelId);
    }

    closePanelWithId(panelId: string): void {
        WindowComponent.closeWithId(panelId);
    }

    bringPanelToFront(panelId: string): void {
        WindowComponent.addWindowWithId(panelId);
        WindowComponent.bringWindowToFrontWithId(panelId);
    }

    addPanelWithId(panelId: string, x: number = 0, y: number = 0, z: number = 0): void {
        WindowComponent.addWindowWithId(panelId, x, y, z);
    }

    dispose(): void {
    }
}
