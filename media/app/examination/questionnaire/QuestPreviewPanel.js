Ext.ns('App.examination');

App.examination.QuestPreviewPanel = Ext.extend(Ext.Panel, {
	
    initComponent: function() {
    	
    	var config = {
    		autoScroll:true,
			layout: 'form',
			title:'Предпросмотр',
			padding:3,
			labelWidth:10,
			items:[]
        };
        
		Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.examination.QuestPreviewPanel.superclass.initComponent.call(this);
    },
    
    clear: function(){
    	this.items.clear();
    	this.update();
    	
    }
    
});

