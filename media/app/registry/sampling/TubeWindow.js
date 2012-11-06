Ext.ns('App.sampling');

App.sampling.TubeWindow = Ext.extend(Ext.Window, {

	initComponent:function(){

		this.lab = {
			layout:'form',
			items:new Ext.form.ComboBox({
				allowBlank:false,
				anchor:'98%',
	        	fieldLabel:'Лаборатория',
	        	name:'laboratory',
			    store: new Ext.data.JsonStore({
					proxy: new Ext.data.HttpProxy({
						url:App.getApiUrl('state','medstate'),
						method:'GET'
					}),
					root:'objects',
					idProperty:'resource_uri',
					fields:['resource_uri','name']
				}),
			    typeAhead: true,
			    queryParam:'name__istartswith',
			    minChars:3,
			    triggerAction: 'all',
			    emptyText:'Выберите лабораторию...',
			    valueField: 'resource_uri',
			    displayField: 'name',
			    selectOnFocus:true
			})
		};

		this.tube = {
			layout:'form',
			items:new Ext.form.ComboBox({
				allowBlank:false,
				anchor:'98%',
	        	fieldLabel:'Пробирка',
	        	name:'tube',
			    store: new Ext.data.JsonStore({
					proxy: new Ext.data.HttpProxy({
						url:App.getApiUrl('lab','tube'),
						method:'GET'
					}),
					root:'objects',
					idProperty:'resource_uri',
					fields:['resource_uri','name']
				}),
			    typeAhead: true,
			    queryParam:'name__istartswith',
			    minChars:3,
			    triggerAction: 'all',
			    emptyText:'Выберите пробирку...',
			    valueField: 'resource_uri',
			    displayField: 'name',
			    selectOnFocus:true
			})
		};

		this.form = new Ext.form.FormPanel({
			baseCls:'x-plain',
			padding:10,
			defaults:{
				border:false,
				baseCls:'x-plain'
			},
			items:[this.lab, this.tube]
		});

		config = {
			title:'Новая пробирка',
			width:600,
			height:170,
			layout:'fit',
			items: this.form,
			modal:true,
			buttons:[{
				text:'OK',
				handler:function(){
					var f = this.form.getForm();
					if (f.isValid()) {
						this.fireEvent('tubesubmit', f.getFieldValues());
						this.close();
					} else {
						Ext.MessageBox.alert('Ошибка!','Пожалуйста, заполните все поля');
					}
				},
				scope:this
			},{
				text:'Отмена',
				handler:function(){
					this.close();
				},
				scope:this
			}]
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.sampling.TubeWindow.superclass.initComponent.apply(this, arguments);

	}

});
