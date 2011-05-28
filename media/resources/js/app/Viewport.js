Ext.ns('App');


Ext.data.DataProxy.addListener('exception', function(proxy, type, action, options, resp, args) {
	//console.log('На сервере произошла ошибка');
	//console.log(type);
	//console.log(action);
//	console.log(options);
//	console.log(resp);
//	console.log(args);
});


Ext.onReady(function() {

	Ext.Ajax.defaultHeaders = {Accept:'application/json'};
	
	
	
	var mainPanel = new Ext.TabPanel({
    	id:'main-tab-panel',
        region: 'center',
        border: true,
        activeTab: 0,
        //margins : '0 5 5 0',
        //tabPosition: 'bottom',
        items: [
                {
                	id:'patients-tab',
                	xtype:'patients'
                },{
                	id:'visits-tab',
                    xtype:'visits'
                }/*,
                new Ext.Panel({
                    title: 'Результаты',
                    html: '1111',
                    closable:true
                })*/
        ]
    });
	
	var servicePanel = new App.ServicePanel.Tree({
		id:'service-panel',
        region: 'east',
	    collapsible: true,
	    collapseMode: 'mini',
	    hidden:true,
        //margins : '0 0 5 5',
        width: 300,
        split: true
    });
	
	var registryPanel = new Ext.Panel({
        region: 'center',
        defaults: {
			border:false
		},
        //border: false,
        tbar: ['Фамилия пациента или № заказа',
        	{
        		id:'gsearch-fld',
        		xtype:'gsearchfield',
        		width:250
        	},'-',{
            	xtype:'button',
            	text:'Организации / врачи',
				handler:function(){
					var refWin;
					if(!refWin) {
						refWin = new App.ReferralWindow({});
						refWin.show(this);
					}
				}
            	
            },/*{
            	xtype:'button',
            	text:'Приемы'
            },{
            	xtype:'button',
            	text:'Результаты'
            },*/'->',{
            	id:'service-toggle-btn',
            	xtype:'button',
            	text:'Услуги клиники',
            	enableToggle: true,
            	toggleHandler: function(b,s) {
            		var panel = Ext.getCmp('service-panel');
            		if (s) {
            			panel.show();
            		} else {
            			panel.hide();
            		}
            		panel.ownerCt.doLayout();
            	}
            }],
        bbar: new Ext.ux.StatusBar({
        	text: 'Готово',
        	//items:['Готово']
        }),
        layout: 'border',
        items: [mainPanel,servicePanel]
    });
	
    var viewport = new Ext.Viewport({
        layout: 'border',
        items: registryPanel
    });
    
    // events
    
    var newPanel;
    var newTab;
	App.eventManager.on('visitcreate', function(patientId, type, visitId) {
		//tabPanel = Ext.getCmp('main-tab-panel');
		newTab = new App.visit.AddTab({
			id:Ext.id(),
			closable:true,
			patientId:patientId,
			visitId:visitId,
			type:type,
			title:'Новый прием'
		});
		var newPanel = mainPanel.add(newTab);
		mainPanel.setActiveTab(newPanel);
		Ext.getCmp('service-toggle-btn').toggle(true);
	});
	
	App.eventManager.on('visitclose', function(){
		mainPanel.remove(newTab, true);
		Ext.getCmp('service-toggle-btn').toggle(false);  //////TODO: need refactoring
	});
	
	App.eventManager.on('servicedblclick', function(attrs){
		//tabPanel = Ext.getCmp('main-tab-panel');
		//if((tab=mainPanel.getItem('visit-add-tab'))){
		if(newTab) {
			newTab.addToBasket(attrs);
		}
	}, this);
    
	App.eventManager.on('sumchange', function(){
		if(newTab) {
			newTab.updateTotalSum();
		}
	}, this);
	
	App.eventManager.on('visitwrite', function(rs){
		tabPanel = Ext.getCmp('main-tab-panel');
		if((tab=tabPanel.getItem('visit-add-form'))){
			tab.saveBasket(rs.id);
			tab.setVisitId(rs);
			App.eventManager.fireEvent('patientselect', rs.data.patient_id);
		}
	}, this);
	
	App.eventManager.on('updatetotalsum', function(c){
		tabPanel = Ext.getCmp('main-tab-panel');
		if((tab=tabPanel.getItem('visit-add-form'))){
			tab.updateTotalCount(c);
		}
	}, this);

	
	
    // other stuff   
    var tpl = Ext.Template.from('total-tpl',{
        compiled:true
    });
    
    App.getTotalTpl = function(){
    	return tpl;
    };
    
	
	
});




App.SearchField = Ext.extend(Ext.form.TwinTriggerField, {
    initComponent : function(){
        /*if(!this.store.baseParams){
			this.store.baseParams = {};
		}*/
    	this.params = {};
		App.SearchField.superclass.initComponent.call(this);
		this.on('specialkey', function(f, e){
            if(e.getKey() == e.ENTER){
                this.onTrigger2Click();
            }
        }, this);
    },

    validationEvent:false,
    validateOnBlur:false,
    trigger1Class:'x-form-clear-trigger',
    trigger2Class:'x-form-search-trigger',
    hideTrigger1:true,
    width:180,
    hasSearch : false,
    paramName : 'last_name__istartswith',

    onTrigger1Click : function(){
        if(this.hasSearch){
        	App.eventManager.fireEvent('globalsearch',undefined);
			this.el.dom.value = '';
            this.triggers[0].hide();
            this.hasSearch = false;
			this.focus();
        }
    },

    onTrigger2Click : function(){
        var v = this.getRawValue();
        if(v.length < 1){
            this.onTrigger1Click();
            return;
        }
		App.eventManager.fireEvent('globalsearch', v);
        this.hasSearch = true;
        this.triggers[0].show();
		this.focus();
    },
    
    imitate: function(val) {
    	this.setValue(val);
    	this.onTrigger2Click();
    }
});


Ext.reg('gsearchfield', App.SearchField);