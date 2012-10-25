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
			style:{
 				borderLeft:"solid 1px #99BBE8"
 			}
		});
		
		this.infoPanel = new Ext.Panel({
			height:40,
			region:'north'
		});
		
		this.enableBubble('preview','copy','edit','empty','loadcomplete');
		
		var config = {
			closable:true,
			bubbleEvents:['preview','copy','edit','empty','loadcomplete'],
			layout: 'border',	
     		items: [
				{
					region:'west',
					width:500,
					layout:'fit',
					autoScroll:true,
					border:false,
					items:this.startView
				},{
					region:'center',
					layout:'border',
					border:false,
					defaults:{
						border:false
					},
					items:[/*this.infoPanel,*/this.previewPanel]
				}
				
			]
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.StartPanel.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender',function(){
//			this.loadMask = new Ext.LoadMask(this.el, {
//				msg:'Подождите...'
//			});
//			this.loadMask.show();
		},this)
		
		var url_map = {
			'card':'card',
			'tpl':'template'
		}
		var url_tpl = "/widget/examination/{0}/{1}/";
		
		this.startView.on('preview', function(objType,objId,d){
			if(objType && objId) {
				var url = String.format(url_tpl,url_map[objType], objId);
				this.previewPanel.load({
					url:url
				})
			} else {
				this.previewPanel.update('<p></p>');
			}
		}, this);
		this.startView.on('loadcomplete', function(){
		}, this);
	}
});


