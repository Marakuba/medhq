Ext.ns('Ext.calendar');


Ext.calendar.PreorderedServiceInlineGrid = Ext.extend(Ext.grid.EditorGridPanel, {

	loadInstant: false,
	initComponent : function() {

		this.shortMode = this.type=='material';

		this.deletedRecords = [];

		this.proxy = new Ext.data.HttpProxy({
		    url: App.getApiUrl('preorderedservice')
		});

		this.reader = new Ext.data.JsonReader({
		    totalProperty: 'meta.total_count',
		    successProperty: 'success',
		    idProperty: 'id',
		    root: 'objects',
		    messageProperty: 'message'
		}, [
		    {name: 'id'},
		    {name: 'preorder', allowBlank: true},
		    {name: 'service', allowBlank: true},
		    {name: 'service_name', allowBlank: true},
		    {name: 'execution_place', allowBlank: false},
		    {name: 'count', allowBlank: false}
		]);

		this.writer = new Ext.data.JsonWriter({
		    encode: false,
		    writeAllFields: true
		});

		this.store = new Ext.data.Store({
			autoSave:false,
		    baseParams: {
		    	format:'json'
		    },
		    paramNames: {
			    start : 'offset',
			    limit : 'limit',
			    sort : 'sort',
			    dir : 'dir'
			},
		    restful: true,
		    proxy: this.proxy,
		    reader: this.reader,
		    writer: this.writer
		});

		if (this.record) {
			this.store.setBaseParam('preorder',this.record.id);
			this.store.load();
		}

		this.columns =  [new Ext.grid.RowNumberer({width: 30}),
		    {
		    	header: "МВ",
		    	width: 5,
		    	css:'padding-bottom:0px',
		    	dataIndex: 'execution_place',
		    	renderer: function(val) {
		    		var s = val.split('/');
		    		return "<img src='"+MEDIA_URL+"resources/images/state_"+s[s.length-1]+".png'>"
		    	}
		    },{
		    	header: "Услуга",
		    	width: 50,
		    	sortable: true,
			    	dataIndex: 'service_name'
		    },{
		    	header: "Кол-во",
		    	width: 10,
		    	sortable: false,
		    	hidden: this.shortMode,
		    	dataIndex: 'count',
		    	editor: new Ext.ux.form.SpinnerField({
		    		minValue: 1,
            		maxValue: 20
            	})
		    }
		];

		var config = {
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			clicksToEdit:1,
			autoDestroy:true,
			border : false,
			store:this.store,
			columns:this.columns,
			sm : new Ext.grid.RowSelectionModel({
				singleSelect : true,
				listeners: {
					rowselect: function(sm,i,rec) {
						this.getTopToolbar().items.itemAt(0).setDisabled(false);
					},
					rowdeselect: function(sm,i,rec) {
						this.getTopToolbar().items.itemAt(0).setDisabled(true);
					},
					scope:this
				}
			}),
			tbar:[{
				xtype:'button',
				iconCls:'silk-delete',
				text:'Удалить',
				disabled:true,
				handler:this.delRow.createDelegate(this)
			}],
			viewConfig : {
				forceFit : true
				//getRowClass : this.applyRowClass
			},
			listeners:{
				//afteredit:this.onSumChange.createDelegate(this),
				scope:this
			}

		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		Ext.calendar.PreorderedServiceInlineGrid.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('preordercreate', this.onPreorderCreate, this);
		this.on('destroy', function(){
			App.eventManager.un('preordercreate', this.onPreorderCreate, this);
		},this);
	},

	applyRowClass: function() {
		//TODO: сделать разные цвета для сохраненных, новых и отмененных записей
	},

	saveBasket: function(){
		this.store.save();
	},


	addRecord: function(attrs){
		var re = /(.*) \[\d+\]/;
		var res = re.exec(attrs.text);
		var text = res[res.length-1];
		var ids = attrs.id.split('-');
		var id = ids[0];
		var place = ids[1];
		var Service = this.store.recordType;
		var s = new Service({
			service:"/api/v1/dashboard/baseservice/"+id, //TODO: replace to App.getApiUrl
			service_name:text,
			count:1,
			execution_place:"/api/v1/dashboard/state/"+place
		});
		this.stopEditing();
		this.store.add(s);
		this.startEditing(0, 0);
	},

	addRow: function(attrs, can_duplicate) {
		if(!can_duplicate) {
			var re = /(.*) \[\d+\]/;
			res = re.exec(attrs.text);
			var text = res[res.length-1];
			if(this.store.query('service_name',text).length){
				return false;
			}
		};
		this.addRecord(attrs);
	},

	delRow: function() {
		rec = this.getSelectionModel().getSelected();
		this.store.remove(rec);
	},

	onSave: function() {
		if(this.record) {
			var records = this.store.queryBy(function(rec,id){
				return rec.data.preorder ? false : true;
			});
			records.each(function(item,idx,len){
				item.beginEdit();
				item.set('preorder', this.record.data.resource_uri);
				item.endEdit();
			}, this);
			this.store.save();
		} else {
			Ext.MessageBox.alert('Ошибка','Не задана запись предзаказа!');
		}
	},

	getSteps: function(){
		var steps = 0;
		var m = this.store.getModifiedRecords().length;
		var d = this.deletedRecords ? this.deletedRecords.length : 0;
		steps+=m;
		steps+=d;
		return steps;
	},

	onPreorderCreate: function(record) {
		this.record = record;
		this.onSave();
	}

});



Ext.reg('preorderedserviceinlinegrid', Ext.calendar.PreorderedServiceInlineGrid);
