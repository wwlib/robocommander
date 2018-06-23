import {
    d3Types
} from 'graph-diagram';

import GraphConfig from './GraphConfig';
import ScriptConfig from './ScriptConfig';

export type GraphData = {
    name: string;
    scale: number
    css: string;
    config: GraphConfig;
    scriptConfig: ScriptConfig;
    d3Graph: d3Types.d3Graph;
    markup?: string;
    dot?: string
}

export default class Graph {

    public static DEFAULT_QUERY: string = "";
    public static DEFAULT_TYPE: string = "file";

    public name: string = '';
    // public connection: GraphConnection;
    public scale: number = 1.0;
    public css: string = '';
    public config: GraphConfig = new GraphConfig();
    public scriptConfig: ScriptConfig = new ScriptConfig();
    public d3Graph: d3Types.d3Graph | undefined;
    public markup: string = '';
    public dot: string = '';

    constructor() {
    }

    initWithJson(json: any): Graph {
      this.name = json.name || '<filename>';
      this.config = new GraphConfig(json.config);
      this.scriptConfig = new ScriptConfig(json.scriptConfig);
      this.scale = json.scale || 1.0;
      this.css = json.css || `
      circle.node-base {
         fill: #D0E5F2;
         stroke: #25C086;
         stroke-width: 3px;
      }
       text.caption {
         fill: #2D5083;
      }
       body {
         background-color: lightgrey;
      }
       circle.node-type-video {
         fill: #FADBD0;
         stroke: #E53D00;
         stroke-width: 3px;
      }
       circle.node-type-ask {
         fill: #FADBD0;
         stroke: #E53D00;
         stroke-width: 3px;
      }
       circle.node-type-imageCancel {
         fill: #FCF1D0;
         stroke: #F0B500;
         stroke-width: 3px;
      }
       circle.node-type-image {
         fill: #FCF1D0;
         stroke: #F0B500;
      }
       circle.node-type-launch {
         fill: #FCF1D0;
         stroke: #F0B500;
      }
       circle.node-type-tts {
         fill: #D0E5F2;
         stroke: #0072BC;
         stroke-width: 3px;
      }
       circle.node-type-nav {
         fill: #D7F3E9;
         stroke: #25C086;
         stroke-width: 3px;
      }
       circle.node.overlay:hover {
         fill: rgba(150, 150, 255, 0.5);
      }
       circle.node.ring:hover {
         stroke: rgba(150, 150, 255, 0.5);
      }
       path.relationship.overlay:hover {
         fill: rgba(150, 150, 255, 0.5);
         stroke: rgba(150, 150, 255, 0.5);
     }
`;
      this.d3Graph = json.d3Graph;
      this.markup = json.markup;
      this.dot = json.dot;

      return this;
    }

    toJSON(): any {
        let json: any = {};
        json.name = this.name;
        json.type = Graph.DEFAULT_TYPE;
        json.scale = this.scale || 1.0
        json.css = this.css;
        json.config = this.config;
        json.scriptConfig = this.scriptConfig;
        json.d3Graph =  this.d3Graph;
        json.markup = this.markup;
        json.dot = this.dot;

        return json;
    }

    get type() {
        return Graph.DEFAULT_TYPE;
    }
}
