Ext.ns('App.examination');

App.examination.GeneralTemplatePlugin = function(config, order){
	this.config = config || {};
	this.callback = this.config.callback;
	var result = {
		section:'Создать новый шаблон',
		cls:'silk-add',
		objects:[{
			action:'empty',
			type:'',
			title:'Пустой шаблон',
			objectId:''
		}]
	}
	Ext.callback(this.callback, this.config.scope || window, [result, order]);
};

App.examination.TemplateServicePlugin = function(config, order){
	this.config = config || {};
	this.callback = this.config.callback;

	this.results = undefined;

	this.store = new Ext.data.RESTStore({
		autoSave: false,
		autoLoad : false,
		apiUrl : App.getApiUrl('examtemplate'),
		model: App.models.Template
	});
	this.store.load({
		params:{
			deleted:false,
            base_service__isnull:false,
            staff:active_staff
		},
		callback:function(records, opts, success){
			if(success && records.length){
				this.results = {
					section:'Создать из шаблона услуги',
					cls:'silk-add',
					objects:[]
				}
				Ext.each(records, function(rec){
					this.results.objects.push({
						action:'copy',
						type:'tpl',
						title:rec.data.name,
						objectId:rec.data.id
					});
				}, this);
			}
			Ext.callback(this.callback, this.config.scope || window, [this.results, order]);
		},
		scope:this
	})
};



App.examination.TemplateStartPanel = Ext.extend(App.examination.StartPanel, {
	dataPlugins : (function(){
		var plugins = App.examination.StartPanel.prototype.dataPlugins.slice(0);
		plugins.unshift(App.examination.GeneralTemplatePlugin);
		plugins.push(App.examination.TemplateServicePlugin)
		return plugins
	})()
});

Ext.reg('templatestartpanel', App.examination.TemplateStartPanel);
