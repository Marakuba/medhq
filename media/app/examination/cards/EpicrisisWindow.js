Ext.ns('App.examination');

App.examination.EpicrisisWindow = Ext.extend(Ext.Window, {
	
	initComponent: function() {
		
		this.form = new Ext.FormPanel({
        	baseCls:'x-plain',
        	padding:10,
        	standardSubmit: true,
        	url:'/exam/epicrisis/',
        	method:'POST',
            items:  [new Ext.form.ComboBox({
				store:new Ext.data.JsonStore({
			    	autoLoad:false,
					proxy: new Ext.data.HttpProxy({
						url:get_api_url('patient'),
						method:'GET'
					}),
					root:'objects',
					idProperty:'id',
					fields:['id','resource_uri','full_name']
				}),
				anchor:'100%',
				fieldLabel:'Пациент',
				name:'patient',
				valueField:'resource_uri',
				queryParam:'last_name__istartswith',
			    typeAhead: true,
			    minChars:2,
			    triggerAction: 'all',
			    displayField: 'id',
			    selectOnFocus:true
			}), {
            	fieldLabel:'Начальная дата',
            	name:'start_date',
            	xtype:'datefield',
            	format:'d.m.y'
            },{
            	fieldLabel:'Конечная дата',
            	name:'end_date',
            	xtype:'datefield',
            	format:'d.m.y'
            }]
        });
		
		config = {
            layout:'fit',
            title: 'Формирование выписки по пациенту',
            width:450,
            height:200,
            closeAction:'close',
            
            items: [this.form],
            buttons: [{
                text:'Ok',
                scope: this,
                handler: function(){
        			var el = this.form.getEl().dom;
//        		    var target = document.createAttribute("target");
//        		    target.nodeValue = "_blank";
//        		    el.setAttributeNode(target);
//        		    el.action = this.form.url;
        			this.form.getForm().submit();
                }
            },{
                text: 'Отмена',
                scope: this,
                handler: function(){
                    this.close();
                }
            }]
        }

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.EpicrisisWindow.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender',function(){
			var el = this.form.getEl().dom;
		    var target = document.createAttribute("target");
		    target.nodeValue = "_blank";
		    el.setAttributeNode(target);
		    el.action = this.form.url;
		},this);
	}

});