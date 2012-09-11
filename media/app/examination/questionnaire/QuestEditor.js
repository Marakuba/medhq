Ext.ns('App.examination');

App.examination.QuestEditor = Ext.extend(Ext.form.FormPanel, {
	
    initComponent: function() {
    	
    	this.editorArea = new Ext.form.TextArea({
    		autoScroll:true
    	});
    	
    	var config = {
			layout: 'fit',
			padding:8,
            items: [
            	this.editorArea
            ]
        };
        
		Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.examination.QuestEditor.superclass.initComponent.call(this);
        
        this.on('afterrender',function(){
		},this);
    },
    
    getData: function(){
    	return this.editorArea.getValue();
    }
    
});