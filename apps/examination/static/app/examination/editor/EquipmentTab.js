Ext.ns('App.examination');
Ext.ns('Ext.ux');

App.examination.EquipmentTab = Ext.extend(Ext.form.FormPanel, {
	initComponent : function() {

//		this.equipCB = new LazyComboBox({});

		this.equipStore = new Ext.data.Store({
	        baseParams: {
	    		format:'json'
		    },
		    restful: true,
		    autoSave:false,
		    autoLoad:false,
		    reader: new Ext.data.JsonReader({
			    idProperty: 'id',
		        root: 'objects',
		        successProperty: 'success',
		        messageProperty: 'message'
		    }, [
	            {name: 'id'},
				{name: 'resource_uri'},
				{name: 'name'}
	        ]),
		    writer: new Ext.data.JsonWriter({
		    	encode: false,
			    writeAllFields: true
			}),
		    paramNames: {
			    start : 'offset',
			    limit : 'limit',
		    	sort : 'sort',
			    dir : 'dir'
			},
			proxy: new Ext.data.HttpProxy({
		    	url: App.utils.getApiUrl('examination','exam_equipment'),
		    	method:'GET'
			})
	    });

	    this.equipCB = new Ext.form.LazyComboBox({
			fieldLabel:'Оборудование',
			hideTrigger:false,
			anchor:'100%',
			name:'equipment',
            allowBlank:false,
			store: this.equipStore,
			typeAhead: true,
			queryParam:'name__istartswith',
			minChars:3,
			triggerAction: 'all',
			emptyText:'Выберите оборудование...',
			valueField: 'resource_uri',
			displayField: 'name',
			selectOnFocus:true,
			listeners:{
				'select': function(combo,rec,ind){
					this.setData('equipment',rec.data.resource_uri)
				},
				scope:this
			}
		});


		var config = {

//		    height: 636,
//		    width: 771,
		    padding: 10,
		    title: 'Оборудование',
		    labelAlign: 'top',
		    autoSctoll:true,
		    closable:true,
		    items: [
		        this.equipCB,
		        {
		            xtype: 'textarea',
		            anchor: '100%',
		            name:'area',
		            listeners:{
		            	change:function(field,value){
		            		this.setData('area',value)
		            	},
		            	scope:this
		            },
		            fieldLabel: 'Область исследования'
		        },
		        {
		            xtype: 'textfield',
		            anchor: '100%',
		            name:'scan_mode',
		            listeners:{
		            	change:function(field,value){
		            		this.setData('scan_mode',value)
		            	},
		            	scope:this
		            },
		            fieldLabel: 'Режим сканирования'
		        },
		        {
		            xtype: 'textfield',
		            anchor: '100%',
		            name:'contrast_enhancement',
		            listeners:{
		            	change:function(field,value){
		            		this.setData('contrast_enhancement',value)
		            	},
		            	scope:this
		            },
		            fieldLabel: 'Контрастное усиление'
		        },
		        {
		            xtype: 'panel',
		            layout: 'form',
		            labelAlign: 'left',
		            border: false,

		            anchor: '',
		            items: [
		                {
		                    xtype: 'compositefield',
		                    hideLabel:true,
		                    items: [
		                    	{
		                            xtype: 'displayfield',
		                            width: 80,
		                            value: 'Ширина/шаг:',
		                            flex: 1
		                        },
		                        {
		                            xtype: 'textfield',
		                            width: 50,
		                            name:'width',
		                            listeners:{
						            	change:function(field,value){
						            		this.setData('width',value)
						            	},
						            	scope:this
						            },
		                            flex: 1
		                        },
		                        {
		                            xtype: 'displayfield',
		                            width: 210,
		                            value: 'Толщина реконструктивного среза:',
		                            flex: 1
		                        },
		                        {
		                            xtype: 'textfield',
		                            width: 50,
		                            name:'thickness',
		                            listeners:{
						            	change:function(field,value){
						            		this.setData('thickness',value)
						            	},
						            	scope:this
						            },
		                            flex: 1
		                        }
		                    ]
		                }
		            ]
		        }
		    ]
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.EquipmentTab.superclass.initComponent.apply(this, arguments);

		this.on('afterrender',function(){

		});
	},

	setData:function(field,value){
		this.fireEvent('setdata',field,value);
	},

	loadRecord:function(record){
		this.getForm().loadRecord(record);
		if (record.data.equipment){
			this.equipCB.forceValue(record.data.equipment);
		}
	}



});
