Ext.ns('App');

App.Backend = Ext.extend(Ext.util.Observable, {
    
    constructor: function(config){

        //this.addEvents({});
    	
    	this.newRecords = [];

        Ext.apply(this, config);
        App.Backend.superclass.constructor.call(this, config);
        
        this.store.on('write',function(store, action, result, res, rs){
        	if(action=='create') {
        		this.flushRecord(rs);
        	}
        }, this);
    },
    
	getModel: function() {
		var Model = this.store.recordType; 
		return Model
	},
	
    saveRecord: function(record) {
		if(record.phantom) {
			if(this.newRecords.indexOf(record)==-1) {
				this.newRecords.push(record);
				this.store.insert(0, record);
			} else {
			}
		} else {
		}
	},
    
    flushRecord: function(record) {
		if(this.newRecords.indexOf(record)!=-1) {
			this.newRecords.remove(record);
		}
	}
    
});

/*
 * 
 */

App.backends = new Ext.util.MixedCollection();

/*
 * Backend Shortcuts
 */

App.regBackend = function(name, obj) {
	App.backends.add(name, obj);
}

App.getBackend = function(name) {
	return App.backends.get(name);
}