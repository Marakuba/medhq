Ext.form.LazyComboBox = Ext.extend(Ext.form.ComboBox, {
	

	
    typeAhead: true,
    queryParam:'name__istartswith',
    minChars:2,
    triggerAction: 'all',
    valueField: 'resource_uri',
    displayField: 'name',
    selectOnFocus:true,

    initComponent: function(){

		config = {
		    store: this.store || new Ext.data.JsonStore({
		    	autoLoad:this.autoLoad || false,
				proxy: new Ext.data.HttpProxy({
					url:this.proxyUrl,
					method:'GET'
				}),
				root:'objects',
				idProperty:'resource_uri',
				fields:['resource_uri','name']
			})
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		Ext.form.LazyComboBox.superclass.initComponent.apply(this, arguments);
	},
	
	setValue:function(value) {
		if(value) {
        	if(!this.store.getTotalCount()){
            	this._cachedValue = value;
                this.store.load({
                	params: {
                    	id:App.utils.uriToId(value)
                    },
                	callback: function(r, opts, success){
                    	if(r.length) {
                        	this.setValue(this._cachedValue);
                            this.originalValue = this.getValue();
                            this.fireEvent('forceload',this,value);
                        }
                    },
                    scope:this
                });
            } else {
                Ext.form.LazyComboBox.superclass.setValue.call(this, value);
            }
        }
	},
	
	forceValue:function(value) {
		this._cachedValue = value;
		this.store.load({
			params: {
				id:App.utils.uriToId(value)
			},
			callback: function(r, opts, success){
				if(r.length) {
					this.setValue(this._cachedValue);
					this.originalValue = this.getValue();
					this.fireEvent('forceload',this,value);
				}
			},
			scope:this
		});
	}
});

Ext.form.LazyClearableComboBox = Ext.extend(Ext.form.ClearableComboBox, {

    queryParam:'name__istartswith',
    valueField: 'resource_uri',
    displayField: 'name',

    initComponent: function(){

		config = {
			store: this.store || new Ext.data.JsonStore({
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
			minChars:2,
			triggerAction: 'all',
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
                                this.store.load({
                                        params: {
                                                id:App.utils.uriToId(value)
                                        },
                                        callback: function(r, opts, success){
                                                if(r.length) {
                                                        this.setValue(this._cachedValue);
                                                        this.originalValue = this.getValue();
                                                        this.fireEvent('forceload',this,value);
                                                }
                                        },
                                        scope:this
                                });
                        } else {
                                Ext.form.LazyComboBox.superclass.setValue.call(this, value);
                        }
                }
        },

	forceValue:function(value) {
		this._cachedValue = value;
		this.store.load({
			params: {
				id:App.utils.uriToId(value)
			},
			callback: function(r, opts, success){
				if(r.length) {
					this.setValue(this._cachedValue);
					this.originalValue = this.getValue();
					this.fireEvent('forceload',this,value);
				}
			},
			scope:this
		});
	}
});

Ext.reg('lazycombobox', Ext.form.LazyComboBox);
