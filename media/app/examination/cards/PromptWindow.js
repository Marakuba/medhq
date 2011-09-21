Ext.ns('App.examination');

App.examination.PromptWindow = Ext.extend(Ext.Window, {
	
	initComponent: function() {
		
		this.group = new Ext.form.CheckboxGroup({
//        	id:'fields-group-win',
			xtype: 'checkboxgroup',
			vertical:true,
			anchor:'100%',
			columns: 2,
			defaults:{
				checked:true,
			},
			items: [
				{boxLabel:'Наименование',name:'name'},
				{boxLabel:'Заголовок',name:'print_name'},
				{boxLabel:'Оборудование',name:'equipment'},
				{boxLabel:'Область исследования',name:'area'},
				{boxLabel:'Режим сканирования',name:'scan_mode'},
				{boxLabel:'Толщина среза',name:'thickness'},
				{boxLabel:'ширина/шаг',name:'width'},
				{boxLabel:'Контрастное усиление',name:'contrast_enhancement'},
				{boxLabel:'Характер заболевания',name:'disease'},
				{boxLabel:'Жалобы',name:'complaints'},
				{boxLabel:'История заболевания',name:'history'},
				{boxLabel:'Анамнез',name:'anamnesis'},
				{boxLabel:'Объективные данные',name:'objective_data'},	
				{boxLabel:'Психологический статус',name:'psycho_status'},
				{boxLabel:'Диагноз МКБ',name:'mbk_diag'},
				{boxLabel:'Основной диагноз',name:'gen_diag'},
				{boxLabel:'Сопутствующий диагноз',name:'concomitant_diag'},
				{boxLabel:'Клинический диагноз',name:'clinical_diag'},
				{boxLabel:'Осложнения',name:'complication'},
				{boxLabel:'ЭКГ',name:'ekg'},
				{boxLabel:'Лечение',name:'treatment'},
				{boxLabel:'Направление',name:'referral'},
				{boxLabel:'Заключение',name:'conclusion'},
				{boxLabel:'Примечание',name:'comment'}
			]
				
        });
		
		config = {
            layout:'fit',
            title: 'Выберите поля для переноса',
            width:450,
            height:350,
            closeAction:'hide',
            items: new Ext.FormPanel({
                labelWidth: 10, 
                bodyStyle: 'padding:5px 0px 0',
                items:  [this.group],
                buttons: [{
                    text:'Ok',
                    scope: this,
                    handler: function(){
                    	var arr = this.group.getValue();
                    	this.fireEvent('submit',arr)
                    }
                },{
                    text: 'Отмена',
                    scope: this,
                    handler: function(){
                        this.close();
                    }
                }]
            }),
            listeners:{
            	show:function(w){
//            		var v;
//            		Ext.getCmp('fields-group-win').items.each(function(item){
//            			v = w.tmp_record.get(item.name);
//                		item.setValue(v!=''&&v!=undefined);
//            		});
            	}
            }
        }

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.PromptWindow.superclass.initComponent.apply(this, arguments);

		this.on('afterrender', function(){
			if(this.tmp_record) {
				this.group.items.each(function(item){
	    			v = this.tmp_record.get(item.name);
	        		item.setValue(v!=''&&v!=undefined);
	    		}, this);
			}
		},this);

	}

});