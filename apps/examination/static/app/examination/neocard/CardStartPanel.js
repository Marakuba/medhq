Ext.ns('App.examination');
Ext.ns('Ext.ux');

App.examination.CardStartPanel = Ext.extend(Ext.Panel, {
	
    initComponent: function() {
    	this.radio = 'empty';
    	this.printName = true; //в таблице шаблонов отображать колонку 'print_name'
    	
    	this.tmpGrid = new App.examination.TmpGrid({
//			hidden:true,
			autoScroll:true,
			border:false,
			emptyTbar:true,
			listeners: {
				rowselect:this.onPreview.createDelegate(this,['tmp']),
				rowdblclick:this.onNext.createDelegate(this),
				scope:this
			}
			
		});
		
        this.cardGrid = new App.examination.CardGrid({
//        	hidden:true,
        	emptyTbar:true,
        	
        	baseParams:{
        		ordered_service:App.utils.uriToId(this.ordered_service)
        	},
			printName:this.printName,
			listeners: {
				rowdblclick:this.onNext.createDelegate(this),
				rowselect:this.onPreview.createDelegate(this,['card']),
				scope:this
			}
			
		});
		
		this.gridPanel = new Ext.Panel({
			layout:'card',
			region:'center',
			hidden:true,
			items:[
				this.cardGrid, this.tmpGrid
			]
		})
        
		this.previewPanel = new Ext.Panel({
			region: 'south',
            height: 250,
            width: 100,
            border: false,
            hidden:true,
//            title: 'Просмотр',
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
		
		this.fromTmpRadio = new Ext.form.Radio({
            boxLabel: 'Из шаблона',
            name: 'input-choice', 
            inputValue: 'service',
            listeners:{
            	check: function(r,checked){
            		if (checked){
            			this.radio = r.inputValue;
            			if(!this.gridPanel.hidden){
            				this.gridPanel.hide();
            			};
        				this.tmpStore.setBaseParam('staff',App.utils.uriToId(this.staff));
        				this.tmpStore.setBaseParam('base_service',App.utils.uriToId(this.service));
        				delete this.tmpStore.baseParams['base_service__isnull'];
        				delete this.tmpStore.baseParams['staff__isnull'];
//                				this.printName = false;
        				this.tmpStore.load({callback:function(){
        					this.tmpGrid.getSelectionModel().selectFirstRow();
        				},scope:this});
            		}
            	},
            	scope:this
            }
        });
        
        this.continueCardRadio = new Ext.form.Radio({
            boxLabel: 'Продолжить карту осмотра',
            name: 'input-choice', 
            inputValue: 'card',
            listeners:{
            	check: function(r,checked){
            		if (checked){
            			this.radio = r.inputValue;
            			if(this.gridPanel.hidden){
            				this.gridPanel.show();
            			};
            			this.gridPanel.layout.setActiveItem(0);
        				delete this.cardStore.baseParams['ordered_service__order__patient'];
        				delete this.cardStore.baseParams['ordered_service__staff__staff'];
        				this.cardStore.setBaseParam('ordered_service',App.utils.uriToId(this.ordered_service));
        				this.cardStore.load({callback:function(records){
        					if (!records.length){
        						this.previewPanel.hide();
        						return
        					}
        					this.cardGrid.getSelectionModel().selectFirstRow();
        				},scope:this});
            		}
            	},
            	scope:this
            }
        });
        
        this.fromCardRadio = new Ext.form.Radio({
            boxLabel: 'из предыдущих карт осмотра',
            name: 'input-choice', 
            inputValue: 'other_card',
            listeners:{
            	check: function(r,checked){
            		if (checked){
            			this.radio = r.inputValue;
            			if(this.gridPanel.hidden){
            				this.gridPanel.show();
            			};
            			this.gridPanel.layout.setActiveItem(0);
        				delete this.cardStore.baseParams['ordered_service'];
        				this.cardStore.setBaseParam('ordered_service__order__patient',this.patient);
        				this.cardStore.setBaseParam('ordered_service__staff__staff',WebApp.active_staff);
        				this.cardStore.load({callback:function(records){
        					if (!records.length){
        						this.previewPanel.hide();
        						return
        					}
        					this.cardGrid.getSelectionModel().selectFirstRow();
        				},scope:this});
            		}
            	},
            	scope:this
            }
        });
        
        this.emptyCardRadio = new Ext.form.Radio({
            boxLabel: 'Пустая карта осмотра',
            name: 'input-choice', 
            inputValue: 'empty', 
            checked: true,
            listeners:{
            	check: function(r,checked){
            		if (checked){
            			this.radio = r.inputValue;
            			this.gridPanel.hide();
            			this.previewPanel.hide();
            		}
            	},
            	afterrender : function(r){
            		Ext.QuickTips.register({
        				autoHide:true,
        			    target: r.wrap,
        			    title: 'Пустая карта осмотра',
        			    text: 'Все разделы и подразделы задаются вручную.',
        			    width: 300,
        			    dismissDelay: 3000
        			});
            	},
            	scope:this
            }
        });
        
        this.fromPresetRadio = new Ext.form.Radio({
            boxLabel: 'Шаблоны клиники',
            name: 'input-choice', 
            inputValue: 'preset',
            listeners:{
            	check: function(r,checked){
            		if (checked){
            			this.radio = r.inputValue;
            			if (this.gridPanel.hidden) this.gridPanel.show();
            			this.gridPanel.layout.setActiveItem(1);
        				this.tmpStore.setBaseParam('base_service__isnull',true);
        				this.tmpStore.setBaseParam('staff__isnull',true);
        				delete this.tmpStore.baseParams['staff'];
        				delete this.tmpStore.baseParams['base_service'];
        				this.printName = true;
        				this.tmpStore.load({callback:function(records){
        					if(!records.length){
        						this.previewPanel.hide();
        						return
        					}
        					this.tmpGrid.getSelectionModel().selectFirstRow();
        				},scope:this});
            		}
            	},
            	scope:this
            }
        });
        
        this.fromArchiveRadio = new Ext.form.Radio({
            boxLabel: 'Мои шаблоны',
            name: 'input-choice', 
            inputValue: 'archive',
            listeners:{
            	check: function(r,checked){
            		if (checked){
            			this.radio = r.inputValue;
            			if (this.gridPanel.hidden) this.gridPanel.show();
            			this.gridPanel.layout.setActiveItem(1);
        				this.tmpStore.setBaseParam('base_service__isnull',true);
        				this.tmpStore.setBaseParam('staff',App.utils.uriToId(this.staff));
        				delete this.tmpStore.baseParams['staff__isnull'];
        				delete this.tmpStore.baseParams['base_service'];
        				this.printName = true;
        				this.cardGrid.hide();
        				this.tmpStore.load({callback:function(){
        					this.tmpGrid.getSelectionModel().selectFirstRow();
        				},scope:this});
            		}
            	},
            	scope:this
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
                    items: [{
                            xtype: 'panel',
                            items: [this.continueCardRadio]
                    	},{
                    		 xtype: 'panel',
                            items: [this.fromCardRadio]
                    	},{
                            xtype: 'panel',
                            items: [this.fromTmpRadio],
                            listeners:{
                            	scope:this,
                            	afterrender: function(panel){
                            		panel.body.on('dblclick', function(e, t){
                            			if (!this.fromTmpRadio.disabled){
                            				this.fromTmpRadio.setValue(true);
                            				this.onNext();
                            			} 
				                	},this)
                            	}
                            }
                    	},{
                            xtype: 'panel',
                            items: [this.emptyCardRadio],
                            listeners:{
                            	scope:this,
                            	afterrender: function(panel){
                            		panel.body.on('dblclick', function(e, t){
                            			if (!this.emptyCardRadio.disabled){
                            				this.emptyCardRadio.setValue(true);
                            				this.onNext();
                            			} 
				                	},this)
                            	}
                            }
                        },
                        {
                            xtype: 'panel',
                            items: [this.fromPresetRadio]
                        },
                        {
                            xtype: 'panel',
                            items: [this.fromArchiveRadio]
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
                
                this.gridPanel,

                this.previewPanel
            ]
        };
        
		Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.examination.CardStartPanel.superclass.initComponent.call(this);
        this.on('afterrender',function(){
        	this.cardStore = this.cardGrid.store;
        	this.tmpStore = this.tmpGrid.store;
            this.tmpStore.setBaseParam('base_service',App.utils.uriToId(this.service));
			this.cardStore.load({callback:function(records){
				if (records.length){
					this.continueCardRadio.setValue(true);
					this.cardGrid.getSelectionModel().selectFirstRow();
					this.onPreview('card');
					this.radio = 'card';
					//Проверяем, есть ли шаблон к этой услуге. если нету, то надо заблокировать соответствующий пункт
					this.tmpStore.load({callback:function(recs){
						if (!recs.length){
							this.fromTmpRadio.disable();
						};
					},scope:this});
				} else {
					this.continueCardRadio.disable();
					this.tmpStore.load({callback:function(recs){
						if (recs.length){
							this.fromTmpRadio.setValue(true);
							this.tmpGrid.getSelectionModel().selectFirstRow();
							this.radio = 'tmp';
						} else {
							this.fromTmpRadio.disable();
						};
						
						if (this.radio =='empty'){
							this.emptyCardRadio.setValue(true);
						}
					},scope:this});
				};
			},scope:this});
        });
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
    	
    	switch (this.radio){
    		case 'empty':
    			this.fireEvent('opentmp');
    			break;
    		case 'card':
    			var record = this.cardGrid.getSelectionModel().getSelected();
	    		if (record){
	    			this.fireEvent('editcard',record)
	    		} else {
	    			console.log('не выбран источник')
	    		}
	    		break;
	    	case 'other_card':
	    		var record = this.cardGrid.getSelectionModel().getSelected();
	    		if (record){
	    			this.fireEvent('opentmp',record)
	    		} else {
	    			console.log('не выбран источник')
	    		}
	    		break;
	    	case 'preset':
	    	case 'archive':
	    	case 'tmp':
	    		var record = this.tmpGrid.getSelectionModel().getSelected();
	    		if (record){
	    			this.fireEvent('opentmp',record)
	    		} else {
	    			console.log('не выбран источник')
	    		};
	    		break
	    	case 'service':
	    		var record = this.tmpGrid.getSelectionModel().getSelected();
	    		if (record){
	    			this.fireEvent('opentmp',record)
	    		} else {
	    			console.log('не выбран источник')
	    		};
	    		break
    	}
	},
	
	onPreview: function(type){
		if (!type){
			return false
		};
		if (type=='card'){
			var source = 'card'
		} else {
			var source = 'template'
		}
		this.previewPanel.removeAll(true);
		var record = this[type+'Grid'].getSelectionModel().getSelected();
//		console.log(record)
		if (record) {
			var list = new Ext.Panel({
				border:false,
				autoLoad:String.format('/widget/examination/{0}/{1}/',source,record.data.id)
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
		if (this.radio=='card'){
			var source = 'card';
			var gridname = 'card';
		} else {
			var source = 'template';
			var gridname = 'tmp';
		}
		var record = this[gridname+'Grid'].getSelectionModel().getSelected();
		if (!record) {
			return false
		}
		WebApp.fireEvent('launchapp','panel',{
			title:'Просмотр: ' + record.data.print_name,
			closable:true,
			autoLoad:String.format('/widget/examination/{0}/{1}/',source,record.data.id)
		});
	},
	
	tmpEdit: function(){
		var record = this.tmpGrid.getSelectionModel().getSelected();
		if(record){
			this.fireEvent('edittmp',record);
		}
	}
});