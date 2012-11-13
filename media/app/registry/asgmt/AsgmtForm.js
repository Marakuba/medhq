Ext.ns('App.assignment');

App.assignment.AsgmtForm = Ext.extend(Ext.FormPanel, {

	initComponent:function(){

		this.inlines = new Ext.util.MixedCollection({});

		this.preorderStore = new Ext.data.RESTStore({
			autoLoad : false,
			autoSave : true,
			writer: new Ext.data.JsonWriter({
					    encode: false,
					    writeAllFields: false
					}),
			apiUrl : App.utils.getApiUrl('scheduler','extpreorder'),
			model: App.models.preorderModel,
		    doTransaction : function(action, rs, batch) {
		        function transaction(records) {
		            try{
		                this.execute(action, records, undefined, batch);
		            }catch (e){
		                this.handleException(e);
		            }
		        }
		        this.batch=true;
		        transaction.call(this, rs);
		    }
		});

		this.preorderGrid = new App.assignment.PreorderInlineGrid({
//			record:this.record,
			type:this.type,
//			patientRecord:this.patientRecord,
			card_id:this.card_id,
			region:'center',
			listeners:{
				scope:this,
				basketexception:function(){
					this.fireEvent('basketexception')
				}
			}
		});

		this.preorderGrid.store.on('write', function(){
			this.fireEvent('popstep');
		}, this);

		this.inlines.add('preordergrid', this.preorderGrid);


		this.servicePanel = new App.ServiceTreeGrid({
	        region: 'east',
		    margins:'5 5 5 0',
	        width: 300,
		    collapsible: true,
		    collapseMode: 'mini',
	        split: true,
	        listeners:{
	        	render: function(){
	        		this.loader.baseParams = {
	        			payment_type:'н',
	        			all:true,
	        			ext:1,
	        			promotion:true
	        		}
	        	}
	        }
	    });


		this.totalSum = new Ext.form.NumberField({
			name:'total_sum_field',
			fieldLabel:'К оплате с учетом скидки',
			readOnly:true,
			value:0,
			style:{
				fontSize:'2.5em',
				height:'1em',
				width:'180px'
			}
		});

		config = {
//			bodyStyle:'padding:5px',
//			baseCls:'x-border-layout-ct',
			//title:this.getPatientTitle(this.patientId),
			border:false,
			layout:'border',
			items:[this.preorderGrid, this.servicePanel]

		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.assignment.AsgmtForm.superclass.initComponent.apply(this, arguments);
		this.preorderGrid.on('sumchange', this.updateTotalSum, this);
		this.servicePanel.on('serviceclick', this.onServiceClick, this);

	},

	getRecord: function() {
		if(!this.record) {
			if(this.model) {
				var Model = this.model;
				this.record = new Model();
			} else {
				Ext.MessageBox.alert('Ошибка','нет модели');
			}
		}
		return this.record;
	},

	onSave: function() {
		var f = this.getForm();
		if(f.isValid()){
			this.preorderGrid.onSave();
		} else {
			Ext.MessageBox.alert('Предупреждение','Пожалуйста, заполните все поля формы!');
		}
	},

	getSteps : function() {
		var steps = 0;
		if(this.getForm().isDirty()) {
	        this.getForm().items.each(function(f){
	            if(f.isDirty()){
//	            	console.info('dirty field:',f);
	            }
	         });
			steps+=1;
		}
		this.inlines.each(function(inline,i,l){
			var s = inline.getSteps();
			steps+=s;
		});
		return steps
	},

	updateTotalSum:function(sum) {
		if(this.type=='visit'){
			var d = this.discountCmb;
			var dRec = d.getStore().getById(d.getValue());
			var value = dRec ? dRec.data.value : 0;
			var discount = sum*(100-value)/100;
			this.totalSum.setValue(discount);
			this.totalSum.originalValue = discount;
		}
	},

	addRow: function(attrs, cb, scope) {
		this.preorderGrid.addRow.createDelegate(this.preorderGrid, [attrs, true, cb, scope])();
	},

	onServiceClick : function(node) {
		var a = node.attributes;
		if (a.isComplex) {
			this.cNodes = a.nodes;
			complexAdd = function() {
				var item = this.cNodes.pop();
				item['promotion'] = node.id;
				this.addRow(item, function(){
					if(this.cNodes.length) {
						complexAdd.createDelegate(this,[])();
					}
				}, this);
			}
			complexAdd.createDelegate(this,[])();
		} else {
			this.addRow(a);
		}
	},

	getSum : function() {
		var sum = this.getForm().findField('total_sum_field').getValue();
		return sum;
	},

	onPreorderChoice : function(){
        this.preorderGrid = new App.registry.PatientPreorderGrid({
       		scope:this,
       		patient : this.patientRecord,
       		store : this.preorderStore,
       		fn:this.addPreorderService
       	 });

       	this.preorderWindow = new Ext.Window ({
       		width:700,
			height:500,
			layout:'fit',
			title:'Предзаказы',
			items:[this.preorderGrid],
			modal:true,
			border:false
    	});
    	var today = new Date();
    	this.preorderGrid.store.setBaseParam('timeslot__start__gte',today.format('Y-m-d 00:00'));
    	this.preorderGrid.store.setBaseParam('patient',App.utils.uriToId(this.patientRecord.data.resource_uri));
       	this.preorderWindow.show();
	},

	addPreorderService : function(record) {
		var p = new this.preorderGrid.store.recordType()
		p.beginEdit();
		p.set('preorder',record.data.resource_uri);
		p.set('price',record.data.price);
		p.set('staff_name',record.data.staff_name);
		p.set('service_name',record.data.service_name);
		p.set('service',App.utils.getApiUrl('service','baseservice',record.data.base_service));
		p.set('staff',App.utils.getApiUrl('staff','position',record.data.staff));
		p.set('execution_place',App.utils.getApiUrl('state','state',record.data.execution_place));
		p.set('count',1);
		p.data['id'] = '';
		p.beginEdit();
		this.preorderGrid.store.add(p);
		this.preorderGrid.preorder = record;
		if (this.preorderWindow){
			this.preorderWindow.close();
		}
	},

	onPaymentTypeChoice : function(rec){
		if(App.settings.reloadPriceByPaymentType) {
			var sp = this.servicePanel;
			sp.getLoader().baseParams['payment_type'] = rec.data.id;
			sp.getLoader().load(sp.getRootNode())
		}
		if(rec.data.id=='д') {
			this.policyCmb.allowBlank = false;
			this.policyBar.show();
		} else {
			this.policyCmb.allowBlank = true;
			this.policyCmb.reset();
			this.policyBar.hide();
		}
	},

	setPatientRecord: function(record){
		this.patientRecord = record;
		this.preorderGrid.setPatientRecord(record)
	},

	setAssigmentRecord: function(record){
		this.record = record;
		this.preorderGrid.setAssigmentRecord(record)
	}

});

Ext.reg('asgmtform', App.assignment.AsgmtForm);
