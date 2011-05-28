Ext.ns('App.reporting');

App.reporting.Designer = Ext.extend(Ext.Panel, {

	initComponent : function() {
		this.form = new Ext.form.FormPanel({
			height:40,
			padding:5,
			baseCls:'x-border-layout-ct',
			items:[{
				xtype:'textfield',
				fieldLabel:'Наименование',
				name:'name',
				anchor:'50%'
			}]
		});
		this.grids = {
			flex:1,
			layout:{
				type:'hbox',
				align:'stretch'
			},
			items:[{
				flex:1,
				record:this.record,
				xtype:'reportfiltergrid'
			},{
				flex:1,
				record:this.record,
				xtype:'reportfieldgrid'
			},{
				flex:1,
				record:this.record,
				xtype:'reportgroupgrid'
			},{
				flex:1,
				record:this.record,
				xtype:'reportsummarygrid'
			}]
		};
		var config = {
			closable:true,
			title:''+this.record.data.name,
			layout:{
				type:'vbox',
				align:'stretch'
			},
			defaults:{
				border:false
			},
			items:[this.form, this.grids],
			bbar:[{
				text:'Выполнить',
				scale:'medium',
				handler:this.onRun.createDelegate(this,[])
			},'->',{
				text:'Сохранить',
				scale:'medium',
				handler:this.onSave.createDelegate(this,[])
			},{
				text:'Отменить',
				scale:'medium',
				handler:this.onClose.createDelegate(this,[])
			}]
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.reporting.Designer.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender', function(){
			this.form.getForm().loadRecord(this.record);
		}, this);
	},
	
	onSave: function(){
		this.form.getForm().updateRecord(this.record);
		this.onClose();
	},
	
	onClose: function(){
		this.ownerCt.remove(this);
	},
	
	onRun: function(){
		var url = '/old/reporting/build_report/'+this.record.id+'/';
		window.open(url);
	} 
});