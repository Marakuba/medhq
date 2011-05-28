Ext.ns('App');

App.ReferralGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {		

		this.proxy = new Ext.data.HttpProxy({
		    url: '/dashboard/api/v1/referral'
		});
		
		// Typical JsonReader.  Notice additional meta-data params for defining the core attributes of your json-response
		this.reader = new Ext.data.JsonReader({
		    totalProperty: 'meta.total_count',
		    successProperty: 'success',
		    idProperty: 'id',
		    root: 'objects',
		    messageProperty: 'message'
		}, [
		    {name: 'id'},
		    {name: 'name', allowBlank: false}
		]);
		
		// The new DataWriter component.
		this.writer = new Ext.data.JsonWriter({
		    encode: false   // <-- don't return encoded JSON -- causes Ext.Ajax#request to send data using jsonData config rather than HTTP params
		});
		this.baseParams = {
		    format:'json'
		}; 
		this.store = new Ext.data.Store({
		    id: 'referral-store',
		    baseParams: this.baseParams,
		    paramNames: {
			    start : 'offset',  // The parameter name which specifies the start row
			    limit : 'limit',  // The parameter name which specifies number of rows to return
			    sort : 'sort',    // The parameter name which specifies the column to sort on
			    dir : 'dir'       // The parameter name which specifies the sort direction
			},
		    restful: true,
		    proxy: this.proxy,
		    reader: this.reader,
		    writer: this.writer,    
		    listeners: {
		    	write: function(store, action, result, res, rs) {
		    		//App.eventManager.fireEvent('patientwrite',rs);
		    	}
		    }
		});
		this.store.load();
		
		this.columns =  [
		    {
		    	header: "Организация, врач", 
		    	sortable: true, 
		    	dataIndex: 'name', 
		    	editor: new Ext.form.TextField({})
		    }
		];		
		this.editor = editor = new Ext.ux.grid.RowEditor({
       		saveText: 'Сохранить',
       		cancelText: 'Отменить'
    	});
		var config = {
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			border: false,
			store:this.store,
			columns:this.columns,
			plugins: [this.editor],
			sm : new Ext.grid.RowSelectionModel({
						singleSelect : true
					}),
			tbar:[{
				xtype:'button',
				iconCls:'silk-add',
				text:'Добавить',
				handler:this.onAdd.createDelegate(this, [])
			}/*,{
				xtype:'button',
				iconCls:'silk-cancel',
				text:'Изменить',
				handler:this.onDelete.createDelegate(this, [])
			}*/],
			viewConfig : {
				forceFit : true
			}			
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.ReferralGrid.superclass.initComponent.apply(this, arguments);
	},
	
	onAdd: function(btn,ev){
        var r = new this.store.recordType({
            name : ''
        });
        this.editor.stopEditing();
        this.store.insert(0, r);
        this.editor.startEditing(0);
	},
    
    /*onDelete: function() {
        var rec = this.getSelectionModel().getSelected();
        if (!rec) {
            return false;
        }
        this.store.remove(rec);
    }	*/
	
	
});



Ext.reg('referralgrid',App.ReferralGrid);