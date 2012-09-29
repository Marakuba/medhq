Ext.ns('App.examinaiton');

App.examination.QuestApp = Ext.extend(Ext.Panel, {
	initComponent : function() {
		/*
		 {layout:'auto',
    items:[
    {
        title:'1',
        layout:'tab',
        items:[
        {   
items:[{type:'text',
            value:'555'},{type:'text',
            value:'555'}],
            title:'1',
            
        }, {
            title:'2',
            type:'text',
            value:'666'
        }]
    },{
        title:'2',
        items:[
        {
             type:'text'
         }]
    }]
}
		 */
		
    	this.editor = new App.examination.QuestEditor({
    		region:'west',
    		border:true,
    		width:550,
 			margins:'5 5 5 0'
    	});
    	
		this.previewPanel = new App.examination.QuestPreviewPanel({
			region:'center',
 			margins:'5 5 5 0'
		});
		
		
		this.refreshBtn = new Ext.Button({
			text:'Посмотреть',
			iconCls:'x-tbar-loading',
			handler:this.onPreview.createDelegate(this),
        	scope:this
		});
		
		this.getDataBtn = new Ext.Button({
			text:'Собрать данные',
			handler:function(){
				this.previewPanel.collectData();
			},
			scope:this
		});
		
		
		
		var config = {
			id:'questionnaire-app',
			closable:true,
			layout: 'border',	
     		items: [
				this.editor,
				this.previewPanel
			],
			tbar:[
				this.refreshBtn, this.getDataBtn
			]
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.QuestApp.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender',function(){
		},this)
	},
	
	onPreview: function(){
		//Если после обработки отображаются не все элементы области, заключите область в квадратные скобки []
		//
		var rawdata = this.editor.getData();
		if (!rawdata) return;
		var data = Ext.decode(rawdata);
		if (!data['items']) {
			Ext.Msg.alert('Синтаксическая ошибка','Нет параметра "items"');
			return
		};
		this.previewPanel.clear();
		//добавляем элементы в главную панель
		this.previewPanel.add(this.previewPanel.buildElem(data))
		
		this.previewPanel.doLayout();
		
	}	
});

Ext.reg('questionnaire', App.examination.QuestApp);