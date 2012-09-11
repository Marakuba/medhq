Ext.ns('App.examinaiton');

App.examination.QuestApp = Ext.extend(Ext.Panel, {
	initComponent : function() {
		
		this.types = {
			'text':{
				'constructor':Ext.form.TextField,
				'config':{
					width:50
				}
			},
			'checkbox':{
				'constructor':Ext.form.CheckboxGroup,
				'config':{
					fieldLabel:'Введите значения'
				}
			},
			'space':{
				'constructor':Ext.panel,
				'config':{
					height:10
				}
			}
		};
		
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
		
		
		
		var config = {
			id:'questionnaire-app',
			closable:true,
			layout: 'border',	
     		items: [
				this.editor,
				this.previewPanel
			],
			tbar:[
				this.refreshBtn
			]
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.QuestApp.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender',function(){
		},this)
	},
	
	onPreview: function(){
		var data = Ext.decode(this.editor.getData());
		var elems = [];
		if (data.length){
			Ext.each(data,function(obj){
				//Если в редакторе указан тип для текущего элемента
				if (obj['type']){
					//выбираем компонент из словаря компонентов
					var comp = this.types[obj['type']];
					if (comp['constructor']){
						//объединяем пользовательскую и преднастроенную конфигурацию. 
						var config = obj['config'] || {};
						Ext.apply(comp['config']||{},config)
						var elem = new comp['constructor'](config);
						elems.push(elem);
					}	
				}
			},this)
		};
		if (elems.length){
			this.previewPanel.clear();
			this.previewPanel.items.items=elems;
			this.previewPanel.doLayout();
		}
	}
	
});

Ext.reg('questionnaire', App.examination.QuestApp);