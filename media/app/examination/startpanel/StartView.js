Ext.ns('App.examination');

/*
 * 
 * plugin result:
 * 
 * { 
 * 		section:'section_name', 
 * 		objects:[{ 
 * 			type:'empty|servicetpl|currentcard|card|stafftpl|statetpl|service|',
 * 			title:'title', 
 * 			modified:Date(), 
 * 			created:Date(), 
 * 			objectId:1
 * 		}]
 * 	}
 * 
 */


App.examination.StaffTemplatePlugin = function(config, order){
	this.config = config || {};
	this.callback = this.config.callback;

	this.results = undefined;

	this.store = new Ext.data.RESTStore({
		autoSave: false,
		autoLoad : false,
		apiUrl : get_api_url('examtemplate'),
		model: App.models.Template
	});
	this.store.load({
		params:{
			deleted:false,
            staff:active_staff,
            base_service__isnull:true
		},
		callback:function(records, opts, success){
			if(success && records.length){
				this.results = {
					section:'Мои шаблоны',
					cls:'silk-add',
					objects:[]
				}
				Ext.each(records, function(rec){
					this.results.objects.push({
						action:'copy',
						type:'tpl',
						title:rec.data.print_name,
						objectId:rec.data.id
					});
				}, this);
			}
			Ext.callback(this.callback, this.config.scope || window, [this.results, order]);
		},
		scope:this
	})
};

App.examination.StateTemplatePlugin = function(config, order){
	this.config = config || {};
	this.callback = this.config.callback;

	this.results = undefined;

	this.store = new Ext.data.RESTStore({
		autoSave: false,
		autoLoad : false,
		apiUrl : get_api_url('examtemplate'),
		model: App.models.Template
	});
	this.store.load({
		params:{
			deleted:false,
            base_service__isnull:true,
            staff__isnull:true
		},
		callback:function(records, opts, success){
			if(success && records.length){
				this.results = {
					section:'Шаблоны клиники',
					cls:'silk-add',
					objects:[]
				}
				Ext.each(records, function(rec){
					this.results.objects.push({
						action:'copy',
						type:'tpl',
						title:rec.data.print_name,
						objectId:rec.data.id
					});
				}, this);
			}
			Ext.callback(this.callback, this.config.scope || window, [this.results, order]);
		},
		scope:this
	})
};


App.examination.StartView = Ext.extend(Ext.DataView, {

	dataPlugins : this.dataPlugins,
		           
	plainResults : function(results){
		var r = [], result_order = [];
		for(idx in results){
			result_order.push(idx);
		}
		Ext.each(result_order.sort(), function(k){
			var res = results[k];
			if(res) {
				if(res.section){
					r.push({
						id:res.section+'0',
						type:'group',
						title:res.section,
						cls:res.cls
					});
				}
				Ext.each(res.objects, function(obj,i){
					obj.id = res.section+"_"+(i+1);
					r.push(obj);
				});
			}
		});
		return r
	},
	
	pluginCallback : function(d, order){
		this.results[order] = d;
		this.steps-=1;
		if(this.steps==0){
			this.store.loadData(this.plainResults(this.results));
			this.select(0);
			var rec = this.store.getAt(1);
			this.fireEvent('preview', rec.data.type, rec.data.objectId);
		}
	},
	
	runPlugins : function(config){
		this.steps = this.dataPlugins.length;
		config.callback = this.pluginCallback;
		config.scope = this;
		Ext.each(this.dataPlugins, function(plugin,order){
			plugin(config,order);
		}, this)
	},
	
	results : {},

    initComponent : function() {
    	
    	/*
    	 * требуется запись из журнала заказов
    	 * 
    	 * из неё обязательны поля: id, service
    	 * 
    	 */
    	
    	this.addEvents('preview','copy','edit','empty');
    	
		var config = {
		    itemSelector : 'div.item',
		    overClass    : 'item-over',
		    selectedClass    : 'item-selected',
		    tpl          : new Ext.XTemplate(
		    	'<div id="startView">',
		            '<tpl for=".">',
		            
		            '<tpl if="type != \'group\'">',
		            '<div id="{id}" class="item" ext:objid="{objectId}" ext:type="{type}" ext:action="{action}">',
		            '</tpl>',

		            '<tpl if="type == \'group\'">',
		            '<div class="group">',
		            '<div class="{cls}" style="float:left;width:20px;height:16px;"></div>',
		            '</tpl>',
		            
		            	'{title}',
		            '</div>',
		            '</tpl>',
		        '</div>', {
		    }),
			autoScroll:true,
			singleSelect: true,
			store:new Ext.data.JsonStore({
	            idProperty : 'id',
	            fields     : ['id','type','title','action','objectId','cls'],
	        }),
	        bubbleEvents:['preview','copy','edit','empty'],
	        listeners:{
	        	click:{
	        		fn:function(dv,i,node,e){
		        		var t = e.getTarget('div.item',5, true);
		        		var objId = t.getAttributeNS('ext', 'objid');
		        		var objType = t.getAttributeNS('ext', 'type');
		        		var objAction = t.getAttributeNS('ext', 'action');
		        		this.fireEvent('preview', objType, objId);
		        	},
		        	buffer:350,
		        	scope:this
	        	},
	        	dblclick:function(dv,i,node,e){
	        		var t = e.getTarget('div.item',5, true);
	        		var objId = t.getAttributeNS('ext', 'objid');
	        		var objType = t.getAttributeNS('ext', 'type');
	        		var objAction = t.getAttributeNS('ext', 'action');
	        		console.info(objAction);
	        		this.fireEvent(objAction, objType, objId);
	        	},
	        	scope:this
	        }
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.StartView.superclass.initComponent.apply(this, arguments);
		
		this.runPlugins({
			orderId:this.orderId,
			patientId:this.patientId,
			baseServiceId:this.baseServiceId,
		});
		
		this.on('afterrender',function(){
		},this)
	},
	
	getAttrs : function(t) {
		return {
			objId : t.getAttributeNS('ext', 'objid'),
			objType : t.getAttributeNS('ext', 'type'),
			objAction : t.getAttributeNS('ext', 'action')
		}
	},
	
});

