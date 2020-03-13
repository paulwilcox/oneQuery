import * as g from './general.js';
import parser from './parser.js';
import dataset from './dataset.js';

export default class {

    constructor() {
        
        this.datasets = {};

        let funcsToAttach = [
            'filter', 'map', 
            'group', 'ungroup', 
            'distinct', 'reduce', 
            'sort', 'print', 'merge', 'with'
        ];

        for(let funcName of funcsToAttach) 
            this[funcName] = (...args) => 
                this._callOnDs(funcName, ...args); 

    }

    addDataset (key, data) { 
        if (!data)
            throw `Cannot pass ${key} as undefined in 'addDataset'`
        this.datasets[key] = Array.isArray(data) 
            ? new dataset(data) 
            : data;
        return this;
    }    

    addDatasets (obj) { 
        for (let entry of Object.entries(obj)) 
            this.addDataset(entry[0], entry[1]);
        return this;
    }

    getDataset(arg) {
        if (g.isString(arg))
            return this.datasets[arg];
        if (g.isFunction(arg)) {
            let param = parser.parameters(arg)[0];
            return this.datasets(param)[0];
        }
    }

    getDatasets(arg) {

        let datasets = [];
        
        if (g.isString(arg))
            datasets.push(this.getDataset(arg));

        else for (let param of parser.parameters(arg)) 
            datasets.push(this.datasets[param]);
        
        return datasets.filter(ds => ds !== undefined);

    }

    // .map(), except return the dataset instead
    // of the calling FluentDB.
    get(funcOrKey) {
        if (g.isString(funcOrKey))
            return this.datasets[funcOrKey];
        let key = parser.parameters(funcOrKey)[0];
        return this
            ._callOnDs('map', funcOrKey)
            .datasets[key]
            .data;
    }

    // - Execute a function on a dataset, basically a proxy,
    //   but you don't know what the target is.
    // - Parse ...args -- which can be broken down into 
    //   targetDsName, lambda, ...otherArgs -- to identify
    //   targetDsName, ...dataArgs, lambda, ...otherArgs.
    // - If targetDsName is not present, it is implied by
    //   lambda.   
    _callOnDs(funcName, ...args) {

        // User parameters should take the form of 
        // 'targetDsName, lambda, ...args'.  But the user
        // might omit 'targetDsName'.  If so, create one 
        // now using the first parameter of 'lambda'.
        if (g.isFunction(args[0])) {
            let dsName = parser.parameters(args[0])[0];
            args.unshift(dsName)
        }

        // The dataset name to load the result into.  
        // The lambda to execute on a method of the dataset
        // args is now the other args to execute on that method.
        let targetDsName = args.shift(); 
        let lambda = args.shift();

        // Get the datasets referenced by 'lambda'.  The 
        // first one you'll need the full dataset object,
        // methods and all.  Subsequent ones you just want
        // their data, to later pass to the first one.
        let dataArgs = this.getDatasets(lambda);
        let targetDs = dataArgs.shift(); 
        dataArgs = dataArgs.map(ds => ds.data); 

        // Execute the method on the target dataset 
        this.datasets[targetDsName] = targetDs[funcName](
            ...dataArgs, 
            lambda, 
            ...args
        ); 

        return this;  

    }    

}
