export type NLUIntentAndEntities = {
    intent: string;
    entities: any;
}

export default abstract class NLUController {

  constructor() {
  }

  abstract set config(config: any);

  abstract call(query: string, languageCode: string, context: string, sessionId?: string): Promise<any>;

  abstract getEntitiesWithResponse(response: any): any | undefined;

  abstract getIntentAndEntities(query: string, languageCode: string, context: string, sessionId?: string): Promise<NLUIntentAndEntities>;
}
