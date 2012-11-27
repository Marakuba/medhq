Ext.ns('App.issue');

App.issue.IssueForm = Ext.extend(Ext.form.FormPanel, {

	initComponent: function(){
		config = {
			labelAlign:'top',
			baseCls:'x-plain',
			border:false,
			padding:5,
			defaults: {
				baseCls:'x-plain',
				border:false
			},
			items:[{
				xtype:'lazycombobox',
				proxyUrl:App.utils.getApiUrl('helpdesk','issuetype'),
				fieldLabel:'Категория',
				name:'type',
				anchor:'50%'
			},new Ext.form.ComboBox({
				fieldLabel:'Важность',
				name:'level',
				store:new Ext.data.ArrayStore({
					fields:['id','title'],
					data: [
						[0,'Низкая'],
						[1,'Средняя'],
						[2,'Высокая'],
						[3,'Критическая']
					]
				}),
				typeAhead: true,
				triggerAction: 'all',
				valueField:'id',
				displayField:'title',
				mode: 'local',
				forceSelection:true,
				selectOnFocus:true,
				editable:false
			}),{
				xtype:'textfield',
				fieldLabel:'Заголовок',
				name:'title',
				anchor:'98%'
			},{
				xtype:'textarea',
				fieldLabel:'Описание',
				name:'description',
				anchor:'98% 50%',
			}]
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.issue.IssueForm.superclass.initComponent.apply(this, arguments);
	},

	getRecord: function() {
		if(!this.record) {
			if(this.model) {
				var Model = this.model;
				this.record = new Model();
			} else {
				console.log('Ошибка: нет модели');
			}
		}
		return this.record;
	},

	onSave: function() {
		var f = this.getForm();
		if(f.isValid()){
			var Record = this.getRecord();
			f.updateRecord(Record);
			if(this.fn) {
				Ext.callback(this.fn, this.scope || window, [Record]);
			}
		} else {
			Ext.MessageBox.alert('Предупреждение','Пожалуйста, заполните все поля формы!');
		}
	}

});


Ext.reg('issueform', App.issue.IssueForm);
