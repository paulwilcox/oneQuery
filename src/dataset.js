import * as g from './general.js';
import hashBuckets from './hashBuckets.js';
import { quickSort } from './sorts.js';
import parser from './parser.js';
import { runEmulators } from './reducer.js';
import { merge as mrg } from './mergeTools.js';
import fluentDb from './FluentDB.js';

export default class dataset {

    constructor(data) {
        this.data = data;
    }

    map (func) {    
        return recurse (
            data => data.map(g.noUndefinedForFunc(func)),
            this.data, 
        );
    }

    filter (func) {    
        return recurse (
            data => data.filter(func),
            this.data, 
        );
    }

    sort (func) {

        let params = parser.parameters(func);

        let outerFunc = 
            params.length > 1 
            ? data => data.sort(func)
            : data => quickSort(data, func);
        
        return recurse(outerFunc, this.data);

    } 

    group (func) {
        let b = new hashBuckets(func)
            .addItems(this.data)
            .getBuckets();
        return new dataset(b);
    }

    reduce (func) {
        let outerFunc = data => runEmulators(data, func);
        let ds = recurse(outerFunc, this.data);
        return ds;
    }    

    merge (incoming, matchingLogic, mapper, distinct) {
        return new dataset([...mrg (
            this.data, 
            incoming, 
            matchingLogic, 
            mapper, 
            distinct
        )]);
    }

    print (func, caption, target) {

        let data = recurse (
            data => data.map(g.noUndefinedForFunc(func)),
            this.data, 
        ).data;

        if (target && fluentDb.htmlPrinter)
            fluentDb.htmlPrinter(target, data, caption)
        else if(caption)
            console.log(caption, data) 
        else 
            console.log(data); 

        return this;
        
    }

}


function recurse (func, data) {

    let isNested = Array.isArray(data[0]);

    if (!isNested) 
        return new dataset(func(data));    

    let output = [];

    for (let nested of data)  
        output.push(func(nested));

    return new dataset(output);

}