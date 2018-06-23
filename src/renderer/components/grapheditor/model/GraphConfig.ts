export type SavedTTS = {
    index: number;
    name: string;
    prompt: string;
}

export default class GraphConfig {

    public savedTTSs: Map<number, SavedTTS>;
    public nextTTSIndex: number = 0;

    constructor(json?: any) {
        this.savedTTSs = new Map<number, SavedTTS>();
        if (json) {
            this.initWithJson(json);
        } else {
            this.savedTTSs = new Map<number, SavedTTS>();
            this.nextTTSIndex = 0;
        }
    }

    initWithJson(json: any) {
        this.nextTTSIndex = 0;
        if (json.savedTTSs) {
            json.savedTTSs.forEach((savedTTS: SavedTTS) => {
                this.addSavedTTS(savedTTS.name, savedTTS.prompt);
            });
        }
        if (this.savedTTSs.size == 0) {
            this.newSavedTTS();
        }
    }

    savedTTSToArray(): any[] {
        return Array.from( this.savedTTSs.values() );
    }

    toJSON(): any {
        let json: any = {};
        json.savedTTSs = this.savedTTSToArray();
        return json;
    }

    addSavedTTS(name: string, prompt: string): number {
        let savedTTSIndex: number = this.nextTTSIndex++;
        this.savedTTSs.set(savedTTSIndex, {index: savedTTSIndex, name: name, prompt: prompt});
        return this.savedTTSs.size - 1;
    }

    newSavedTTS(): number {
        return this.addSavedTTS('<prompt name>', '<prompt>');
    }

    saveTTS(savedTTS: SavedTTS): void {
        let savedTTSIndex: number = savedTTS.index || this.nextTTSIndex++;
        this.savedTTSs.set(savedTTSIndex, {index: savedTTSIndex, name: savedTTS.name, prompt: savedTTS.prompt});
    }

    deleteSavedTTSWithIndex(index: number): number {
        this.savedTTSs.delete(index);
        return 0
    }
}
