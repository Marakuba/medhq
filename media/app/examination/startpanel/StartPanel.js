Ext.ns('App.examination');

App.examination.StartPanel = Ext.extend(Ext.Panel, {
	dataPlugins : [App.examination.StaffTemplatePlugin, 
		           App.examination.StateTemplatePlugin],

	initComponent : function() {
		
		this.startView = new App.examination.StartView({
			dataPlugins:this.dataPlugins,
			orderId:this.orderId,
			patientId:this.patientId,
			baseServiceId:this.baseServiceId
		});
		
		this.previewPanel = new Ext.Panel({
			region:'center',
			autoScroll:true,
			html:'...'
		});
		
		this.enableBubble('preview','copy','edit','empty');
		
		var config = {
			closable:true,
			bubbleEvents:['preview','copy','edit','empty'],
			layout: 'border',	
     		items: [
				{
					region:'west',
					width:500,
					layout:'fit',
					autoScroll:true,
					items:this.startView
				},
				this.previewPanel
			]
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.StartPanel.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender',function(){
		},this)
		
		var url_map = {
			'card':'card',
			'tpl':'template'
		}
		var url_tpl = "/widget/examination/{0}/{1}/";
		
		this.startView.on('preview', function(objType,objId){
			if(objType && objId) {
				var url = String.format(url_tpl,url_map[objType], objId);
				this.previewPanel.load({
					url:url
				})
			} else {
				this.previewPanel.update('<h1>Создание пустой карты</h1>');
			}
		}, this);
	}
});


