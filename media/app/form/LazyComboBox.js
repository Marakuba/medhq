Ext.form.LazyComboBox = Ext.extend(Ext.form.ComboBox, {
	
	initComponent: function(){

		config = {
		    store: new Ext.data.JsonStore({
		    	autoLoad:this.autoLoad || false,
				proxy: new Ext.data.HttpProxy({
					url:this.proxyUrl,
					method:'GET'
				}),
				root:'objects',
				idProperty:'resource_uri',
				fields:['resource_uri','name','value']
			}),
		    typeAhead: true,
		    queryParam:'name__istartswith',
		    minChars:2,
		    triggerAction: 'all',
		    valueField: 'resource_uri',
		    displayField: 'name',
		    selectOnFocus:true
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		Ext.form.LazyComboBox.superclass.initComponent.apply(this, arguments);
		this.store.on('load',function(){
			this.setValue(this._cachedValue);
			this.originalValue = this.getValue();
		},this);
	},
	
	setValue:function(value) {
		if(value) {
			if(!this.store.getTotalCount()){
				this._cachedValue = value;
				this.store.load();
			} else {
				Ext.form.LazyComboBox.superclass.setValue.call(this, value);
			}
		}
	},
	
	forceValue:function(value) {
		this._cachedValue = value;
		this.store.load();
	}
});

Ext.form.LazyClearableComboBox = Ext.extend(Ext.form.ClearableComboBox, {
	
	initComponent: function(){

		config = {
		    store: new Ext.data.JsonStore({
		    	autoLoad:this.autoLoad || false,
				proxy: new Ext.data.HttpProxy({
					url:this.proxyUrl,
					method:'GET'
				}),
				root:'objects',
				idProperty:'resource_uri',
				fields:['resource_uri','name','value']
			}),
		    typeAhead: true,
		    queryParam:'name__istartswith',
		    minChars:2,
		    triggerAction: 'all',
		    valueField: 'resource_uri',
		    displayField: 'name',
		    selectOnFocus:true
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		Ext.form.LazyClearableComboBox.superclass.initComponent.apply(this, arguments);
		this.store.on('load',function(){
			this.setValue(this._cachedValue);
			this.originalValue = this.getValue();
		},this);
	},
	
	setValue:function(value) {
		if(value) {
			if(!this.store.getTotalCount()){
				this._cachedValue = value;
				this.store.load();
			} else {
				Ext.form.LazyComboBox.superclass.setValue.call(this, value);
			}
		}
	},
	
	forceValue:function(value) {
		this._cachedValue = value;
		this.store.load();
	}
});

Ext.reg('lazycombobox', Ext.form.LazyComboBox);
Ext.reg('lazyclearablecombobox', Ext.form.LazyClearableComboBox);