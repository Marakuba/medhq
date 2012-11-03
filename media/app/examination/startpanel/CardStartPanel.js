Ext.ns('App.examination');

App.examination.GeneralCardPlugin = function(config, order){
	this.config = config || {};
	this.callback = this.config.callback;
	var result = {
		section:'Новая карта',
		cls:'silk-add',
		objects:[{
			action:'empty',
			type:'',
			title:'Создать пустую карту',
			objectId:''
		}]
	}
	if(this.config.baseServiceId){
		App.direct.service.getTplForService(this.config.baseServiceId, function(res){
			if(res && res.success) {
				console.info(res.data);
				result.objects.unshift({
					action:'copy',
					type:'tpl',
					title:'Из шаблона услуги: <b>'+res.data.title+'</b>',
					objectId:res.data.id
				});
			}
			Ext.callback(this.callback, this.config.scope || window, [result, order]);
		});
	} else {
		Ext.callback(this.callback, this.config.scope || window, [result, order]);
	}
};

App.examination.ResumeCardPlugin = function(config, order){
	this.config = config || {};
	this.callback = this.config.callback;

	this.results = undefined;

	this.store = new Ext.data.RESTStore({
		autoSave: false,
		autoLoad : false,
		apiUrl : App.getApiUrl('card'),
		model: App.models.Card
	});
	this.store.load({
		params:{
			deleted:false,
			ordered_service__staff:active_profile,
			ordered_service:this.config.orderId
		},
		callback:function(records, opts, success){
			if(success && records.length){
				this.results = {
					section:'Продолжить редактирование уже созданных карт',
					cls:'silk-pencil',
					objects:[]
				}
				Ext.each(records, function(rec){
					this.results.objects.push({
						action:'edit',
						type:'card',
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


App.examination.PreviousCardPlugin = function(config, order){
	this.config = config || {};
	this.callback = this.config.callback;

	this.results = undefined;

	this.store = new Ext.data.RESTStore({
		autoSave: false,
		autoLoad : false,
		apiUrl : App.getApiUrl('card'),
		model: App.models.Card
	});
	this.store.load({
		params:{
			deleted:false,
			ordered_service__staff:active_profile,
			ordered_service__order__patient:config.patientId
		},
		callback:function(records, opts, success){
			if(success && records.length){
				this.results = {
					section:'Создать из предыдущих карт',
					cls:'silk-add',
					objects:[]
				}
				Ext.each(records, function(rec){
					if(App.uriToId(rec.data.ordered_service)!=this.config.orderId){
						this.results.objects.push({
							action:'copy',
							type:'card',
							title:rec.data.name,
							objectId:rec.data.id
						});
					}
				}, this);
			}
			Ext.callback(this.callback, this.config.scope || window, [this.results, order]);
		},
		scope:this
	})
};

App.examination.CardStartPanel = Ext.extend(App.examination.StartPanel, {
	dataPlugins : (function(){
		var plugins = App.examination.StartPanel.prototype.dataPlugins.slice(0);
		plugins.unshift(App.examination.GeneralCardPlugin);
		plugins.unshift(App.examination.ResumeCardPlugin);
		plugins.splice(2,0,App.examination.PreviousCardPlugin);
		return plugins
	})()
});

Ext.reg('cardstartpanel', App.examination.CardStartPanel);
