Ext.ns('App.form');

App.patient.QuickForm = Ext.extend(Ext.FormPanel, {
	initComponent:function(){
		config = {
		    collapsible: true,
		    split:true,
		    bodyStyle:'padding:5px',
		    header:false,
		    collapseMode: 'mini',
    		autoHeight: true,
    		baseCls:'x-plain',
			defaults:{
				border:false
			},
    		items:[{
				xtype:'textfield',
		    	fieldLabel:'Фамилия',
		    	name:'last_name',
		    	anchor:'96%'
		    },{
		    	xtype:'textfield',
		    	fieldLabel:'Имя',
		    	name:'first_name',
		    	anchor:'96%'
		    },{
		    	xtype:'textfield',
		    	fieldLabel:'Отчество',
		    	name:'mid_name',
		    	anchor:'96%'
		    },{
    			defaults:{
    				labelWidth:100,
    				baseCls:'x-border-layout-ct',
    				border:false
    			},
        		layout:'column',
        		baseCls:'x-border-layout-ct',
        		items:[{
        			columnWidth:.8,
        			layout:'form',
        			defaultType: 'textfield',
				    items:[{
				    	xtype:'datefield',
				    	fieldLabel:'Дата рождения',
				    	format:'d.m.Y',
				    	name:'birth_day',
				    	anchor:'70%'
				    }]
        		},{
        			columnWidth:.2,
        			layout:{
        				type:'form',
        				align:'right'
        			},
				    items:[{
				    	xtype:'button',
				    	text:'Сохранить',
				    	handler:function(){
				    		var record = Ext.getCmp('patient-grid').getSelectionModel().getSelected();
				    		Ext.getCmp('patient-quick-form').getForm().updateRecord(record);
				    	}
			    	}]
        		}]
    		}]
            }
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.patient.QuickForm.superclass.initComponent.apply(this, arguments);
	}
});

Ext.reg('quickform', App.patient.QuickForm);	