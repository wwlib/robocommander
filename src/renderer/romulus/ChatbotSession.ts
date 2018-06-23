export enum ChatbotStatus {
    INVALID,
    IDLE,
    REQUESTING_NEXT_PROMPT,
    RECEIVED_PROMPT,
    ERROR,
    SUCCEEDED,
    COMPLETED
}

export interface ChatbotResponse {
    prompt: string;
    status: ChatbotStatus;
    data: any;
}

export abstract class ChatbotSession {

    public debug: boolean = false;
    public status: ChatbotStatus = ChatbotStatus.INVALID;
    public currentPrompt: string = '';

    abstract init(): Promise<any>;
    abstract getNextResponse(input: string | number): Promise<any>;
}
