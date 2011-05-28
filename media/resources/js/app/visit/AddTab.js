Ext.ns('App.visit');



App.visit.AddTab = Ext.extend(Ext.Panel, {
	initComponent : function() {

		// Create a standard HttpProxy instance.
		this.proxy = new Ext.data.HttpProxy({
		    url: '/dashboard/api/v1/visit'
		});
		
		this.reader = new Ext.data.JsonReader({
		    totalProperty: 'meta.total_count',
		    successProperty: 'success',
		    idProperty: 'id',
		    root: 'objects',
		    messageProperty: 'message'
		}, [
		    {name: 'id'},
		    {name: 'created', type:'date',format:'c', allowBlank: true},
		    {name: 'cls', allowBlank: false},
		    {name: 'patient', allowBlank: false},
		    {name: 'patient_id', allowBlank: true},
		    {name: 'referral', allowBlank: true},
		    {name: 'discount', allowBlank: true},
		    {name: 'source_lab', allowBlank: true},
		    {name: 'total_price', allowBlank: true},
		    {name: 'total_paid', allowBlank: true},
		    {name: 'operator_name', allowBlank: true},
		    {name: 'patient_name', allowBlank: true},
		    {name: 'payment_type', allowBlank: true},
		    {name: 'comment', allowBlank: true},
		    {name: 'pregnancy_week', allowBlank: true},
		    {name: 'menses_day', allowBlank: true},
		    {name: 'menopause', allowBlank: true},
		    {name: 'diagnosis', allowBlank: true},
		    {name: 'is_billed', allowBlank: true, type:'boolean'},
		    {name: 'referral_name', allowBlank: true}
		]);
		
		this.writer = new Ext.data.JsonWriter({
		    encode: false
		});
		
		this.store = new Ext.data.Store({
		    //id: 'visit-store',
		    baseParams: {
		    	format:'json'
		    },
		    paramNames: {
			    start : 'offset',  // The parameter name which specifies the start row
			    limit : 'limit',  // The parameter name which specifies number of rows to return
			    sort : 'sort',    // The parameter name which specifies the column to sort on
			    dir : 'dir'       // The parameter name which specifies the sort direction
			},
		    restful: true,     // <-- This Store is RESTful
		    proxy: this.proxy,
		    reader: this.reader,
		    writer: this.writer,    // <-- plug a DataWriter into the store just as you would a Reader
		    listeners: {
		    	write: function(store, action, result, res, rs) {
		    		//App.eventManager.fireEvent('visitwrite',rs);
		    		this.onVisitSave(rs);
		    	},
				exception: function(proxy, type, action, options, resp, args){
					Ext.Msg.alert('Ошибка!','Во время сохранения возникла ошибка на сервере. Попробуйте еще раз')
		    		//console.log("error on server, action is ", action);
		    		if (action=='create' || action=='update'){
		    			//Ext.getCmp('visit-submit-btn').enable();
		    		}
		    	},
		    	load: function(store, records, options) {
		    		this.record = records[0]; /// Is it hardcorded?
		    		this.form.getForm().loadRecord(this.record);
		    		//this.loadMask.hide();
		    	},
		    	scope:this
		    }
		});
		
		
		config = {
			//id:'visit-add-tab',
			autoDestroy:true,
			layout:{
				type:'border'
			},
			defaults:{
				baseCls:'x-border-layout-ct'
			},
	        items:[{
	        	region:'north',
	        	//height:300,
	        	autoHeight:true,
				split:true,
		        items: {
		        	patientId:this.patientId,
		        	type:this.type,
					xtype:'visitform'
		        }
			},{
				//id:'basket-panel',
				region:'center',
				layout:'fit',
				items:new App.patient.ServiceBasket({
					//xtype:'patientservicebasket',
					type:this.type
				})
			}]
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.visit.AddTab.superclass.initComponent.apply(this, arguments);
		
		
		this.form = this.items.itemAt(0).items.itemAt(0);
		this.basket = this.items.itemAt(1).items.itemAt(0);
		
		this.form.on('visitsubmit', this.onSubmit, this);
		//App.eventManager.on('sumchange', this.updateTotalSum, this);
		//this.basket.store.on('add', this.updateTotalSum, this);
		//this.basket.store.on('remove', this.updateTotalSum, this);

		if (this.visitId) {
			this.store.setBaseParam('id',this.visitId);
			this.store.load();
			var bs = this.basket.store;
			bs.setBaseParam('order',this.visitId);
			bs.reload();
		}
		this.setTitle(this.getTitleText());
		this.preventSave = false;
		//this.basket.store.on('load', this.updateTotalSum, this);
		
/*		this.on('afterlayout', function(){
			if (!this.record) {
				this.loadMask = new Ext.LoadMask(this.body, {msg:'Подождите, данные загружаются...'});
				this.loadMask.show();
			}
		}, this);
*/	},
	
	
	onSubmit: function(){
		if(this.record){
			if(this.record.id){
				this.saveBasket(this.record.id);
				this.peventSave = true;
			}
		} else {
			var Visit = this.store.recordType;
			this.record = new Visit();
		}
		this.form.getForm().updateRecord(this.record);
		if(!this.record.data.id) {
			this.store.insert(0,this.record);
		} else {
		}
	},
	
	onVisitSave: function(rec) {
		var id = rec.id;
		this.form.visitId = id;
		this.form.getForm().loadRecord(rec);
		this.setTitle(this.getTitleText());
		if(!this.preventSave) {
			this.saveBasket(id);
		}
		Ext.getCmp('visit-print-btn').enable();
		Ext.getCmp('visit-submit-btn').enable();
	},
	
	getTitleText: function() {
		var title;
		if(this.record && this.record.data.id) {
			title = this.type == 'visit' ? 'Прием' : 'Поступление биоматериала';
		} else {
			title = this.type == 'visit' ? 'Новый прием' : 'Новое поступление биоматериала';
		}
		return title
	},
	
	addToBasket:function(attrs){
		this.basket.addRow(attrs);
	},
	
	setVisitId: function(rec) {
		var f = this.items.itemAt(0).items.itemAt(0);
		f.isNew = false;
		f.visitId = rec.id;
		f.visitRec = rec;
		Ext.getCmp('visit-print-btn').enable();
		Ext.getCmp('visit-submit-btn').enable();
	},
	
	saveBasket:function(orderId){
		var b = this.basket;
		b.store.each(function(rec){
			if (!rec.data.order) {
				rec.beginEdit();
				rec.set('order',"/dashboard/api/v1/visit/"+orderId);
				rec.endEdit();
			}
		});
		b.store.save();
	},
	
	updateTotalSum:function() {
		if(this.type=='visit'){
			var c = this.basket.getTotalSum();
			//var c = 0;
			var p = this.form.paymentTpl;
			var d = Ext.getCmp('visit-discount-cmb').getValue();
			var dRec = this.form.discountsStore.getById(d);
			var value = dRec ? dRec.data.value : 0;
			//console.log(value);
			var data = {
				total:c,
				total_discount:c*(100-value)/100,
				discount:c*value/100
			};
			p.overwrite(this.form.paymentPanel.body,data);
			Ext.getCmp('total-paid-field').setValue(c);
			//this.form.getTotalField().setValue(c);
			//Ext.getCmp('visit-submit-btn').setDisabled(c==0);
		}
	}
});

Ext.reg('visitaddtab',App.visit.AddTab);