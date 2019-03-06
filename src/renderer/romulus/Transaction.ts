import {EventEmitter} from 'events';

export type TransactionMessageData = {
    client?: string;
    id: number;
    type: string;
    data: any;
    sendTime: number;
}

export default class Transaction extends EventEmitter {

    public id: string;
    public robotSerialName: string;
    public status: string;
    public type: string;
    public data: any;
    public sendTime: number;
    public receiptTime: number;
    public commandReceivedTime: number
    public commandCompletedTime: number;
    public receiptPayload: any;

    constructor(id: string, type: string, data: any, robotSerialName: string) {
        super();
        this.id = id;
        this.robotSerialName = robotSerialName;
        this.type = type;
        this.data = data;

        this.status = 'OK';
        this.sendTime = 0;
        this.receiptTime = 0;
        this.commandReceivedTime = 0;
        this.commandCompletedTime = 0;
    }

    getMessageDataToSend(): TransactionMessageData {
        this.sendTime = new Date().getTime();
        let msg: any = {
            id: this.id,
            type: this.type,
            data: this.data,
            sendTime: this.sendTime,
        }
        return msg;
    }

    getMessageDataToLog(): any {
        let msg: any = {
            id: this.id,
            type: this.type,
            status: this.status,
            sendTime: this.sendTime,
            commandReceivedTime: this.commandReceivedTime,
            commandCompletedTime: this.commandCompletedTime,
            receiptTime: this.receiptTime
        }
        return msg;
    }

    onReceipt(payload: any): void {
        this.receiptTime = new Date().getTime();
        this.receiptPayload = payload;
        this.commandReceivedTime = payload.commandReceivedTime;
        this.commandCompletedTime = payload.commandCompletedTime;
        this.emit('receipt', this);
    }

    destroy(): void {
        this.removeAllListeners();
        this.data = null;
        this.receiptPayload = null;
    }
}
