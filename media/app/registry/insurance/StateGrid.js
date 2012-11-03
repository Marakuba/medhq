Ext.ns('App.insurance');

App.insurance.StateGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {

		// Create a standard HttpProxy instance.
		this.proxy = new Ext.data.HttpProxy({
		    url: App.getApiUrl('insurance_state')
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
		    {name: 'name'}
		]);

		this.writer = new Ext.data.JsonWriter({
		    encode: false,
		    writeAllFields: true
		});

		this.store = new Ext.data.Store({
			autoLoad:true,
			autoSave:false,
		    baseParams: {
		    	format:'json'
		    },
		    paramNames: {
			    start : 'offset',  // The parameter name which specifies the start row
			    limit : 'limit',  // The parameter name which specifies number of rows to return
			    sort : 'sort',    // The parameter name which specifies the column to sort on
			    dir : 'dir'       // The parameter name which specifies the sort direction
			},
		    restful: true,     // <-- This Store is RESTful
		    proxy: this.proxy,
		    reader: this.reader,
		    writer: this.writer    // <-- plug a DataWriter into the store just as you would a Reader
		});

		this.columns =  [
		    {
		    	header: "Название",
		    	width: 50,
		    	sortable: true,
		    	dataIndex: 'name',
		    	editor: new Ext.form.TextField({})
		    }
		];

		this.editor = new Ext.ux.grid.RowEditor({
       		saveText: 'Сохранить',
       		cancelText: 'Отменить',
       		listeners:{
       			afteredit:function(editor,changes,rec,i) {
       				this.store.save();
       			},
       			scope:this
       		}
    	});

		var config = {
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			border : false,
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
				handler:this.onAdd.createDelegate(this)
			}],
			viewConfig : {
				forceFit : true,
				emptyText: 'Нет записей'
			}

		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.insurance.StateGrid.superclass.initComponent.apply(this, arguments);
	},

	onAdd: function(){
        var r = new this.store.recordType({
        });
        this.editor.stopEditing();
        this.store.add(r);
        this.editor.startEditing(this.store.getCount()-1);
	}

});
