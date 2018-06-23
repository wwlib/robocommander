
const DEFAULT_PORT = 7160;

export interface AppInfoData {
    port: number;
    clientId: string;
    clientSecret: string;
    nluDefault: string;
    nluLUIS_endpoint: string;
    nluLUIS_appId: string;
    nluLUIS_subscriptionKey: string;
    nluDialogflow_clientToken: string;
    nluDialogflow_projectId: string;
    nluDialogflow_privateKey: string;
    nluDialogflow_clientEmail: string;
    neo4j_url: string;
    neo4j_user: string;
    neo4j_password: string;
}

export default class AppInfo {

    public port: number = DEFAULT_PORT;
    public clientId: string = '';
    public clientSecret: string = '';
    public nluDefault: string = '';
    public nluLUIS_endpoint: string = '';
    public nluLUIS_appId: string = '';
    public nluLUIS_subscriptionKey: string = '';
    public nluDialogflow_clientToken: string = '';
    public nluDialogflow_projectId: string = '';
    public nluDialogflow_privateKey: string = '';
    public nluDialogflow_clientEmail: string = '';

    public neo4j_url: string = '';
    public neo4j_user: string = '';
    public neo4j_password: string = '';

    constructor(options?: any) {
        options = options || {
            port: this.port,
            clientId: this.clientId,
            clientSecret: this.clientSecret,
            nluDefault: this.nluDefault,
            nluLUIS_endpoint: this.nluLUIS_endpoint,
            nluLUIS_appId: this.nluLUIS_appId,
            nluLUIS_subscriptionKey: this.nluLUIS_subscriptionKey,
            nluDialogflow_clientToken: this.nluDialogflow_clientToken,
            nluDialogflow_projectId: this.nluDialogflow_projectId,
            nluDialogflow_privateKey: this.nluDialogflow_privateKey,
            nluDialogflow_clientEmail: this.nluDialogflow_clientEmail,
            neo4j_url: this.neo4j_url,
            neo4j_user: this.neo4j_user,
            neo4j_password: this.neo4j_password

        }
        this.initWithData(options);
    }

    initWithData(data: AppInfoData): void {
        this.port = data.port;
        this.clientId = data.clientId;
        this.clientSecret = data.clientSecret;
        this.nluDefault = data.nluDefault;
        this.nluLUIS_endpoint = data.nluLUIS_endpoint;
        this.nluLUIS_appId = data.nluLUIS_appId;
        this.nluLUIS_subscriptionKey = data.nluLUIS_subscriptionKey;
        this.nluDialogflow_clientToken = data.nluDialogflow_clientToken;
        this.nluDialogflow_projectId = data.nluDialogflow_projectId,
        this.nluDialogflow_privateKey = data.nluDialogflow_privateKey,
        this.nluDialogflow_clientEmail = data.nluDialogflow_clientEmail,
        this.neo4j_url = data.neo4j_url,
        this.neo4j_user = data.neo4j_user,
        this.neo4j_password = data.neo4j_password
    }

    get json(): AppInfoData {
        let json: AppInfoData = {
            port: this.port,
            clientId: this.clientId,
            clientSecret: this.clientSecret,
            nluDefault: this.nluDefault,
            nluLUIS_endpoint: this.nluLUIS_endpoint,
            nluLUIS_appId: this.nluLUIS_appId,
            nluLUIS_subscriptionKey: this.nluLUIS_subscriptionKey,
            nluDialogflow_clientToken: this.nluDialogflow_clientToken,
            nluDialogflow_projectId: this.nluDialogflow_projectId,
            nluDialogflow_privateKey: this.nluDialogflow_privateKey,
            nluDialogflow_clientEmail: this.nluDialogflow_clientEmail,
            neo4j_url: this.neo4j_url,
            neo4j_user: this.neo4j_user,
            neo4j_password: this.neo4j_password
        };
        return json;
    }

}
