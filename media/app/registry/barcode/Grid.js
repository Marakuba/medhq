Ext.ns('App.barcode');



App.barcode.Grid = Ext.extend(Ext.grid.EditorGridPanel, {

	initComponent : function() {

		this.proxy = new Ext.data.HttpProxy({
		    url: App.getApiUrl('bc_sampling')
		});

		this.reader = new Ext.data.JsonReader({
		    totalProperty: 'meta.total_count',
		    successProperty: 'success',
		    idProperty: 'id',
		    root: 'objects',
		    messageProperty: 'message'
		}, [
		    {name: 'id'},
		    {name: 'tube_type'},
		    {name: 'services'},
		    {name: 'bc_count'}
		]);

		this.writer = new Ext.data.JsonWriter({
		    encode: false
		});
		this.baseParams = {
		    format:'json',
		    visit:this.visitId,
		    laboratory__type:'b'
		};
		this.store = new Ext.data.Store({
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
		    writer: this.writer
		});

		this.store.on('load', this.updateCount, this);

		this.columns =  [
		    {
		    	header: "Пробирка",
		    	width: 40,
		    	sortable: true,
		    	dataIndex: 'tube_type'
		    },{
		    	header: "Исследования",
		    	width: 55,
		    	sortable: true,
		    	dataIndex: 'services',
		    	renderer:function(v){
		    		return v.join('<br>');
		    	}
		    },{
		    	header: "Количество",
		    	width: 15,
		    	sortable: true,
		    	dataIndex: 'bc_count',
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
			height:300,
			border : false,
			store:this.store,
			columns:this.columns,
			clicksToEdit:1,
			sm : new Ext.grid.RowSelectionModel({
				singleSelect : true
			}),
			viewConfig : {
				forceFit : true
			},
			listeners: {
				afteredit:this.updateCount.createDelegate(this,[])
			},
			bbar:['Всего (с учетом направления):',{
				id:'barcode-total',
				xtype: 'tbtext',
				style:{
					fontSize:'12pt',
					fontWeight:'bold'
				},
				text:'-'
			}]
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.barcode.Grid.superclass.initComponent.apply(this, arguments);
	},

	getCount: function(){
			var c=1;
			this.store.each(function(rec){
				c += rec.data.bc_count;
				return true;
			});
			return c
	},

	updateCount: function(){
			c = this.getCount();
			Ext.getCmp('barcode-total').setText(c);
	}

});
