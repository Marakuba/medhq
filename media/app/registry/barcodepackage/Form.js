Ext.ns('App.barcodepackage');

App.barcodepackage.Form = Ext.extend(Ext.form.FormPanel, {

	initComponent:function(){
		this.labStore = new Ext.data.JsonStore({
			autoLoad:false,
			proxy: new Ext.data.HttpProxy({
				url:'/api/v1/dashboard/state',
				method:'GET'
			}),
			root:'objects',
			idProperty:'resource_uri',
			fields:['resource_uri','name']
		});
		this.labStore.load();
		this.hasId = this.record ? (this.record.id ? true : false) : false;
		console.log(this.hasId);
		this.lab = {
			layout:'form',
			items:new Ext.form.ClearableComboBox({
				allowBlank:false,
	        	fieldLabel:'Лаборатория',
	        	name:'laboratory',
			    store: this.labStore,
			    typeAhead: true,
			    queryParam:'name__istartswith',
			    minChars:3,
			    triggerAction: 'all',
			    emptyText:'Выберите лабораторию...',
			    valueField: 'resource_uri',
			    displayField: 'name',
			    selectOnFocus:true
			})
		};		
		config = {
			//defaultType:'numberfield',
			defaults:{
				baseCls:'x-border-layout-ct'
			},
			border:false,
			autoHeight:true,
			items: [this.lab, 
			{
				layout:'form',
				labelWidth:50,
				defaults:{width:50},
				title:'Кратность / количество',
				items:[{
					xtype:'numberfield',
					name:'x2',
					fieldLabel:'x2',
					readOnly:this.hasId,
					value:0
				},{
					xtype:'numberfield',
					name:'x3',
					fieldLabel:'x3',
					readOnly:this.hasId,
					value:0
				},{
					xtype:'numberfield',
					name:'x4',
					fieldLabel:'x4',
					readOnly:this.hasId,
					value:0
				},{
					xtype:'numberfield',
					name:'x5',
					fieldLabel:'x5',
					readOnly:this.hasId,
					value:0
				},{
					xtype:'numberfield',
					name:'x6',
					fieldLabel:'x6',
					readOnly:this.hasId,
					value:0
				},{
					xtype:'numberfield',
					name:'x7',
					fieldLabel:'x7',
					readOnly:this.hasId,
					value:0
				},{
					xtype:'numberfield',
					name:'x8',
					fieldLabel:'x8',
					readOnly:this.hasId,
					value:0
				}]
			}]
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.barcodepackage.Form.superclass.initComponent.apply(this, arguments);
		this.on('render', function(){
		}, this);
		this.labStore.on('load', function(){
			if(this.record) {
				this.getForm().loadRecord(this.record);
			}
		}, this);

	}

});