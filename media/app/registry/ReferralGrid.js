Ext.ns('App');

App.ReferralGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {		

		this.proxy = new Ext.data.HttpProxy({
		    url: '/api/v1/dashboard/referral'
		});
		
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
		
		this.writer = new Ext.data.JsonWriter({
		    encode: false
		});
		this.baseParams = {
		    format:'json'
		}; 
		this.store = new Ext.data.Store({
		    id: 'referral-store',
		    autoLoad:true,
		    baseParams: this.baseParams,
		    paramNames: {
			    start : 'offset',
			    limit : 'limit',
			    sort : 'sort',
			    dir : 'dir'
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
		
		this.columns =  [
		    {
		    	header: "Организация, врач", 
		    	sortable: true, 
		    	dataIndex: 'name', 
		    	editor: new Ext.form.TextField({})
		    }
		];		
		this.editor = new Ext.ux.grid.RowEditor({
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
			}],
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