Ext.ns('App.investigation');

App.investigation.InvestigationGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {
		
		this.start_date = new Date();
		
		this.origTitle = 'Журнал исследований';
		
		this.store = new Ext.data.RESTStore({
			autoLoad : false,
			apiUrl : get_api_url('laborderedservice'),
			model: [
			    {name: 'id'},
			    {name: 'resource_uri'},
			    {name: 'created'},
			    {name: 'barcode'},
			    {name: 'laboratory'},
			    {name: 'patient_name'},
			    {name: 'service_name'},
			    {name: 'status'},
			    {name: 'message'},
			    {name: 'sampling'},
			    {name: 'operator_name'},
			    {name: 'in_progress', type:'bool'}
			]
		});
		
		this.store.setBaseParam('service__labservice__isnull',false);
		
		this.sm = new Ext.grid.CheckboxSelectionModel({
			singleSelect : false,
			listeners:{
				rowselect:function(sm,i,rec) {
				},
				rowdeselect:function(sm,i,rec) {
				},
				scope:this
			}
		});
		
		this.columns =  [this.sm, {
	    	header: "Дата",
	    	width:12,
	    	sortable: true, 
	    	dataIndex: 'created',
	    	renderer: Ext.util.Format.dateRenderer('d.m.Y / H:i')
	    },{
	    	header: "Заказ",
	    	width:10,
	    	sortable: true, 
	    	dataIndex: 'barcode'
	    },{
	    	header: "Лаборатория", 
	    	width: 15, 
	    	sortable: true, 
	    	dataIndex: 'laboratory'
	    },{
	    	header: "Пациент", 
	    	width: 20, 
	    	sortable: true, 
	    	dataIndex: 'patient_name'
	    },{
	    	header: "Исследование", 
	    	width: 35, 
	    	sortable: true, 
	    	dataIndex: 'service_name'
	    },{
	    	header: "Статус", 
	    	width: 10, 
	    	sortable: true, 
	    	dataIndex: 'status',
	    	renderer: function(val,opts,rec) {
	    		var s = rec.data.status;
	    		switch(s) {
	    			case 'т' : 
	    				return '<div class="x-grid-row-error">Не проведен!</div>';
	    				break;
	    			case 'з' : 
	    				return 'Готово';
	    				break;
	    		}
	    	}
	    },{
	    	header: "Оператор", 
	    	width: 10, 
	    	sortable: true, 
	    	dataIndex: 'operator_name'
	    }];		
		
		this.modeBtn = new Ext.CycleButton({
            showText: true,
            prependText: 'Показывать: ',
            items: [{
                text:'все',
                checked:true,
                filterValue:undefined
            },{
                text:'не проведенные',
                filterValue:'т'
            },{
                text:'не выполненные',
                filterValue:'л'
            },{
                text:'выполненные',
                filterValue:'з'
            }],
            changeHandler:function(btn, item){
            	this.storeFilter('status',item.filterValue);
//            	this.manageBtn(item.filterValue);
            },
            scope:this
        });
		
		this.toLabBtn = new Ext.Button({
			text:'Провести',
			hidden:true,
			handler:this.onToLab.createDelegate(this),
			scope:this
		});
		
		this.startDateField = new Ext.form.DateField({
			plugins:[new Ext.ux.netbox.InputTextMask('99.99.9999')], // маска ввода __.__._____ - не надо точки ставить
			minValue:new Date(1901,1,1),
			format:'d.m.Y',
			value:this.start_date,
			listeners: {
				select: function(df, date){
					this.start_date = date;
					this.storeDateFilter('created',this.start_date);
				},
				scope:this
			}
		});
		
		var config = {
			closable:true,
			title:this.origTitle,
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			stripeRows:true,
			border : false,
			store:this.store,
			columns:this.columns,
			tbar: [this.modeBtn,this.toLabBtn],
			bbar: {
            	cls: 'ext-toolbar',
            	border: true,
            	buttonAlign: 'center',
            	items: [{
//	                id: this.id + '-tb-prev',
                	handler: this.onPrevClick,
                	scope: this,
                	iconCls: 'x-tbar-page-prev'
            	},this.startDateField,{
//	                id: this.id + '-tb-next',
                	handler: this.onNextClick,
                	scope: this,
                	iconCls: 'x-tbar-page-next'
            	}]
        	},
			view : new Ext.grid.GridView({
				forceFit : true,
				emptyText: 'Нет записей',
	            getRowClass : function(record, rowIndex, p, store){
	            	var s = record.data.status, cls;
		    		switch(s) {
		    			case 'т' : 
		    				cls = 'x-grid-row-warning';
		    				break;
		    			case 'з' : 
		    				cls = 'x-grid-row-normal';
		    				break;
		    		}
		    		return cls
	            }
			})
			
		}
		
		this.on('afterrender', function(){
			var day = this.start_date.getDate();
			var month = this.start_date.getMonth()+1;
			var year = this.start_date.getFullYear();
			this.store.setBaseParam('created__year', year);
			this.store.setBaseParam('created__month', month);
			this.store.setBaseParam('created__day', day);
			if (this.searchValue){
				this.onGlobalSearch(this.searchValue)
			} else {
				this.store.load();
			}
		},this);
		
		this.store.on('load',this.onStoreLoad,this);
		
		this.on('beforedestroy', function(){
			this.store.un('load',this.onStoreLoad,this);
		},this);
		
		this.on('destroy', function(){
			App.eventManager.un('globalsearch', this.onGlobalSearch, this);
		},this);

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.investigation.InvestigationGrid.superclass.initComponent.apply(this, arguments);

		App.eventManager.on('globalsearch', this.onGlobalSearch, this);
	},
	
	manageBtn : function(s) {
		this.toLabBtn.hide();
		switch(s) {
			case 'т' :
				this.toLabBtn.show();
				this.getTopToolbar().doLayout();
				break;
		}
	},
	
	onGlobalSearch : function(v) {
		this.changeTitle = v!==undefined;
		this.storeFilter('search', v);
		if(!v){
			this.setTitle(this.origTitle);
		}
	},
	
	storeFilter : function(field, value){
		if(value===undefined) {
			delete this.store.baseParams[field]
		} else {
			this.store.setBaseParam(field, value);
		}
		this.store.load({
			callback:function(r){
				if(this.changeTitle){
					this.setTitle(String.format('{0} ({1})', this.origTitle, store.getTotalCount()));
				}
			},
			scope:this
		});
	},
	
	getSelected : function() {
		return this.getSelectionModel().getSelected()
	},
	
	
	getSelectedId : function(){
		var records = this.getSelectionModel().getSelections(), 
			ids = [];
		Ext.each(records, function(rec) {
			ids.push(rec.id);
		});
		return ids
	},
	
	onToLab : function() {
		var ids = this.getSelectedId();
		App.direct.visit.toLab(ids,function(result,e){
			this.modeBtn.setActiveItem(0);
		}, this);
	},
	
	onPrevClick: function(){
		this.start_date = this.start_date.add(Date.DAY,-1);
		this.startDateField.setValue(this.start_date);
		this.storeDateFilter('created',this.start_date);
	},
	
	onNextClick: function(){
		this.start_date = this.start_date.add(Date.DAY,1);
		this.startDateField.setValue(this.start_date);
		this.storeDateFilter('created',this.start_date);
	},
	
	storeDateFilter: function(field, value){
		if(!value) {
			delete this.store.baseParams[field+'__year'];
			delete this.store.baseParams[field+'__month'];
			delete this.store.baseParams[field+'__day'];
		} else {
			var day = value.getDate();
			var month = value.getMonth()+1;
			var year = value.getFullYear();
			this.store.setBaseParam(field+'__year', year);
			this.store.setBaseParam(field+'__month', month);
			this.store.setBaseParam(field+'__day', day);
		}
		this.store.load({callback:function(){
			var record = this.getSelected();
			if (record){
				this.onServiceSelect(record);
			}
		},scope:this});
	},
	
	onStoreLoad : function(store,r,options){
		if(this.changeTitle){
			this.setTitle(String.format('{0} ({1})', this.origTitle, r.length));
		}
	}
	
});



Ext.reg('investigationgrid', App.investigation.InvestigationGrid);