Ext.ns('App');

App.patient.PatientApp = Ext.extend(Ext.Panel, {
	initComponent:function(){
		
		this.patientFields = new Array("last_name","first_name","mid_name","second_name","mobile_phone","email","birth_day");
		
		this.patientGrid = new App.patient.PatientGrid({
			region:'center'
		});
		
		this.patientCard = new App.patient.PatientCard({
			region:'center'
		});
		
		this.defaultTitle = '<div style="padding:17px;font-size:19px;font-weight:bold">&lsaquo; Выберите пациента</div>';

		this.cardPanel = new Ext.Panel({
			region:'center',
			border:false,
			title:this.defaultTitle,
			layout:'fit',
			disabled:true,
			headerCfg:{
				tag:'div',
				cls:'patient-card-header'
			},
			tools:[{
				id:'refresh',
				handler:this.updatePatientInfo.createDelegate(this,[]),
				scope:this,
				qtip:'Обновить карточку пациента'
			},{
				id:'close',
				handler:function(){
					this.cardPanel.remove(this.patientCard);
					this.patientCard = new App.patient.PatientCard({
						medstateStore:this.medstateStore,
						region:'center'
					});
					this.initEvents();
					this.cardPanel.setTitle(this.defaultTitle);
					this.cardPanel.add(this.patientCard);
					this.cardPanel.disable();
					this.cardPanel.doLayout();
				},
				scope:this,
				qtip:'Закрыть карту'
			}],
			items:[this.patientCard],
			listeners: {
		        render: function(p) {
		            p.getEl().on('click', this.onCardPanelClick.createDelegate(this, [p], true));
		        },
		        scope:this
		    }
		});
		
		this.editorCfg = {
                    shadow: false,
                    completeOnEnter: true,
                    cancelOnEsc: true,
                    updateEl: true,
                    ignoreNoChange: true
                };
		
		this.patientEditor = new Ext.Editor(Ext.apply({
            alignment: 'l-l',
            field: {
                allowBlank: true,
                xtype: 'textfield',
                width: 90,
                selectOnFocus: true
            },
            listeners: {
                    complete: function(ed, value){
                    	var fieldName = ed.boundEl.id
                        this.patient.set(fieldName,value);
                        return true;
                    },
                    scope:this
            }
        }, this.editorCfg));
        
        this.dateEditor = new Ext.Editor(Ext.apply({
            alignment: 'l-l',
            field: {
                allowBlank: true,
                xtype: 'datefield',
                width: 90,
                format:'d.m.Y',
                plugins:[new Ext.ux.netbox.InputTextMask('99.99.9999')],
				minValue:new Date(1901,1,1),
                selectOnFocus: true
            },
            listeners: {
                    complete: function(ed, value){
                    	var fieldName = ed.boundEl.id;
                    	var converted = Ext.util.Format.date(value,'d.m.Y');
                        this.patient.set(fieldName, value);
                        ed.boundEl.update(converted);
                        return true;
                    },
                    scope:this
            }
        }, this.editorCfg));

		this.origTitle = 'Пациенты';
		
		config = {
			id:'patients',
			title:this.origTitle,
			layout:'border',
            defaults: {
				border:false
			},
			items:[this.cardPanel, {
				region:'west',
				width:'30%',
				split:true,
				layout:'border',
				items:[this.patientGrid]
			}]
		}
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.patient.PatientApp.superclass.initComponent.apply(this, arguments);
		
		this.initEvents();
		
		WebApp.on('patientcardupdate', this.updatePatientInfo, this); //
		WebApp.on('globalsearch', this.onGlobalSearch, this);
		this.patientGrid.getStore().on('load',this.onPatientLoad,this);
		this.patientGrid.getStore().on('beforeload',this.onPatientBeforeLoad,this);
		this.on('destroy', function(){
			WebApp.un('globalsearch', this.onGlobalSearch, this);
			this.patientGrid.getStore().un('beforeload',this.onPatientBeforeLoad,this);
		},this);

	},
	
	onGlobalSearch : function(v) {
		this.cardPanel.disable();
		this.changeTitle = v!==undefined;
		if(!v){
			this.setTitle(this.origTitle);
		}
	},
	
	onPatientBeforeLoad : function(){
		this.cardPanel.disable();
	},
	
	onPatientLoad : function(store,r,options){
		if(this.changeTitle){
			this.setTitle(String.format('{0} ({1})', this.origTitle, store.getTotalCount()));
		}
	},
	
	initEvents : function() {
		this.patientGrid.on('patientselect', this.patientSelect, this);
	},
	
	titleTpl : /*App.settings.strictMode ? new Ext.XTemplate(
			'Пациент: ',
			'{last_name} {first_name} {mid_name}',
			{}
		) : */new Ext.XTemplate(
			'<ul>',
				'{accepted:this.notAccepted}',
				'{ad_source_name:this.isEmpty}',
			'</ul>',
			'<h1>',
				'<span id="last_name" class = "last_name">{last_name}</span>',
				' ','<span id="first_name" class="first_name">{first_name}</span>',
				' ', '<span id="mid_name" class="mid_name">{mid_name}</span>',
			'</h1> ',
			'<div>',
				'Дата рождения: ','<span id="birth_day" class="birth_day">{birth_day:this.parseDate}</span>',
				' Телефон: <span id="mobile_phone" class="mobile_phone">{mobile_phone}</span>',
				' email: <span id="email" class="email">{email:this.nullFormatter}</span>',
			'</div> ',
			'<div>',
				'Скидка: <span>{discount_name}</span> ',
				'Общая сумма: <span>{billed_account}</span> ',
				'Баланс: <span style="color:{color}">{balance}</span>',
			'</div>',
		{
			isEmpty:function(v){
				return v ? '' : '<li><span class="warn">Спросить источник рекламы!</span></li>'
			},
			notAccepted:function(v){
				return v ? '' : '<li><span class="warn">Согласие не подписано!</span></li>'
			},
			parseDate : function(v){
				return Ext.util.Format.date(v,'d.m.Y')
			},
			
			nullFormatter: function(v) 
	    		{ return v ? v : 'не указано'; }
		}
	),
	
	updatePatientInfo : function(patientId){
		patientRecord = this.patientGrid.getPatientRecord(patientId);
		if(patientRecord){
			App.direct.patient.updatePatientInfo(patientRecord.data.id, function(res,e){
				var data = res.data;
				patientRecord.beginEdit();
				for(k in data){
					patientRecord.set(k,data[k]);
//					console.info(k,data[k]);
				}
//				console.info(rec.data);
//				rec.endEdit();
				this.patientSelect(patientRecord);
//				this.patientCard.doRefresh();
			}, this);
		}
	},
	
	patientSelect: function(rec){
		var d = {};
		this.patient = rec;
		Ext.apply(d, rec.data);
		if(rec.data.balance>0) {
			d.color='green';
		} else if(rec.data.balance==0) {
			d.color='';
		} else {
			d.color='red';
		}
		this.cardPanel.enable();
		this.cardPanel.setTitle(this.titleTpl.apply(d));
		this.patientCard.setActivePatient.createDelegate(this.patientCard,[rec])();
	},
	
	onCardPanelClick : function(a,p,c) {
		if (!p.classList.length){
			return false;
		};
		var g = p.classList[0];
		for(var i = 0; i < this.patientFields.length; i++) { 
			if (g == this.patientFields[i]){
				if (g != 'birth_day'){
					this.patientEditor.startEdit(p)
				} else {
					this.dateEditor.startEdit(p)
				}
			}
		}
	}
});

Ext.reg('patientapp', App.patient.PatientApp);