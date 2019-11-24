import dsGetterMongo from './dsGetterMongo.js';
import dbConnector from './dbConnector.js';
import { MongoClient } from 'mongodb';

export default class extends dbConnector {

    constructor (url) {
        super();
        this.client = MongoClient.connect(url, {useNewUrlParser: true});
    }

    dsGetter(collectionName) {
        return new dsGetterMongo(collectionName, this.client);
    }

} 