/*
 * 
 */

Ext.data.RESTStore = Ext.extend(Ext.data.Store, {

	/**
	 * 
	 * 
	 */
	constructor : function(config) {
		Ext.data.JsonStore.superclass.constructor.call(this, Ext.apply(config,
				{

					_new_records : [],
					
				    baseParams: config.baseParams || {
				    	format:'json'
				    },
				    
				    paramNames: {
					    start : 'offset',
					    limit : 'limit',
					    sort : 'sort',
					    dir : 'dir'
					},
					
				    restful: true,
				    
				    proxy: new Ext.data.HttpProxy({
					    url: config.apiUrl
					}),
				    
				    reader: new Ext.data.JsonReader({
					    totalProperty: 'meta.total_count',
					    successProperty: 'success',
					    idProperty: 'id',
					    root: 'objects',
					    messageProperty: 'message'
					}, config.model),
					
					writer: new Ext.data.JsonWriter({
					    encode: false,
					    writeAllFields: true
					}),
					
					getModel : function() {
						return this.recordType
					},

					insertRecord : function(record) {
						if (record.phantom) {
							if (this._new_records.indexOf(record) == -1) {
								this._new_records.push(record);
								this.insert(0, record);
							}
						}
					},

					flushRecord : function(record) {
						if (this._new_records.indexOf(record) != -1) {
							this._new_records.remove(record);
						}
					},
					
					listeners: {
						write: function(store, action, result, res, rs) {
							if (action == 'create') {
								this.flushRecord(rs);
							}
						},
						scope:this
					}


				}));

	}
});

Ext.reg('reststore', Ext.data.RESTStore);

