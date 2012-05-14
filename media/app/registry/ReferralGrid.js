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
		    {name: 'resource_uri'},
		    {name: 'name', allowBlank: false},
		    {name: 'referral_type', allowBlank: false}
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
		    		if (action == 'create'){
		    			this.fireEvent('referralcreate',rs)
		    		}
		    	},
		    	scope:this
		    }
		});
		
		Ext.util.Format.comboRenderer = function(combo,field){
            return function(value, meta, rec){
                var record = combo.findRecord(combo.valueField, value);
                return record ? record.get(combo.displayField) : (rec ? rec.get(field) : combo.valueNotFoundText);
            }
        };
		
		this.referralTypeCB = new Ext.form.ComboBox({
			store:new Ext.data.ArrayStore({
				fields:['id','title'],
				data: [
					['ф','Физическое лицо'],
					['в','Организация/Врач'],
					['с','Страховая компания']]
			}),
			typeAhead: true,
			triggerAction: 'all',
			valueField:'id',
			displayField:'title',
			mode: 'local',
			forceSelection:true,
			selectOnFocus:true,
			editable:false,
			anchor:'98%',
			value:'в',
			listeners: {
				select:function(combo,rec,i){

				},
				scope:this
			}
		});
		
		this.columns =  [
		    {
		    	header: "Наименование/Имя", 
		    	sortable: true, 
		    	dataIndex: 'name', 
		    	editor: new Ext.form.TextField({})
		    },{
		    	header: "Тип", 
		    	sortable: true, 
		    	dataIndex: 'referral_type', 
		    	editor: this.referralTypeCB,
                renderer: Ext.util.Format.comboRenderer(this.referralTypeCB,'title')
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
			},{
				xtype:'button',
				iconCls:'silk-accept',
				text:'Выбрать',
				handler:this.onChoice.createDelegate(this, [])
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
	
	onChoice: function(btn,ev){
		var record = this.getSelectionModel().getSelected();
        if (record) {
        	Ext.callback(this.fn, this.scope || window, [record]);
        };
	}
    
    /*onDelete: function() {
        var rec = this.getSelectionModel().getSelected();
        if (!rec) {
            return false;
        }
        this.store.remove(rec);
    }	*/
	
	
});



Ext.reg('referralgrid',App.ReferralGrid);