Ext.ns('App.reporting');

App.reporting.ReportEditor = Ext.extend(Ext.Panel, {
	
    initComponent: function() {
    	
    	this.sqlField = new Ext.form.TextField({
    		name:'sql_query',
    		width:'70'
    	})
    	
    	this.generalInfo = new Ext.Panel({
    		border:false,
    		items:[
    			this.sqlField
    		]
    	})
    	
    	var config = {
			layout: 'fit',
            items: [
            ],
            tbar:[]
        };
        
		Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.reporting.ReportEditor.superclass.initComponent.call(this);
    },
    
    loadData: function(report){
    	this.sqlField.setValue(report.data.sql_query_text)
    }
    
});

Ext.reg('printpanel', App.reporting.ReportEditor);