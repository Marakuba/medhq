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
	var dlg;
	
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
			var f = dlg.items.itemAt(0).getForm();
			var field = f.findField('staff');
			var val = field.getValue();
			var rec = field.findRecord(field.valueField, val);
			Ext.callback(opts.fn, opts.scope||window, [button, rec, opts], 1);
			dlg.close();
		},
		getDialog: function(options) {
			this.win = new Ext.Window({
				title:'Выберите врача',
				width:380,
				height:140,
				layout:'fit',
				defaults:{
					baseCls:'x-border-layout-ct',
					border:false
				},
				items: new Ext.form.FormPanel({
					padding:7,
					layout:'form',
					items: [getCmb()]
				}),
				modal:true,
				border:false,
				buttons:[{
					text:'Выбрать',
					handler:this.handleButton.createDelegate(this,['ok']),
					scope:this
				},{
					text:'Отменить',
					handler:this.handleButton.createDelegate(this,['cancel']),
					scope:this
				}]
			});
			return this.win
		},
		show: function(options) {
			opts = options;
			dlg = this.getDialog(opts);
			dlg.show();
		}
	}
}()
