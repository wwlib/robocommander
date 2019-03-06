import Transaction from './Transaction';

export default class TransactionFactory {

    static transactions: Map<string, Transaction>;
    static lastId: number = 0;


    static init(): void {
        TransactionFactory.transactions = new Map<string, Transaction>();
    }

    static getNextId(): string {
        return `${TransactionFactory.lastId++}`;
    }

    static createTransaction(type: string, data: any, robotSerialName: string): Transaction {
        let id: string = TransactionFactory.getNextId();
        let transaction: Transaction = new Transaction(id, type, data, robotSerialName);
        TransactionFactory.transactions.set(id, transaction);
        return transaction;
    }

    static receiveTransaction(payload: any, status: string): Transaction | undefined {
        let id = payload.id;
        let transaction: Transaction | undefined = TransactionFactory.transactions.get(id);
        if (transaction) {
            TransactionFactory.transactions.delete(id);
            transaction.status = status;
            transaction.onReceipt(payload);
        }
        return transaction;
    }

    static destroyTransaction(transaction: Transaction): void {
        TransactionFactory.transactions.delete(transaction.id);
        transaction.destroy();
    }

}
