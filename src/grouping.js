import hashBuckets from './hashBuckets.js';

export default class grouping {

    constructor(key) {
        this.key = key;
        this.parent = null;
        this.children = [];
        this.data = null;
        this.dataIsNaked = false;
    }

    apply (tableLevelFunc) {

        if (this.dataIsNaked) {
            this.group();
            this.apply(tableLevelFunc);
            this.ungroup();
            return;
        }

        if (this.data != null) {
            this.data = (function*(data) { yield* tableLevelFunc(data); })(this.data); 
            return;
        }

        for(let child of this.children)
            child.apply(tableLevelFunc);

    }

    arrayify () {

        let list = [];
        list.key = this.key;

        if (this.dataIsNaked)
            return this.data;
        else if (this.data != null) 
            list.push(...this.data);

        for(let child of this.children)
            list.push(child.arrayify());

        return list;

    }

    group (hashFunc) {

        if (this.dataIsNaked) {
            this.data = [this.data];
            this.dataIsNaked = false;
            console.warn(
                'hashFunc is ignored when calling .group()' + 
                'if data is a naked object'
            );
            return;
        }

        if (this.data != null) {
            for(let [key,bucket] of new hashBuckets(hashFunc).addItems([...this.data])) {
                let g = new grouping(key);
                g.parent = this;
                g.data = bucket;
                this.data = null;
                this.children.push(g); 
            }
            return;
        }

        for(let child of this.children)
            child.group(hashFunc);


    }

    ungroup () {

        if (this.children.length == 0 && this.parent == null) {
            let nextVal = this.data.next().value;
            if (!this.data.next().done) 
                throw `calling ungroup on a grouping with no parent ` +
                    `and more than one item in data is not permitted.`
            this.data = nextVal;
            this.dataIsNaked = true;
            return 'there is no parent so you should never see this';
        }
  
        if (this.children.length == 0) {
            if (this.parent.data == null)
                this.parent.data = [];
            this.parent.data.push(...this.data);
            return 'removeFromParent';
        }
        
        for(let ch = this.children.length - 1; ch >= 0; ch--) {
            let child = this.children[ch];
            let decision = child.ungroup();
            if (decision == 'removeFromParent')
                this.children.splice(ch,1);
        }

        return 'doNotRemoveFromParent';

    }

}

grouping.groupify = (arrayified, _parent) => {

    let grp = new grouping();
    grp.parent = _parent || null;
    grp.key = arrayified.key || null;

    for(let row of arrayified) 
        if (Array.isArray(row)) {
            grp.children == grp.children || [];
            grp.children.push(grouping.groupify(row, grp))
        }
        else 
            grp.data = (function*() { yield* arrayified; })()

    return grp;

}