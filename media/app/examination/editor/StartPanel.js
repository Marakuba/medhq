Ext.ns('App.examination');
Ext.ns('Ext.ux');

App.examination.StartPanel = Ext.extend(Ext.Panel, {
	
    initComponent: function() {
    	this.radio = 'empty';
    	this.printName = true;
    	
        this.proxy = new Ext.data.HttpProxy({
        	url: get_api_url('examtemplate')
        });
		this.baseParams = {
            format:'json'
        };
    
        this.reader = new Ext.data.JsonReader({
            totalProperty: 'meta.total_count',
            successProperty: 'success',
            idProperty: 'id',
            root: 'objects',
            messageProperty: 'message'
        }, [
            {name: 'id'},
			{name: 'resource_uri'},
			{name: 'print_name'},
			{name: 'print_date'},
			{name: 'base_service'},
			{name: 'service_name'},
			{name: 'staff'},
			{name: 'data'}
        ]);
    
        this.writer = new Ext.data.JsonWriter({
            encode: false,
            writeAllFields: true
        }); 
    
        this.tmpStore = new Ext.data.Store({
            restful: true,    
            autoLoad: false, 
			autoDestroy:true,
            baseParams: this.baseParams,
		    paramNames: {
			    start : 'offset',
			    limit : 'limit',
			    sort : 'sort',
			    dir : 'dir'
			},
            proxy: this.proxy,
            reader: this.reader,
            writer: this.writer
        });
    	
    	this.tmpGrid = new Ext.grid.GridPanel({
			store: this.tmpStore,
			hidden:true,
			region:'center',
			autoScroll:true,
			columns:  [
			    {
			    	header: "Наименование", 
			    	width:400,
			    	sortable: true, 
			    	hidden:false,
			    	dataIndex: 'print_name',
			    	renderer:this.printNameRenderer()
			    },{
			    	header: "Наименование1", 
			    	width:400,
			    	sortable: true, 
			    	hidden:true,
			    	dataIndex: 'service_name' 
			    }
			],
			viewConfig:{
				forceFit:true
			},
			listeners: {
				rowclick:this.onPreview,
				scope:this
			}
			
		});
		
		this.previewPanel = new Ext.Panel({
			region: 'south',
            height: 250,
            width: 100,
            border: false,
            hidden:true,
            title: 'Просмотр',
            autoScroll:true,
            tbar: {
                xtype: 'toolbar',
                items: [
                    {
                        xtype: 'button',
                        text: 'Открыть в новом окне',
                        handler: this.previewInTab,
                        scope: this
                    }
                ]
            }
        });
    	
    	var config = {
			layout: 'border',
			autoScroll:true,
            items: [
                {
                    xtype: 'form',
                    height: 55,
                    defaults: {
                        header: false,
                        layout: 'form',
                        border: false,
                        hideLabels: true,
                        padding: 15,
                        baseCls: 'x-plain'
                    },
                    layout: 'hbox',
                    baseCls: 'x-plain',
                    border: false,
                    region: 'north',
                    align: 'stretch',
                    items: [
                        {
                            xtype: 'panel',
                            items: [
                                {
                                    xtype: 'radio',
                                    boxLabel: 'Пустой шаблон',
                                    name: 'input-choice', 
                                    inputValue: 'empty', 
                                    checked: true,
                                    listeners:{
                                    	check: function(r,checked){
                                    		if (checked){
                                    			this.radio = r.getValue().inputValue;
                                    			this.tmpGrid.hide();
                                    			this.previewPanel.hide();
                                    		}
                                    	},
                                    	scope:this
                                    }
                                }
                            ]
                        },
                        {
                            xtype: 'panel',
                            title: 'My Panel',
                            items: [
                                {
                                    xtype: 'radio',
                                    boxLabel: 'Из заготовки',
                                    name: 'input-choice', 
                                    inputValue: 'preset',
                                    listeners:{
                                    	check: function(r,checked){
                                    		if (checked){
                                    			this.radio = r.getValue().inputValue;
                                    			if (!this.previewPanel.hidden){
                                    				this.previewPanel.hide();
                                    			};
                                				this.tmpStore.setBaseParam('base_service__isnull',true);
                                				this.tmpStore.setBaseParam('staff__isnull',true);
                                				delete this.tmpStore.baseParams['staff'];
                                				this.printName = true;
                                				this.tmpStore.load({callback:function(){
                                					this.tmpGrid.getSelectionModel().selectFirstRow();
                                					this.onPreview();
                                				},scope:this});
                                				if (this.tmpGrid.hidden){
                            						this.tmpGrid.show();
                            					};
                                    				
                                    		}
                                    	},
                                    	scope:this
                                    }
                                }
                            ]
                        },
                        {
                            xtype: 'panel',
                            items: [
                                {
                                    xtype: 'radio',
                                    boxLabel: 'Из архива',
                                    name: 'input-choice', 
                                    inputValue: 'archive',
                                    listeners:{
                                    	check: function(r,checked){
                                    		if (checked){
                                    			this.radio = r.getValue().inputValue;
                                    			if (!this.previewPanel.hidden){
                                    				this.previewPanel.hide();
                                    			};
                                				this.tmpStore.setBaseParam('base_service__isnull',true);
                                				this.tmpStore.setBaseParam('staff',App.uriToId(this.staff));
                                				delete this.tmpStore.baseParams['staff__isnull'];
                                				this.printName = true;
                                				this.tmpStore.load({callback:function(){
                                					this.tmpGrid.getSelectionModel().selectFirstRow();
                                					this.onPreview();
                                				},scope:this});
                                				if (this.tmpGrid.hidden){
                            						this.tmpGrid.show();
                            					};
                                    		}
                                    	},
                                    	scope:this
                                    }
                                }
                            ]
                        },
                        {
                            xtype: 'panel',
                            items: [
                                {
                                    xtype: 'radio',
                                    boxLabel: 'Из услуги',
                                    name: 'input-choice', 
                                    inputValue: 'service',
                                    listeners:{
                                    	check: function(r,checked){
                                    		if (checked){
                                    			this.radio = r.getValue().inputValue;
                                    			if (!this.previewPanel.hidden){
                                    				this.previewPanel.hide();
                                    			};
                                				this.tmpStore.setBaseParam('staff',App.uriToId(this.staff));
                                				this.tmpStore.setBaseParam('base_service__isnull',false);
                                				delete this.tmpStore.baseParams['staff__isnull'];
                                				this.printName = false;
                                				this.tmpStore.load({callback:function(){
                                					this.tmpGrid.getSelectionModel().selectFirstRow();
                                					this.onPreview();
                                				},scope:this});
                                				if (this.tmpGrid.hidden){
                            						this.tmpGrid.show();
                            					};
                                    		}
                                    	},
                                    	scope:this
                                    }
                                }
                            ]
                        },
                        {
                            xtype: 'panel',
                            layout: 'hbox',
                            padding: 9,
                            flex: 1,
                            align: 'middle',
                            pack: 'end',
                            padding: 9,
                            items: [
                                {
                                    xtype: 'button',
                                    text: 'Далее →',
                                    width: 80,
                                    scale: 'large',
                                    handler: this.onNext.createDelegate(this),
                                    scope:this
                                }
                            ]
                        }
                    ]
                },
                
                this.tmpGrid,

                this.previewPanel
            ]
        };
        
		Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.examination.StartPanel.superclass.initComponent.call(this);
    },
    
    printNameRenderer: function(){
    	var self = this;
    	return function(value,metaData,record){
    		if (self.printName){
    			return value
    		} else {
    			return record.data.service_name
    		}
    	}
    },
    
    onNext: function(){
    	
    	if (this.radio === 'empty'){
    		this.fireEvent('opentmp');
    	} else {
    		var record = this.tmpGrid.getSelectionModel().getSelected();
    		if (record){
    			console.log(record);
    			this.fireEvent('opentmp',record)
    		} else {
    			console.log('не выбран шаблон')
    		}
    	}
	},
	
	onPreview: function(){
		this.previewPanel.removeAll(true);
		var record = this.tmpGrid.getSelectionModel().getSelected();
		if (record) {
			var list = new Ext.Panel({
				autoLoad:String.format('/widget/examination/template/{0}/',record.data.id)
			});
			this.previewPanel.add(list);
			this.previewPanel.doLayout();
			this.previewPanel.show();
		} else {
			if (!this.previewPanel.hidden){
				this.previewPanel.hide();
			}
		}
		this.doLayout();
	},
	
	previewInTab: function(){
		var record = this.tmpGrid.getSelectionModel().getSelected();
		if (!record) {
			return false
		}
		App.eventManager.fireEvent('launchapp','panel',{
			title:'Просмотр: ' + record.data.print_name,
			closable:true,
			autoLoad:String.format('/widget/examination/template/{0}/',record.data.id)
		});
	}
});