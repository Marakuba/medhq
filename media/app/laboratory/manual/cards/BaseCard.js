Ext.ns('App.cards');

App.cards.BaseCard = Ext.extend(Ext.Window,{


	/*
	 * Разделитель в названиях. Используется когда применяется группировка по полям или разбивка по колонкам.
	 */
	delimiter : "::",


	/*
	 * Мэппинг названий групп и колонок
	 */
	mappings : {},


	/*
	 * Поле по которому осуществляется группировка
	 */
	groupField : "",


	/*
	 * Режим группировки данных.
	 * Может принимать значения:
	 *  - group - группировка по полю с использованием GroupStore
	 *  - column - группировка по названиям с использованием mappings и разбивкой на колонки
	 */
	mode : "",


	revertMappings : function(){
		this.reMappings = {};
		for(k in this.mappings) {
			this.reMappings[this.mappings[k]] = k;
		}
	},


	initComponent : function(){

		this.labOrderStore = new Ext.data.RESTStore({
			autoSave : true,
			autoLoad : false,
			apiUrl : App.getApiUrl('laborder'),
			model: App.models.LabOrder
		});

		this.proxy = new Ext.data.HttpProxy({
		    url: App.getApiUrl('result')
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
		    		this.onClose();
		    	},
		    	scope:this
		    }
		});

		config = {
			width:900,
			height:550,
			modal:true,
			buttons:[{
				text:'Сохранить',
				handler:this.onSave.createDelegate(this),
				scope:this
			},{
				text:'Закрыть',
				handler:this.onClose.createDelegate(this),
				scope:this
			}]
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.cards.BaseCard.superclass.initComponent.apply(this, arguments);

		this.revertMappings();
		this.loadData();

	},

	processData : function(r, opts, success){
		/*
		 * Базовая имплементация
		 */


		var gs = this.grid.getStore();
		var Result = gs.recordType;
		gs.removeAll();

		if(r.length) {
			var orderId = App.uriToId(r[0].data.order);
			this.labOrderStore.load({
				params:{
					id:orderId
				},
				callback:function(r, opts, success){
					if(r.length){
						this.labOrderRecord = r[0];
						this.fireEvent('laborderload',this.labOrderRecord);
					}
				},
				scope:this
			})
		}

		/*
		 * Обработка колоночного режима
		 */
		if(this.mode=='column'){

			Ext.each(r, function(rec){
				var gCode = rec.get('analysis_code').split('_')[0];
				var result = gs.find('code',gCode);
				var vals = rec.get('analysis_name').split(this.delimiter);
				if(result==-1) {
					var params = {
						name:vals[0],
						code:gCode
					};
					params[this.mappings[vals[1]]] = rec.get('value');
					Ext.apply(params, this.processRow(rec, vals));
					var new_rec = new Result(params);
					gs.add(new_rec);
				} else {
					var result = gs.getAt(result);
					result.set(this.mappings[vals[1]],rec.get('value'));
					Ext.apply(result.data, this.processRow(rec, vals));
				}
			}, this);

		} else if(this.mode=='group') {

			Ext.each(r, function(rec){
				var vals = rec.get('analysis_name').split(this.delimiter);
				var params = {
					name: vals[0],
					code: rec.get('analysis_code'),
					group: vals[1],
					value: rec.get('value'),
					inputlist: rec.get('inputlist')
				}
				var new_rec = new Result(params);
				gs.add(new_rec);
			}, this)
		}


	},

	loadData : function() {
		if(this.record && this.service) {
			this.store.setBaseParam( 'order__visit', App.uriToId(this.record.data.order) );
			this.store.setBaseParam( 'analysis__service', this.service );
			this.store.load({
				callback: this.processData.createDelegate(this),
				scope:this
			})
		}
	},

	onSave : function(){
		var gs = this.grid.getStore();
		if(this.mode=='column'){
			gs.each(function(rec){
				for(k in this.mappings){
					var idx = this.mappings[k];
					var name = [rec.data.name,k].join(this.delimiter);
					var result = this.store.find('analysis_name',name);
					if(result!=-1){
						result = this.store.getAt(result);
						result.set('value',rec.get(idx));
					} else {
					}
				}
			}, this);
			this.store.save();
		} else if(this.mode=='group') {
			gs.each(function(rec){
				var result = this.store.find('analysis_code', rec.get('code'));
				if(result!=-1) {
					result = this.store.getAt(result);
					result.set('value',rec.get('value'));
				}
			}, this);
			this.store.save();
		}
	},

	onClose : function(){
		this.close();
	}

});
