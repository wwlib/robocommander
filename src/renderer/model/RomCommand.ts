export interface RomCommandData {
    name: string;
    type: string;
    data: any;
}

// { "name": "Anim: Celebrate_01", "type": "animation", "data": { "file": "Celebrate_01.keys"} }

export default class RomCommand {

    public name: string = '';
    public type: string = '';
    public data: any;

    constructor(name?: string, type?: string, data?: any) {
        this.initWithData({
            name: name || '',
            type: type || '',
            data: data
        })
    }

    initWithData(data: RomCommandData): void {
        this.name = data.name;
        this.type = data.type;
        this.data = data.data;
    }

    get json(): RomCommandData {
        let json: RomCommandData = {
            name: this.name,
            type: this.type,
            data: this.data
        };
        return json;
    }
}
