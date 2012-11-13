Ext.ns('App.result');

App.result.BaseColumn = Ext.extend(Ext.Panel,{


	/*
	 * Разделитель в названиях. Используется когда применяется группировка по полям или разбивка по колонкам.
	 */
	title_delimiter : "::",
	code_delimiter : "_",




	revertMappings : function(){
		this.reMappings = {};
		for(k in this.mappings) {
			this.reMappings[this.mappings[k]] = k;
		}
	},


	initGrid : function(recs, opts, success){

		this.mappings = {};
		var serviceTitle;
		Ext.each(recs, function(rec){
			serviceTitle = rec.data.service_name;
			var names = rec.data.analysis_name.split(this.title_delimiter);
			var codes = rec.data.analysis_code.split(this.code_delimiter);
			this.mappings[names[1]] = codes[1];
		}, this);

		this.setTitle(serviceTitle);

		this.editor = new App.fields.InputList();

		this.fields = ['name','code'];

		this.columns = [{
			header:'Тест',
			dataIndex:'name',
			width:55
		}];

		for(k in this.mappings){
			this.fields.push('inputlist'+this.mappings[k]);
			var dataIndex = 'col'+this.mappings[k];
			this.fields.push(dataIndex);

			this.columns.push({
				header:k,
				width:15,
				dataIndex:dataIndex,
				editor:this.editor
			});
		}

		this.gs = new Ext.data.ArrayStore({
			fields:this.fields
		});

		this.grid = new Ext.grid.EditorGridPanel({
			clicksToEdit:1,
			flex:1,
			store:this.gs,
			stripeRows:true,
			border : false,
			cm:new Ext.grid.ColumnModel({
				columns:this.columns,
				store:this.gs,
			    getCellEditor : function(colIndex, rowIndex) {
			    	var maxColIndex = this.columns.length-1;
			    	var ed = this.config[colIndex].getCellEditor(rowIndex);
			    	if( colIndex>=1 && colIndex<=maxColIndex ) {
			    		var rec = this.store.getAt(rowIndex);
			    		var inputlist = rec.get(this.config[colIndex].dataIndex.replace('col','inputlist'));
			    		if(inputlist){
			    			ed.field.getStore().loadData(inputlist);
			    		}
			    	}
			    	return ed;
			    }
			}),
			sm : new Ext.grid.RowSelectionModel({
				singleSelect : false
			}),
			viewConfig : {
				markDirty:false,
				forceFit : true
			},
			listeners:{
				afteredit: function(e) {
					this.onSave();
				},
				scope:this
			}
		});
		this.pullData(recs);
		this.add(this.grid);
		this.doLayout();
	},

	pullData : function(recs){
		/*
		 * Обработка колоночного режима
		 */
		Ext.each(recs, function(rec){
			var gCode = rec.get('analysis_code').split(this.code_delimiter)[0];
			var vals = rec.get('analysis_name').split(this.title_delimiter);
			var result = this.gs.find('code',gCode);
			var dataIndex = 'col'+this.mappings[vals[1]];
			if(result==-1) {
				var params = {
					name:vals[0],
					code:gCode
				};
				params[dataIndex] = rec.get('value');
				Ext.apply(params, this.processRow(rec, vals));
				var new_rec = new this.gs.recordType(params);
				this.gs.add(new_rec);
			} else {
				var result = this.gs.getAt(result);
				result.set(dataIndex, rec.get('value'));
				Ext.apply(result.data, this.processRow(rec, vals));
			}
		}, this);
	},

	processRow : function(rec, vals){
		var idx = String.format('inputlist{0}',this.mappings[vals[1]]);
		var obj = {};
		obj[idx] = rec.get('inputlist');
		return obj
	},

	initComponent : function(){

		this.proxy = new Ext.data.HttpProxy({
		    url: App.utils.getApiUrl('lab','result')
		});

		this.reader = new Ext.data.JsonReader({
		    totalProperty: 'meta.total_count',
		    successProperty: 'success',
		    idProperty: 'id',
		    root: 'objects',
		    messageProperty: 'message'
		}, [
		    {name: 'id'},
		    {name: 'order'},
		    {name: 'barcode'},
		    {name: 'patient'},
		    {name: 'service'},
		    {name: 'service_name'},
		    {name: 'analysis'},
		    {name: 'analysis_name'},
		    {name: 'analysis_code'},
		    {name: 'laboratory'},
		    {name: 'previous_value'},
		    {name: 'value'},
		    {name: 'modified_by_name'},
		    {name: 'inputlist'},
		    {name: 'measurement'},
		    {name: 'validation', type:'int'},
		    {name: 'sample'},
		    {name: 'is_validated', type:'bool'}
		]);

		this.writer = new Ext.data.JsonWriter({
		    encode: false,
		    writeAllFields: true
		});
		this.store = new Ext.data.Store({
			autoSave:false,
			autoLoad:false,
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
		    writer: this.writer,
		    listeners:{
		    	save:function(){
		    	},
		    	scope:this
		    }
		});

		config = {
			title:'Загрузка тестов...',
			border:false,
			layout:'fit',
			items:[],
			saveOnActivate:true
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.result.BaseColumn.superclass.initComponent.apply(this, arguments);

//		this.revertMappings();

	},

	setActiveRecord: function(rec) {
		this.labOrder = rec;
		this.store.setBaseParam('order',this.labOrder.id);
		this.store.load({
			callback: this.initGrid.createDelegate(this),
			scope:this
		});
	},

	onSave : function(){
		var gs = this.grid.getStore();
		gs.each(function(rec){
			for(k in this.mappings){
				var idx = 'col'+this.mappings[k];
				var name = [rec.data.name,k].join(this.title_delimiter);
				var result = this.store.find('analysis_name',name);
				if(result!=-1){
					result = this.store.getAt(result);
					result.set('value',rec.get(idx));
				} else {
				}
			}
		}, this);
		this.store.save();
	},

	onSubmit : function() {
		App.direct.lab.confirmResults(this.labOrder.id, function(r, e){
			if(r.success) {
				this.labOrder.set('is_completed',true);
				Ext.ux.Growl.notify({
			        title: "Успешная операция!",
			        message: r.message,
			        iconCls: "x-growl-accept",
			        alignment: "tr-tr",
			        offset: [-10, 10]
			    })
			} else {
				Ext.MessageBox.alert('Ошибка!', r.message);
			}
		}, this);
	}
});


Ext.reg('basecolumnwidget', App.result.BaseColumn);
