## robocommander

![robocommander](docs/img/robocommander-logo.png)  

[https://wwlib.github.io/robocommander/](https://wwlib.github.io/robocommander/)

see also: [https://wwlib.github.io/robokit/](https://wwlib.github.io/robokit/)

[https://wwlib.github.io](https://wwlib.github.io/)

robocommander is a tool for controlling robots. Any robot that implements a command protocol via a socket or REST API can potentially be controlled by robocommander (with appropriate modifications). The current version can control [robokit](https://wwlib.github.io/robokit/) robots and [Jibo](https://jibo.com/) robots (dev credentials are required).

robocommander is ideal for real-time, human-operated Woz (Wizard of Oz) remote control. In addition, robocommander’s [WozGraph](./docs/wozgraph.md) panel provides a graph-based tool for designing and controlling scripted interactions. WozGraph layouts can incorporate simple automation using  JavaScript. [WozGraph](./docs/wozgraph.md) layouts can be configured to respond automatically to voice commands via integration with LUIS and/or Dialogflow NLU services.

For developers, robocommander includes TypeScript classes that provide an easy way to prototype NLU-driven Remote Operation Mode (ROM) skills.

### Docs

[https://wwlib.github.io/robocommander/robo-commander-intro.html](https://wwlib.github.io/robocommander/robo-commander-intro.html)

### Overview

Overview video (YouTube): [https://www.youtube.com/embed/rYSjbH23u9g](https://www.youtube.com/embed/rYSjbH23u9g)


### Getting Started

Building robocommander requires node v8.11.2 (or newer)

The use of the [yarn](https://yarnpkg.com/) package manager is **strongly** recommended, as opposed to using `npm`.

```bash
yarn
```

### Development Scripts

```bash
# run application in development mode
yarn dev

# compile source code and create webpack output
yarn compile

# `yarn compile` & create build with electron-builder
yarn dist

# `yarn compile` & create unpacked build with electron-builder
yarn dist:dir
```

![robocommander](./docs/img/RoboCommander-panels.png)

![robocommander](./docs/img/RoboCommander-robot-modal.png)

![robocommander](./docs/img/RoboCommander-basic.png)

![robocommander](./docs/img/RoboCommander-dialog.png)

### Linux setup
* Recommend NodeJS 8.11.1
* Install the latest yarn package globally via npm
* $ yarn
* $ yarn compile
* $ yarn dev

If things go wrong, try clearing any existing node_modules directory
Also clear yarn cache: $ rm -rf ~/.cache/yarn

### Windows
- need python 2.7
- libxml.js node gyp error
- need `npm install -g --production windows-build-tools`
  - will install python 2.7
  - solves this error:

```bash
MSBUILD : error MSB3428: Could not load the Visual C++ component "VCBuild.exe". To fix this, 1) install the .NET Framewo
rk 2.0 SDK, 2) install Microsoft Visual Studio 2005 or 3) add the location of the component to the system path if it is
installed elsewhere.  [C:\Users\seppo.rapo\github\robocommander\node_modules\xmlshim\node_modules\libxmljs\build\binding
.sln]
```

### License

[MIT](https://github.com/electron/electron/blob/master/LICENSE)
