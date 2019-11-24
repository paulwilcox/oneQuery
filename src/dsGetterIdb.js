import dsGetter from './dsGetter.js';
import hashBuckets from './hashBuckets.js';

export default class extends dsGetter {

    constructor (storeName, idbConnector) {
        super(idbConnector);
        this.storeName = storeName;
        this.filterFunc;
    }

    filter(filterFunc) {

        if (!this.filterFunc) 
            this.filterFunc = filterFunc;
        else 
            this.filterFunc = this.filterFunc && filterFunc;

        return this;

    }

    // - thanks netchkin at https://stackoverflow.com/questions/46326212/
    //   how-to-return-indexeddb-query-result-out-of-event-handler
    // - also see "using a cursor" at https://developer.mozilla.org/en-US/
    //   docs/Web/API/IndexedDB_API/Using_IndexedDB
    map(mapFunc) {

        return new Promise((resolve, reject) => {

            let dbCon = this.dbConnector.open();
            
            dbCon.onsuccess = () => {

                let db = dbCon.result;
                let tx = db.transaction(this.storeName);
                let store = tx.objectStore(this.storeName);
                let filterFunc = this.filterFunc || (x => true);
                let results = [];

                let storeCursor = store.openCursor();
                
                storeCursor.onsuccess = event => {

                    let cursor = event.target.result;

                    if (!cursor) {
                        resolve(results);
                        return;
                    }

                    if (filterFunc(cursor.value))
                        results.push(
                            mapFunc(cursor.value)
                        );

                    cursor.continue();

                } 
                
                storeCursor.onerror = event => reject(event);
                tx.oncomplete = () => db.close(); 
                tx.onerror = event => reject(event); 

            };

            dbCon.onerror = event => reject(event); 

        });

    }

    merge (
        type,
        targetIdentityKey, 
        sourceIdentityKey,
        source 
    ) {

        let typeIx = ix => (Array.isArray(type) && type[ix]);
        let typeIn = (...args) => [...args].includes(type.toLowerCase());
        
        let updateIfMatched = typeIn('upsert', 'update', 'full') || typeIx(0);
        let deleteIfMatched = typeIn('delete') || typeIx(1);
        let insertIfNoTarget = typeIn('upsert', 'insert', 'full') || typeIx(2);
        let deleteIfNoSource = typeIn('full') || typeIx(3);

        return new Promise((resolve, reject) => {

            let incomingBuckets = 
                new hashBuckets(sourceIdentityKey)
                .addItems(source);
    
            let dbCon = this.dbConnector.open();

            dbCon.onsuccess = () => {

                let db = dbCon.result;

                let tx = db.transaction(this.storeName, "readwrite");
                let store = tx.objectStore(this.storeName);

                let storeCursor = store.openCursor();
                
                storeCursor.onsuccess = event => {

                    let cursor = event.target.result;

                    if (!cursor) {
                        
                        if (insertIfNoTarget) {
                                
                            let remainingItems = // source but no target
                                incomingBuckets.getBuckets()
                                .map(bucket => bucket[0]);
    
                            for(let item of remainingItems) {
                                let addRequest = store.add(item);
                                addRequest.onerror = event => reject(event); 
                            }
                        
                        }

                        return;

                    }

                    let sourceRow = 
                        incomingBuckets.getBucketFirstItem(
                            cursor.value, 
                            targetIdentityKey,
                            true 
                        );

                    if (sourceRow)
                        if (deleteIfMatched) 
                            cursor.delete();
                        else if (updateIfMatched) 
                            cursor.update(sourceRow);
        
                    else if (deleteIfNoSource) 
                        cursor.delete();

                    cursor.continue();

                } 
                    
                storeCursor.onerror = event => reject(event); 
                tx.oncomplete = () => db.close();
                tx.onerror = event => reject(event); 

            };

            dbCon.onerror = event => reject(event); 

        });

    }

}
