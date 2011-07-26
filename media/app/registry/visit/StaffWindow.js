Ext.ns('App.visit');

App.visit.StaffWindow = Ext.extend(Ext.Window, {

	initComponent:function(){
		this.staffStore = new Ext.data.ArrayStore({
		    fields: ['id', 'staff_name'],
		    data : this.staffList
		});
		this.staff = new Ext.form.ComboBox({
			fieldLabel:'Врач',
			name:'staff',
			allowBlank:false,
    		store:new Ext.data.ArrayStore({
    		    fields: ['id', 'staff_name'],
    		    data : this.staffList
    		}),
    		mode:'local',
	    	selectOnFocus:true,
		    typeAhead: true,
		    triggerAction: 'all',
		    valueField: 'id',
		    displayField:'staff_name',
		    editable:false
		});
		this.staff.setValue(this.staffList[0][0]);
		this.form = new Ext.form.FormPanel({
			layout:'form',
			items: this.staff
		});
		
		config = {
			title:'Выберите врача',
			width:380,
			height:120,
			layout:'fit',
			defaults:{
				baseCls:'x-border-layout-ct',
				border:false
			},
			items: this.form,
			modal:true,
			border:false,
			buttons:[{
				text:'Выбрать',
				handler:this.onSubmit.createDelegate(this,[])
			},{
				text:'Отменить',
				handler:function(){
					this.fireEvent('declinestaff');
					this.close();
				},
				scope:this
			}]
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.visit.StaffWindow.superclass.initComponent.apply(this, arguments);
		
		this.addEvents({
			validstaff:true,
			declinestaff:true
		});
	},
	
	onSubmit:function()
	{
		var staff = this.staff;
		if(id=staff.getValue()){
			var idx = staff.getStore().find('id',id);
			var name = staff.getStore().getAt(idx).data.staff_name;
			this.fireEvent('validstaff', this.index, id, name);
			this.close();
		}
		
	}
});


App.visit.StaffBox = function() {
	
	var opts;
	
	var getCmb = function() {
		var cmb = new Ext.form.ComboBox({
			fieldLabel:'Врач',
			name:'staff',
			allowBlank:false,
			store:new Ext.data.ArrayStore({
			    fields: ['id', 'staff_name'],
			    data : opts.staffList
			}),
			mode:'local',
	    	selectOnFocus:true,
		    typeAhead: true,
		    triggerAction: 'all',
		    valueField: 'id',
		    displayField:'staff_name',
		    editable:false
		});
		cmb.setValue(opts.staffList[0][0]);
		return cmb;
	}
	
	return {
		handleButton: function(button) {
			Ext.callback(opt.fn, opt.scope||window, [button, opt], 1);
		},
		getDialog: function(options) {
			var win = new Ext.Window({
				title:'Выберите врача',
				width:380,
				height:120,
				layout:'fit',
				defaults:{
					baseCls:'x-border-layout-ct',
					border:false
				},
				items: new Ext.form.FormPanel({
					layout:'form',
					items: getCmb()
				}),
				modal:true,
				border:false,
				buttons:[{
					text:'Выбрать',
//					handler:this.onSubmit.createDelegate(this,[])
				},{
					text:'Отменить',
//					handler:Ext.emptyFn,
					scope:this
				}]
			});
			return win
		},
		show: function(options) {
			opts = options;
			var dlg = this.getDialog(opts);
			dlg.show();
		}
	}
}
