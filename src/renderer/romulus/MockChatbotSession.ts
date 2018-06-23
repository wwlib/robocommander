import { ChatbotSession, ChatbotStatus } from './ChatbotSession';

export default class MockChatbotSession extends ChatbotSession {

    public transactionCount: number;
    public inputs: string[];

    constructor() {
        super();
        this.transactionCount = 0;
        this.inputs = [];
        this.status = ChatbotStatus.IDLE;
    }

    init(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let dominosPrompt: string = `OK. Let's pretend we're talking to a chatbot.`;
            resolve(dominosPrompt);
        });
    }

    getNextResponse(input: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.inputs.push(input);
            this.status = ChatbotStatus.REQUESTING_NEXT_PROMPT;
            this.currentPrompt = 'How many travelers are in your party?';
            setTimeout(() => {
                this.status = ChatbotStatus.RECEIVED_PROMPT;
                if (this.transactionCount++ >= 3) {
                    this.status = ChatbotStatus.SUCCEEDED;
                }
                resolve(this);
            }, 2000);
        });
    }
}
