const path = require('path');
import { EventEmitter } from "events";
const ensureDir = require('ensureDir');
const osenv = require('osenv');
const jsonfile = require('jsonfile');

let configPath = path.resolve(osenv.home(), ".wwlib");
let configFile = path.resolve(configPath, "robocommander.json");

export default class Config extends EventEmitter {

    private _data: any;
    private _timestamp: number = 0;

    constructor() {
        super();
        this._data = {};
    }

    get data(): any {
        return this._data;
    }

    set data(obj: any) {
        this._data = obj;
    }

    get timestamp(): number {
        return this._timestamp;
    }

    load(cb: any){
        ensureDir(path.resolve(configPath), 0o755, (err: any) => {
            if (err) {
                console.log(`error: ${configPath} cannot be found`)
            } else {
                jsonfile.readFile(configFile, (err: any, obj: any) => {
                    if (err) {
                        cb(err);
                    } else {
                        this._data = obj;
                        this._timestamp = this._data.timestamp;
                        cb(err, obj);
                    }
                });
            }
        });
    }

    save(cb: any){
        this._timestamp = new Date().getTime();
        this._data.timestamp = this._timestamp;
        ensureDir(path.resolve(configPath), 0o755, (err: any) => {
            if (err) {
                console.log(`error: ${configPath} cannot be found`)
            } else {
                jsonfile.writeFile(configFile, this._data, {spaces: 2}, (err: any) => {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null);
                    }
                });
            }
        });
    }
}
