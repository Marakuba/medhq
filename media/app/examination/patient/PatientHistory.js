Ext.ns('App','App.examination');
Ext.ns('App.ServicePanel','App.ux.tree');
Ext.ns('Ext.ux');

App.examination.PatientHistory = Ext.extend(Ext.Panel, {
	initComponent : function() {
		
		this.patientPanel = new App.examination.PatientHistoryPanel ({
			region:'west',
			patient:this.patient,
			patient_name:this.patient_name,
			width:650,
			border: false,
			collapsible:true,
			collapseMode:'mini',
			split:true,
			listeners:{
    			nodeclick: function(node){
    				this.contentPanel.removeAll();
    				var ids = node.attributes.id.split('_');
    				var prefix = ids[0];
    				if (prefix=='exam'){
    					var address = String.format('/widget/examination/card/{0}/',ids[1]);
    				};
    				if (prefix=='labservice'){
    					var address = String.format('/widget/lab/{0}/',ids[1]);
    				};
    				if (prefix=='manuallabservice'){
    					var address = String.format('/widget/lab/manual/{0}/',ids[1]);
    				};
    				var list = new Ext.Panel({
						autoLoad:address,
						autoScroll:true
					});
					this.contentPanel.add(list);
					this.contentPanel.doLayout();
    			},
    			scope:this
    		}
		});
		
		this.contentPanel = new Ext.Panel({
			region:'center',
 			border:true,
 			margins:'5 5 5 0',
 			layout: 'fit',
 			title:'Выберите действие',
 			defaults:{
 				border:false
 			},
    		items: [
    		]
		});
	
		var config = {
			closable:true,
			title: 'История пациента',
			layout: 'border',	
     		items: [
				this.patientPanel,
				this.contentPanel
			]
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.PatientHistory.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender',function(){
			
		},this);
		
	}
	
});


Ext.reg('patienthistory', App.examination.PatientHistory);
