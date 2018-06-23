export type SavedScript = {
    index: number;
    name: string;
    script: string;
}

export default class ScriptConfig {

    // public initialScript: string;
    public savedScripts: Map<number, SavedScript>;
    // public savedScriptsByName: Map<string, SavedScript>;
    public nextScriptIndex: number = 0;

    constructor(json?: any) {
        this.savedScripts = new Map<number, SavedScript>();
        // this.savedScriptsByName = new Map<string, SavedScript>();
        this.nextScriptIndex = 0;
        if (json) {
            this.initWithJson(json);
        }
        // else {
        //     // this.initialScript = "MATCH (n)-[r]-(p), (q) return n,r,p, q limit 100";
        //     this.savedScripts = new Map<number, SavedScript>();
        //     this.savedScriptsByName = new Map<string, SavedScript>();
        //     this.nextScriptIndex = 0;
        // }
    }

    initWithJson(json: any) {
        // this.initialScript = json.initialScript;
        this.nextScriptIndex = 0;
        if (json.savedScripts) {
            json.savedScripts.forEach((savedScript: SavedScript) => {
                this.addSavedScript(savedScript.name, savedScript.script);
            });
        }
        if (this.savedScripts.size == 0) {
            this.newSavedScript();
        }
    }

    savedScriptToArray(): any[] {
        return Array.from( this.savedScripts.values() );
    }

    toJSON(): any {
        let json: any = {};
        // json.initialScript = this.initialScript;
        json.savedScripts = this.savedScriptToArray();
        return json;
    }

    addSavedScript(name: string, script: string): number {
        let savedScriptIndex: number = this.nextScriptIndex++;
        let savedScript: SavedScript = {index: savedScriptIndex, name: name, script: script};
        this.savedScripts.set(savedScriptIndex, savedScript);
        // this.savedScriptsByName.set(name, savedScript);
        return this.savedScripts.size - 1;
    }

    getSavedScriptWithName(name: string): SavedScript | undefined {
        let savedScript: SavedScript | undefined = undefined;
        this.savedScripts.forEach((value: SavedScript, key: number, map) => {
            if (value.name == name) {
                savedScript = value;
            }
        });
        return savedScript;
    }

    newSavedScript(): number {
        return this.addSavedScript('<script name>', '<script>');
    }

    saveScript(savedScript: SavedScript): void {
        let savedScriptIndex: number = savedScript.index || this.nextScriptIndex++;
        savedScript.index = savedScriptIndex;
        this.savedScripts.set(savedScriptIndex, savedScript);
        // this.savedScriptsByName.set(savedScript.name, savedScript);
    }

    deleteSavedScriptWithIndex(index: number): number {
        // let savedScript: SavedScript | undefined = this.savedScripts.get(index);
        // if (savedScript) {
        //     let name: string = savedScript.name;
        //     this.savedScriptsByName.delete(name);
        // }
        this.savedScripts.delete(index);
        return 0
    }
}
