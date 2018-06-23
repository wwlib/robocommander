import * as React from 'react';
import { render } from 'react-dom';
import Application from './components/Application';
import Model from './model/Model';

import 'font-awesome/css/font-awesome.min.css';
import '../../css/bootstrap.min.css';
import '../../css/bootstrap-theme.min';
import '../../css/robocommander.css';
import '../../css/graph-diagram.css';
import '../../css/graph-editor.css';
import '../../css/graph-style-bootstrap.css';

let model: Model = new Model();

let aHead = document.head;
console.log(`aHead: `, aHead);
let style = document.createElement('style');
style.id = `graph-editor-style`;
style.appendChild(document.createTextNode(`
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
`));
aHead.appendChild(style);

model.on('ready', () => {
    render(
        <Application model={model} />,
        document.getElementById('app')
    );
});

// if (module.hot) {
//   module.hot.accept('./containers/Root', () => {
//     const NextRoot = require('./containers/Root'); // eslint-disable-line global-require
//     render(
//       <AppContainer>
//         <NextRoot store={store} history={history} />
//       </AppContainer>,
//       document.getElementById('root')
//     );
//   });
// }
