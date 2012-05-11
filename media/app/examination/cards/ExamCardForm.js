Ext.ns('App.examination');
Ext.ns('App.dict');

App.examination.ExamCardForm = Ext.extend(Ext.form.FormPanel, {

	initComponent: function(){
		
		this.tmp_id = Ext.id();
		
		this.concreteFields = ['name','print_name','mbk_diag','conclusion'];
		
		this.fieldList = 'equipment,area,scan_mode,thickness,width,contrast_enhancement,disease,complaints,history,anamnesis,objective_data,psycho_status,mbk_diag,gen_diag,concomitant_diag,clinical_diag,complication,ekg,treatment,referral,conclusion';
		
		this.examModel = App.models.examModel;
		this.examCardStore = new Ext.data.Store({
			//autoLoad:true,
			autoSave:true,
		    baseParams: {
		    	format:'json'
		    },
		    paramNames: {
			    start : 'offset',
			    limit : 'limit',
			    sort : 'sort',
			    dir : 'dir'
			},
		    restful: true,
		    proxy: new Ext.data.HttpProxy({
			    url: get_api_url('examcard')
			}),
		    reader: new Ext.data.JsonReader({
			    totalProperty: 'meta.total_count',
			    successProperty: 'success',
			    idProperty: 'id',
			    root: 'objects',
			    messageProperty: 'message'
			}, this.examModel),
			writer: new Ext.data.JsonWriter({
			    encode: false,
			    writeAllFields: true
			}),
			listeners:{
		    	exception:function(proxy, type, action, options, response, arg){
		    		App.eventManager.fireEvent('saveexamcard', rs);
		    	},
		    	write:function(store, action, result, res, rs){
		    		if(action=='create') {
			    		App.eventManager.fireEvent('examcardcreate', rs);
			    		Ext.getCmp(this.tmp_id+'print').enable();
		    		};
		    		App.eventManager.fireEvent('saveexamcard', rs);
		    	},
		    	scope:this
		    }
		});
		
		this.mkb = new Ext.form.LazyComboBox({
			fieldLabel:'Диагноз по МКБ',
			hideTrigger:true,
			anchor:'95%',
			name:'mbk_diag',
            allowBlank:true,
			store: new Ext.data.JsonStore({
				autoLoad:false,
				proxy: new Ext.data.HttpProxy({
					url:get_api_url('icd10'),
					method:'GET'
				}),
				root:'objects',
				idProperty:'resource_uri',
				fields:['resource_uri','text','id']
			}),
//			typeAhead: true,
			readOnly:true,
			//queryParam:'code__istartswith',
//			minChars:3,
//			triggerAction: 'all',
			emptyText:'Выберите диагноз...',
			valueField: 'resource_uri',
			displayField: 'text',
//			selectOnFocus:true,
			listeners:{
				'click': this.openTree,
				scope:this
			}
		});
		
		this.equipment = new Ext.form.LazyComboBox({
			fieldLabel:'Оборудование',
			anchor:'95%',
			name:'equipment',
            allowBlank:true,
			store: new Ext.data.JsonStore({
				autoLoad:true,
				proxy: new Ext.data.HttpProxy({
					url:get_api_url('exam_equipment'),
					method:'GET'
				}),
				root:'objects',
				idProperty:'resource_uri',
				fields:['resource_uri','name','id']
			}),
			typeAhead: false,
			queryParam:'code__istartswith',
			minChars:3,
			triggerAction: 'all',
			emptyText:'Выберите оборудование...',
			valueField: 'resource_uri',
			displayField: 'name',
			editable:false,
			selectOnFocus:true
		});
		
		this.assistant = new Ext.form.LazyClearableComboBox({
			fieldLabel:'Лаборант',
			name:'assistant',
			anchor:'50%',
			valueField:'resource_uri',
			queryParam : 'staff__last_name__istartswith',
			store:new Ext.data.RESTStore({
				autoLoad : true,
				apiUrl : get_api_url('position'),
				model: ['id','name','resource_uri']
			}),
		    minChars:2,
		    emptyText:'Выберите врача...',
		    listeners:{
		    	select: function(combo, rec,i) {
		    	},
		    	scope:this
		    }
		});
		
		this.examComboBox = new Ext.form.ComboBox({
			id:'exam-combo',
			fieldLabel:'Другие карты осмотра',
			store: this.examCardStore,
			listeners:{
				scope:this,
				'select':function(combo, record, index){
					this.examDonor = record
				}
			},
			typeAhead: true,
			queryParam:'name__istartswith',
			minChars:3,
			triggerAction: 'all',
			valueField: 'resource_uri',
			displayField: 'view',
			selectOnFocus:true
		});
		
				
		this.workPlace = new Ext.Panel({
			title:'Основные данные',
			layout:'form',
//			labelAlign:'top',
			hideLabels:true,
			autoScroll:true,
			margins:'5 5 5 5',
			items:[{
					xtype:'hidden',
					name:'ordered_service'
				},{
					xtype:'hidden',
					name:'name'
				},{
					layout:'hbox',
					baseCls:'x-form-item',
					items:[{
						xtype:'displayfield',
						value:'Заголовок для печати',
						flex:1
					}]
				},{
					xtype:'textfield',
//					fieldLabel:'Заголовок для печати',
					name:'print_name',
					//height:40,
					anchor:'100%'
				},{
					xtype:'displayfield',
					value:'Лаборант',
					flex:1
				},this.assistant, {
					layout:'hbox',
					baseCls:'x-form-item',
					items:[{
						xtype:'displayfield',
						value:'Оборудование',
						flex:1
					},{
						xtype:'checkbox',
						boxLabel:'Выводить на печать',
						handler:this.getPrintStatus.createDelegate(this),
						name:'equipment_print',
						width:150
					}]
				},this.equipment,{
					layout:'hbox',
					baseCls:'x-form-item',
					items:[{
						xtype:'displayfield',
						value:'Область исследования',
						flex:1
					},{
						xtype:'checkbox',
						boxLabel:'Выводить на печать',
						handler:this.getPrintStatus.createDelegate(this),
						name:'area_print',
						width:150
					}]
				},{
					xtype:'textarea',
					fieldLabel:'Область исследования',
					name:'area',
					height: 100,
					anchor:'100%'
				},{
					layout:'hbox',
					baseCls:'x-form-item',
					items:[{
						xtype:'displayfield',
						value:'Режим сканирования',
						flex:1
					},{
						xtype:'checkbox',
						boxLabel:'Выводить на печать',
						handler:this.getPrintStatus.createDelegate(this),
						name:'scan_mode_print',
						width:150
					}]
				},{
					xtype:'textarea',
					fieldLabel:'Режим сканирования',
					name:'scan_mode',
					height: 100,
					anchor:'100%'
				},{
					layout:'hbox',
					baseCls:'x-form-item',
					items:[{
						xtype:'displayfield',
						value:'Толщина реконструктивного среза',
						flex:1
					},{
						xtype:'checkbox',
						boxLabel:'Выводить на печать',
						handler:this.getPrintStatus.createDelegate(this),
						name:'thickness_print',
						width:150
					}]
				},{
					xtype:'textfield',
					fieldLabel:'Толщина реконструктивного среза',
					name:'thickness',
//					height: 500,
					anchor:'100%'
				},{
					layout:'hbox',
					baseCls:'x-form-item',
					items:[{
						xtype:'displayfield',
						value:'ширина/шаг',
						flex:1
					},{
						xtype:'checkbox',
						boxLabel:'Выводить на печать',
						handler:this.getPrintStatus.createDelegate(this),
						name:'width_print',
						width:150
					}]
				},{
					xtype:'textfield',
					fieldLabel:'ширина/шаг',
					name:'width',
//					height: 500,
					anchor:'100%'
				},{
					layout:'hbox',
					baseCls:'x-form-item',
					items:[{
						xtype:'displayfield',
						value:'Контрастное усиление',
						flex:1
					},{
						xtype:'checkbox',
						boxLabel:'Выводить на печать',
						handler:this.getPrintStatus.createDelegate(this),
						name:'contrast_enhancement_print',
						width:150
					}]
				},{
					xtype:'textarea',
					fieldLabel:'Контрастное усиление',
					name:'contrast_enhancement',
					height: 100,
					anchor:'100%'
				},{
					layout:'hbox',
					baseCls:'x-form-item',
					items:[{
						xtype:'displayfield',
						value:'Характер заболевания',
						flex:1
					},{
						xtype:'checkbox',
						boxLabel:'Выводить на печать',
						handler:this.getPrintStatus.createDelegate(this),
						name:'disease_print',
						width:150
					}]
				},{
					xtype:'textarea',
					fieldLabel:'Характер заболевания',
					name:'disease',
					height: 500,
					anchor:'100%'
				},{
					layout:'hbox',
					baseCls:'x-form-item',
					items:[{
						xtype:'displayfield',
						value:'Жалобы',
						flex:1
					},{
						xtype:'checkbox',
						boxLabel:'Выводить на печать',
						handler:this.getPrintStatus.createDelegate(this),
						name:'complaints_print',
						width:150
					}]
				},{
					xtype:'textarea',
					fieldLabel:'Жалобы',
					name:'complaints',
					height:500,
					anchor:'100%'
				},{
					layout:'hbox',
					baseCls:'x-form-item',
					items:[{
						xtype:'displayfield',
						value:'История настоящего заболевания',
						flex:1
					},{
						xtype:'checkbox',
						boxLabel:'Выводить на печать',
						handler:this.getPrintStatus.createDelegate(this),
						name:'history_print',
						width:150
					}]
				},{
					xtype:'textarea',
					fieldLabel:'История настоящего заболевания',
					name:'history',
					height:500,
					anchor:'100%'
				},{
					layout:'hbox',
					baseCls:'x-form-item',
					items:[{
						xtype:'displayfield',
						value:'Анамнез',
						flex:1
					},{
						xtype:'checkbox',
						boxLabel:'Выводить на печать',
						name:'anamnesis_print',
						handler:this.getPrintStatus.createDelegate(this),
						width:150
					}]
				},{
					xtype:'textarea',
//					fieldLabel:'Анамнез',
					name:'anamnesis',
					height:500,
					anchor:'100%'
				},{
					layout:'hbox',
					baseCls:'x-form-item',
					items:[{
						xtype:'displayfield',
						value:'Объективные данные',
						flex:1
					},{
						xtype:'checkbox',
						boxLabel:'Выводить на печать',
						handler:this.getPrintStatus.createDelegate(this),
						name:'objective_data_print',
						width:150
					}]
				},{
					xtype:'htmleditor',
					fieldLabel:'Объективные данные',
					name:'objective_data',
					height:500,
					anchor:'100%'
				},{
					layout:'hbox',
					baseCls:'x-form-item',
					items:[{
						xtype:'displayfield',
						value:'Психологический статус',
						flex:1
					},{
						xtype:'checkbox',
						boxLabel:'Выводить на печать',
						handler:this.getPrintStatus.createDelegate(this),
						name:'psycho_status_print',
						width:150
					}]
				},{
					xtype:'textarea',
					fieldLabel:'Психологический статус',
					name:'psycho_status',
					height:500,
					anchor:'100%'
				},{
					layout:'hbox',
					baseCls:'x-form-item',
					items:[{
						xtype:'displayfield',
						value:'Диагноз по МКБ',
						flex:1
					},{
						xtype:'checkbox',
						boxLabel:'Выводить на печать',
						handler:this.getPrintStatus.createDelegate(this),
						name:'mbk_diag_print',
						width:150
					}]
				},this.mkb,{
					xtype:'button',
					text:'Выбрать',
					handler: this.openTree.createDelegate(this)
				},{
					layout:'hbox',
					baseCls:'x-form-item',
					items:[{
						xtype:'displayfield',
						value:'Основной диагноз',
						flex:1
					},{
						xtype:'checkbox',
						boxLabel:'Выводить на печать',
						handler:this.getPrintStatus.createDelegate(this),
						name:'gen_diag_print',
						width:150
					}]
				},{
					xtype:'htmleditor',
					fieldLabel:'Основной диагноз',
					name:'gen_diag',
					height:500,
					anchor:'100%'
				},{
					layout:'hbox',
					baseCls:'x-form-item',
					items:[{
						xtype:'displayfield',
						value:'Сопутствующий диагноз',
						flex:1
					},{
						xtype:'checkbox',
						boxLabel:'Выводить на печать',
						handler:this.getPrintStatus.createDelegate(this),
						name:'concomitant_diag_print',
						width:150
					}]
				},{
					xtype:'textarea',
					height:500,
					fieldLabel:'Сопутствующий диагноз',
					name:'concomitant_diag',
					anchor:'100%'
				},{
					layout:'hbox',
					baseCls:'x-form-item',
					items:[{
						xtype:'displayfield',
						value:'Клинический диагноз',
						flex:1
					},{
						xtype:'checkbox',
						boxLabel:'Выводить на печать',
						handler:this.getPrintStatus.createDelegate(this),
						name:'clinical_diag_print',
						width:150
					}]
				},{
					xtype:'textarea',
					fieldLabel:'Клинический диагноз',
					height:500,
					name:'clinical_diag',
					anchor:'100%'
				},{
					layout:'hbox',
					baseCls:'x-form-item',
					items:[{
						xtype:'displayfield',
						value:'Осложнения',
						flex:1
					},{
						xtype:'checkbox',
						boxLabel:'Выводить на печать',
						handler:this.getPrintStatus.createDelegate(this),
						name:'complication_print',
						width:150
					}]
				},{
					xtype:'textarea',
					fieldLabel:'Осложнения',
					name:'complication',
					height:500,
					anchor:'100%'
				},{
					layout:'hbox',
					baseCls:'x-form-item',
					items:[{
						xtype:'displayfield',
						value:'ЭКГ',
						flex:1
					},{
						xtype:'checkbox',
						boxLabel:'Выводить на печать',
						handler:this.getPrintStatus.createDelegate(this),
						name:'ekg_print',
						width:150
					}]
				},{
					xtype:'textarea',
					fieldLabel:'ЭКГ',
					name:'ekg',
					height:500,
					anchor:'100%'
				},{
					layout:'hbox',
					baseCls:'x-form-item',
					items:[{
						xtype:'displayfield',
						value:'Лечение',
						flex:1
					},{
						xtype:'checkbox',
						boxLabel:'Выводить на печать',
						handler:this.getPrintStatus.createDelegate(this),
						name:'treatment_print',
						width:150
					}]
				},{
					xtype:'textarea',
					fieldLabel:'Лечение',
					height:500,
					name:'treatment',
					anchor:'100%'
				},{
					layout:'hbox',
					baseCls:'x-form-item',
					items:[{
						xtype:'displayfield',
						value:'Направление',
						flex:1
					},{
						xtype:'checkbox',
						boxLabel:'Выводить на печать',
						handler:this.getPrintStatus.createDelegate(this),
						name:'referral_print',
						width:150
					}]
				},{
					xtype:'textarea',
					fieldLabel:'Направление',
					height:500,
					name:'referral',
					anchor:'100%'
				},{
					layout:'hbox',
					baseCls:'x-form-item',
					items:[{
						xtype:'displayfield',
						value:'Заключение',
						flex:1
					},{
						xtype:'checkbox',
						boxLabel:'Выводить на печать',
						handler:this.getPrintStatus.createDelegate(this),
						name:'conclusion_print',
						width:150
					}]
				},{
					xtype:'textarea',
					fieldLabel:'Заключение',
					height:500,
					name:'conclusion',
					anchor:'100%'
				},{
					xtype:'textarea',
					hidden:true,
					name:'comment'
				}]
		});
		
		this.ttb = [{
				xtype:'button',
				iconCls:'silk-accept',
				text:'Выбрать шаблон',
				handler:this.onChoice.createDelegate(this, [])
			},{
				xtype:'button',
				iconCls:'silk-accept',
				text:'Скопировать из документа',
				handler:this.onCardChoice.createDelegate(this, [])
			},'-',{
				xtype:'tbtext',
				id:this.tmp_id+'-info-btn',
				text:''
				//disabled:true
			}]
		
		this.menuBar = new Ext.Panel({
			region:'west',
			width:150,
			layout:'form',
			border:false,
			padding:5,
			defaults:{
				height:20,
				anchor:'100%',
				toggleGroup:'menu-bar',
				xtype:'button',
				scope:this
			},
			items:[{
					id:'print_name-btn',
					text:'Заголовок',
					handler:this.onFocus.createDelegate(this,['print_name'])
				},{
					id:'equipment-btn',
					text:'Оборудование',
					handler:this.onFocus.createDelegate(this,['equipment'])
				},{
					id:'area-btn',
					text:'Область исследования',
					handler:this.onFocus.createDelegate(this,['area'])
				},{
					id:'scan_mode-btn',
					text:'Режим сканирования',
					handler:this.onFocus.createDelegate(this,['scan_mode'])
				},{
					id:'thickness-btn',
					text:'Толщина среза',
					handler:this.onFocus.createDelegate(this,['thickness'])
				},{
					id:'contrast_enhancement-btn',
					text:'Контрастное усиление',
					handler:this.onFocus.createDelegate(this,['contrast_enhancement'])
				},{
					id:'disease-btn',
					text:'Характер заболевания',
					handler:this.onFocus.createDelegate(this,['disease'])
				},{
					id:'disease-btn',
					text:'Характер заболевания',
					handler:this.onFocus.createDelegate(this,['disease'])
				},{
					id:'complaints-btn',
					text:'Жалобы',
					handler:this.onFocus.createDelegate(this,['complaints'])
				},{
					id:'history-btn',
					text:'История заболевания',
					handler:this.onFocus.createDelegate(this,['history'])
				},{
					id:'anamnesis-btn',
					text:'Анамнез',
					handler:this.onFocus.createDelegate(this,['anamnesis'])
				},{
					id:'objective_data-btn',
					text:'Объективные данные',
					handler:this.onFocus.createDelegate(this,['objective_data'])
				},{
					id:'psycho_status-btn',
					text:'Психологический статус',
					handler:this.onFocus.createDelegate(this,['psycho_status'])
				},{
					id:'mbk_diag-btn',
					text:'Диагноз МКБ',
					handler:this.onFocus.createDelegate(this,['mbk_diag'])
				},{
					id:'gen_diag-btn',
					text:'Основной диагноз',
					handler:this.onFocus.createDelegate(this,['gen_diag'])
				},{
					id:'concomitant_diag-btn',
					text:'Сопутствующий диагноз',
					handler:this.onFocus.createDelegate(this,['concomitant_diag'])
				},{
					id:'clinical_diag-btn',
					text:'Клинический диагноз',
					handler:this.onFocus.createDelegate(this,['clinical_diag'])
				},{
					id:'complication-btn',
					text:'Осложнения',
					handler:this.onFocus.createDelegate(this,['complication'])
				},{
					id:'ekg-btn',
					text:'ЭКГ',
					handler:this.onFocus.createDelegate(this,['ekg'])
				},{
					id:'treatment-btn',
					text:'Лечение',
					handler:this.onFocus.createDelegate(this,['treatment'])
				},{
					id:'referral-btn',
					text:'Направление',
					handler:this.onFocus.createDelegate(this,['referral'])
				},{
					id:'conclusion-btn',
					text:'Заключение',
					handler:this.onFocus.createDelegate(this,['conclusion'])
				}]
		});
		
		this.statusbar = new Ext.ux.StatusBar({
                defaultText: '',
                items:[{
					id:this.tmp_id+'print',
					disabled:this.record ? false : true,
					text:'Просмотр',
					handler:this.onPrint.createDelegate(this),
					scope:this
				},{
					text:'Сохранить',
					handler:this.onSave.createDelegate(this),
					scope:this
				},{
					text:'Закрыть',
					handler:this.onClose.createDelegate(this),
					scope:this
				}]
			});
		
		this.imgStore = new Ext.data.RESTStore({
			autoLoad : false,
			apiUrl : get_api_url('dicom'),
			model: App.models.Dicom
		});
		
		if(this.record) {
			var s = this.imgStore;
			s.setBaseParam('examination_card',App.uriToId(this.record.data.resource_uri));
			s.load();
		}
		
		this.imgTpl = new Ext.XTemplate(
				'<tpl for=".">',
	            '<div class="thumb-wrap" id="dcm-{id}">',
			    '<div class="thumb"><img src="{thumb}" title="{name}"></div>',
			    '<span class="x-editable"></span></div>',
	        '</tpl>',
	        '<div class="x-clear"></div>'
		);
		
		config = {
			id: 'exam-form',
			layout:'border',
			border:false,
			autoScroll: true,
			trackResetOnLoad:true,
			padding:5,
			closable:true,
			bbar:this.statusbar,
			tbar:this.ttb,
			items:[{
				xtype:'tabpanel',
				activeTab:0,
				region:'center',
				items:[this.workPlace,new Ext.DataView({
					id:'images-view',
					title:'Изображения',
		            store: this.imgStore,
		            tpl: this.imgTpl,
		            autoHeight:true,
		            multiSelect: true,
		            overClass:'x-view-over',
		            itemSelector:'div.thumb-wrap',
		            emptyText: 'Нет изображений',
		            listeners:{
		            	dblclick:function(dv,index,node,e){
		            		var win = new App.examination.Viewer({
		            			store:this.imgStore,
		            			index:index
		            		});
		            		win.show();
		            	},
		            	scope:this
		            }
		        })]
			},this.menuBar]
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.ExamCardForm.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('saveexamcard', this.onSaveExamCard, this);
		this.on('destroy', function(){
			App.eventManager.un('saveexamcard', this.onSaveExamCard, this);
		},this);
		this.on('afterrender', function(){
			//if (this.patient) {
				//this.examCardStore.setBaseParam('ordered_service__order__patient',this.patient)
			//};
			if(this.record) {
				this.getForm().loadRecord(this.record);
				Ext.getCmp(this.tmp_id+'-info-btn').setText('Выбранный шаблон: '+this.record.data.name);
			} else {
				this.getForm().findField('comment').setValue(this.fieldList);
			}
			this.setPrintStatus();
			if (this.ordered_service) {
				this.getForm().findField('ordered_service').setValue(this.ordered_service)
			}
			//this.examCardStore.load();
		},this);
	},
	
	setPrintStatus : function() {
		var f = this.getForm();
		var st = f.findField('comment').getValue().split(',');
		Ext.each(st, function(item){
			var field = f.findField(item+'_print');
			if(field) {
				field.setValue(true);
			}
		}, this);
	},
	
	getPrintStatus : function() {
		var st = this.fieldList.split(',');
		var vals = [];
		var f = this.getForm();
		Ext.each(st, function(item){
			var field = f.findField(item+'_print');
			if(field) {
				var v = field.getValue();
				if(v){
					vals.push(item);
				}
			}
		},this);
		var v = vals.join(',');
		f.findField('comment').setValue(v);
	},
	
	onPromptSubmit: function(arr) {
    	//Переносим данные из выбранных полей
    	var field, d, n, state, cb=[];
    	for (item in arr){
    		if (arr[item].getValue) {
    			if(arr[item].getValue()) {
    				cb.push(arr[item]['name']);
    			}
    		}
    		d = this.tmp_record.data[arr[item]['name']];
    		if (d) {
    			field = this.getForm().findField(arr[item]['name']);
    			if (field){
    				field.setValue(this.tmp_record.data[arr[item]['name']]);
    			}
    		}
    	};
		this.menuBar.items.each(function(btn){
			n = btn.id.split('-')[0];
			d = this.tmp_record.get(n);
			state = (d!='' && d!=undefined) || cb.indexOf(n)!=-1;
			btn.setVisible(state);
			this.getForm().findField(n).setVisible(state);
		},this);
		
		Ext.getCmp(this.tmp_id+'-info-btn').setText('Выбранный шаблон: '+this.tmp_record.data.name);
		if(this.prompt) {
			this.prompt.close();
		}
    },
	
	onSaveExamCard: function(record) {
        this.statusbar.setStatus({
        	text: 'Документ успешно сохранён',
            iconCls: 'silk-status-accept',
            clear: {
                wait: 2000,
                anim: true
            }
        });
	},
	onExamCardCreate: function(record) {
		this.record = record;
		this.getForm().loadRecord(this.record);
	},
	
	getRecord: function() {
		if(!this.record) {
			if(this.model) {
				var Model = this.model;
				this.record = new Model();
			} else {
				console.log('нет модели');
				var Model = this.examModel;
				this.record = new Model();
			}
		}
		return this.record;
	},
	
	onSave: function() {
		var f = this.getForm();
		if(f.isValid()){
			var Record = this.getRecord();//this.record ? this.record : new this.examModel();
			f.updateRecord(Record);
			if (!Record.data.name){
				Record.data['name'] = Record.data.print_name; 
			}
			this.record = Record;
			if(this.fn) {
				Ext.callback(this.fn, this.scope || window, [Record]);
			} else {
				if(Record.phantom) {
					if(this.examCardStore.indexOf(Record)==-1) {
						this.examCardStore.insert(0, Record);
					}
				}
			}
		} else {
			Ext.MessageBox.alert('Предупреждение','Пожалуйста, заполните все поля формы!');
		}
	},
	
	onChoice: function(){
		var win = new App.examination.TemplatesWindow({
			fn: function(record){
				if (record){
					this.tmp_record = record;
					this.prompt = new App.examination.PromptWindow({
						tmp_record:record
					});
			        this.prompt.on('submit', this.onPromptSubmit,this);
					this.prompt.show();
				}
			},
			scope:this
		})
		win.show();
	},
	
	onCardChoice: function(){
		var win = new App.examination.CardsWindow({
			patient:this.patient,
			fn: function(record){
				if (record){
					this.tmp_record = record;
					this.prompt = new App.examination.PromptWindow({
						tmp_record:record
					});
			        this.prompt.on('submit', this.onPromptSubmit,this);
					this.prompt.show();
				}
			},
			scope:this
		})
		win.show();
	},
	
	onClose: function() {
		this.destroy();
	},
	
	onPrint: function() {
		window.open('/exam/examcard/'+this.record.data.id+'/');
	},
	
	onFocus: function(name){
		var f = this.getForm().findField(name);
		var el = Ext.getDom(f.wrap ? f.wrap.id : f.id);
		if(el){
			var top = (Ext.fly(el).getOffsetsTo(this.workPlace.body)[1]) + this.workPlace.body.dom.scrollTop;
			this.workPlace.body.scrollTo('top',top-25, { duration:0.4 });
		}
		f.focus(false,150);
	},
	
	openTree : function(){
		if (!this.mkbWin){
			this.mkbWin = new App.dict.MKBWindow({
				fn: function(node){
					this.mkb.forceValue(node.attributes.resource_uri);
					this.mkbWin.hide();
				},
				scope:this
			})
		}
		this.mkbWin.show();
	}
});		

Ext.reg('examcardform', App.examination.ExamCardForm);