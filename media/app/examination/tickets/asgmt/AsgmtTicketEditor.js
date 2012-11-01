Ext.ns('App.examination');

App.examination.AsgmtTicketEditor = Ext.extend(Ext.Panel, {
	
	editor:'asgmtticketeditor',
	
	initComponent:function(){
		
		this.proxy = new Ext.data.HttpProxy({
		    url: get_api_url('extpreorder')
		});
		
		this.reader = new Ext.data.JsonReader({
		    totalProperty: 'meta.total_count',
		    successProperty: 'success',
		    idProperty: 'id',
		    root: 'objects',
		    messageProperty: 'message'
		}, App.models.preorderModel);
		
		this.writer = new Ext.data.JsonWriter({
		    encode: false,
		    writeAllFields: true
		});
		
		this.preorderStore = this.store || new Ext.data.Store({
			autoSave:false,
			autoLoad:true,
		    baseParams: {
		    	format:'json',
		    	patient:this.data.patientId,
		    	card:this.data.cardId
		    },
		    paramNames: {
			    start : 'offset',  
			    limit : 'limit', 
			    sort : 'sort', 
			    dir : 'dir' 
			},
		    restful: true,
		    proxy: this.proxy,
		    reader: this.reader,
		    writer: this.writer,
		    listeners:{
		    	exception: function(){
		    		this.fireEvent('basketexception')
		    	},
		    	scope:this
		    }
		});
		
		this.preorderGrid = new App.examination.PreorderInlineGrid({
//			record:this.record,
			type:this.type,
//			patientRecord:this.patientRecord,
			cardId:this.data.cardId,
			store:this.preorderStore,
			patientId:this.data.patientId,
			region:'center',
			listeners:{
				scope:this,
				basketexception:function(){
					this.fireEvent('basketexception')
				}
			}
		});
		
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
	    
	    this.okBtn = new Ext.Button({
			iconCls:'silk-resultset-previous',
	    	text:'Вернуться к карте',
	    	handler:this.onOkBtnClick.createDelegate(this,[]),
	    	scope:this
	    });
	    
	    this.cancelBtn = new Ext.Button({
	    	text:'Отмена',
	    	handler:this.onCancelBtnClick.createDelegate(this,[]),
	    	scope:this
	    });

		
		config = {
//			bodyStyle:'padding:5px',
//			baseCls:'x-border-layout-ct',
			//title:this.getPatientTitle(this.patientId),
			border:false,
			layout:'border',
			items:[this.preorderGrid, this.servicePanel],
			
			tbar:[this.okBtn,this.cancelBtn]

		}
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.AsgmtTicketEditor.superclass.initComponent.apply(this, arguments);
		this.servicePanel.on('serviceclick', this.onServiceClick, this);
		
	},
	
	
	onOkBtnClick: function() {
		this.preorderGrid.onSave();
		if (this.fn){
			this.fn(this.preorderStore.data.items,this.panel)
		};
		this.destroy();
	},
	
	onCancelBtnClick: function(){
		this.fireEvent('cancel');
		this.destroy();
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
	
	addPreorderService : function(record) {
		var p = new this.preorderGrid.store.recordType()
		p.beginEdit();
		p.set('preorder',record.data.resource_uri);
		p.set('price',record.data.price);
		p.set('staff_name',record.data.staff_name);
		p.set('service_name',record.data.service_name);
		p.set('service',App.getApiUrl('baseservice',record.data.base_service));
		p.set('staff',App.getApiUrl('position',record.data.staff));
		p.set('execution_place',App.getApiUrl('state',record.data.execution_place));
		p.set('count',1);
		p.data['id'] = '';
		p.endEdit();
		this.preorderGrid.store.add(p);
		this.preorderGrid.preorder = record;
	},
	
	setPatientRecord: function(record){
		this.patientRecord = record;
		this.preorderGrid.setPatientRecord(record)
	},
	
	setAssignmentRecord: function(record){
		this.record = record;
		this.preorderGrid.setAssignmentRecord(record)
	}
	
});

Ext.reg('asgmtticketeditor', App.examination.AsgmtTicketEditor);