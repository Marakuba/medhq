Ext.ns('App.refund');



App.refund.AddTab = Ext.extend(Ext.Panel, {
	initComponent : function() {

		this.proxy = new Ext.data.HttpProxy({
		    url: App.getApiUrl('visit', 'refund')
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
		    {name: 'insurance_policy', allowBlank: true},
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
		    		this.onRefundSave(rs);
		    	},
				exception: function(proxy, type, action, options, resp, args){
					Ext.Msg.alert('Ошибка!','Во время сохранения возникла ошибка на сервере. Попробуйте еще раз')
		    	},
		    	load: function(store, records, options) {
		    		this.record = records[0]; /// Is it hardcorded?
		    		this.form.getForm().loadRecord(this.record);
		    		this.form.enablePrintBtn();
		    		this.setTitle(this.getTitleText());
		    	},
		    	scope:this
		    }
		});

		this.servicePanel = new App.ServicePanel.Tree({
			id:'service-panel',
	        region: 'east',
		    collapsible: true,
		    collapseMode: 'mini',
		    //hidden:true,
	        //margins : '0 0 5 5',
	        width: 300,
	        split: true
	    });

	    this.form = new App.refund.Form({
        	region:'north',
        	baseCls:'x-border-layout-ct',
        	autoHeight:true,
			split:true,
        	patientId:this.patientId,
        	patientRecord:this.patientRecord,
        	type:this.type
	    });
	    this.basket = new App.refund.ServiceBasket({
			region:'center',
			layout:'fit',
			type:this.type
		});
		config = {
			autoDestroy:true,
			layout:{
				type:'border'
			},
			defaults:{
				//baseCls:'x-border-layout-ct'
			},
	        items:[{
	        	region:'center',
	        	layout:'border',
	        	items:[this.form,this.basket]
	        }, this.servicePanel]
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.refund.AddTab.superclass.initComponent.apply(this, arguments);


		this.form.on('refundsubmit', this.onSubmit, this);

		if (this.refundId) {
			this.form.refundId = this.refundId;
			this.store.setBaseParam('id',this.refundId);
			this.store.load();
			var bs = this.basket.store;
			bs.setBaseParam('order',this.refundId);
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


	onSubmit: function(modified){
		if(this.record){
			if(this.record.id){
				this.saveBasket(this.record.id);
				this.peventSave = true;
			}
		} else {
			var Refund = this.store.recordType;
			this.record = new Refund();
		}
		this.form.getForm().updateRecord(this.record);
		if(!this.record.data.id) {
			this.store.insert(0,this.record);
		} else {
		}
	},

	onRefundSave: function(rec) {
		var id = rec.id;
		this.form.visitId = id;
		this.form.getForm().loadRecord(rec);
		this.setTitle(this.getTitleText());
		if(!this.preventSave) {
			this.saveBasket(id);
		}
	},

	getTitleText: function() {
		var title;
		if(this.record && this.record.data.id) {
			title = this.type == 'visit' ? 'Возврат приема №'+this.record.data.id : 'Возврат поступления б/м №'+this.record.data.id;
		} else {
			title = this.type == 'visit' ? 'Новый возврат приема' : 'Новый возврат поступления б/м';
		}
		return title
	},

	addToBasket:function(attrs){
		this.basket.addRow(attrs);
	},

	setVisitId: function(rec) {
		var f = this.items.itemAt(0).items.itemAt(0);
		f.isNew = false;
		f.refundId = rec.id;
		f.refundRec = rec;
		Ext.getCmp('visit-print-btn').enable();
		Ext.getCmp('visit-submit-btn').enable();
	},

	saveBasket:function(orderId){
		var b = this.basket;
		b.store.each(function(rec){
			if (!rec.data.order) {
				rec.beginEdit();
				rec.set('order',App.getApiUrl('visit', 'refund', orderId));
				rec.endEdit();
			}
		});
		b.startModified = b.store.getModifiedRecords().length;
		b.store.save();
	},

	updateTotalSum:function() {
		if(this.type=='visit'){
			var c = this.basket.getTotalSum();
			//var c = 0;
			//var p = this.form.paymentTpl;
			var d = Ext.getCmp('visit-discount-cmb').getValue();
			var dRec = this.form.discountsStore.getById(d);
			var value = dRec ? dRec.data.value : 0;
			var discount = c*(100-value)/100;
//			var data = {
//				total:c,
//				total_discount:c*(100-value)/100,
//				discount:c*value/100
//			};
//			p.overwrite(this.form.paymentPanel.body,data);
			//Ext.getCmp('total-paid-field').setValue(discount);
			Ext.getCmp('total-sum-field').setValue(discount);
			//this.form.getTotalField().setValue(c);
			//Ext.getCmp('visit-submit-btn').setDisabled(c==0);
		}
	}
});

Ext.reg('refundaddtab', App.refund.AddTab);
