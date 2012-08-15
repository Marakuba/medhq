Ext.ns('App.patient');
Ext.ns('App.examination');
Ext.ns('App.billing');

App.examination.PatientCard = Ext.extend(Ext.TabPanel, {
	
	initComponent:function(){
		
		this.cards = [{
			title:'Карты осмотра',
			layout:'fit',
			xtype:'regexamgrid'
		},{
			title:'Предзаказы',
			layout:'fit',
			xtype:'panel',
			border:false,
			items:[{
				xtype:'preordermanager',
				hasPatient:true,
				doctorMode:true,
				border:false,
				referral:this.referral,
				referral_type:this.referral_type,
				preorderCfg:{
					viewConfig:{
						forceFit : false,
						showPreview:true,
						emptyText :'Для данного пациента предзаказов нет',
						enableRowBody:true,
						getRowClass:function(){
							return ''
						}
					}
				},
				assignmentCfg:{
					viewConfig:{
						emptyText :'Для данного пациента направлений нет',
						forceFit : false,
						showPreview:true,
						enableRowBody:true,
						getRowClass:function(record, index, p, store){
							if (record.data.deleted){
		            			return 'preorder-other-place-row-body'
		            		};
		            		if (record.data.confirmed){
		            			return 'preorder-visited-row-body'
		            		}
		            		return ''
						}
					}
				}
			}],
			setActivePatient:function(rec){
				this.items.each(function(item,i){
					if(item.setActivePatient) {
						item.setActivePatient(rec);
					}
				});
			}
		}];
		
		config = {
//			closable:true,
			border:false,
        	defaults: {
				border:false
			},
			enableTabScroll:true,
			header:true,
//	        disabled:true,
    		activeTab:0,
			items:this.cards
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.PatientCard.superclass.initComponent.apply(this, arguments);
		
		App.eventManager.on('globalsearch', this.onGlobalSearch, this); //
		this.on('afterrender',function(){
			this.doRefresh();
		},this);
		this.on('destroy', function(){
			App.eventManager.un('globalsearch', this.onGlobalSearch, this); //
		},this);
	},
	
	onGlobalSearch: function() {
//		this.disable();
	},
	
	setActivePatient: function(rec) {
		this.record = rec;
		//		this.enable();
		this.items.each(function(item,i){
			if(item.setActivePatient) {
				item.setActivePatient(rec);
			}
		});
	},
	
	doRefresh : function() {
		if(this.record) {
			this.setActivePatient(this.record);
		}
	}
	
	
});

Ext.reg('exampatientcard', App.examination.PatientCard);