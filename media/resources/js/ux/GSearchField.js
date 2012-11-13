App.SearchField = Ext.extend(Ext.form.TwinTriggerField, {
    initComponent : function(){
        /*if(!this.store.baseParams){
			this.store.baseParams = {};
		}*/
    	this.params = {};
		App.SearchField.superclass.initComponent.call(this);
		this.on('specialkey', function(f, e){
            if(e.getKey() == e.ENTER){
                this.onTrigger2Click();
            }
        }, this);
    },

    validationEvent:false,
    validateOnBlur:false,
    trigger1Class:'x-form-clear-trigger',
    trigger2Class:'x-form-search-trigger',
    hideTrigger1:true,
    width:180,
    hasSearch : false,
    paramName : 'last_name__istartswith',

    onTrigger1Click : function(){
        if(this.hasSearch){
        	WebApp.fireEvent('globalsearch',undefined);
			this.el.dom.value = '';
            this.triggers[0].hide();
            this.hasSearch = false;
			this.focus();
        }
    },

    onTrigger2Click : function(){
        var v = this.getRawValue();
        if(v.length < 1){
            this.onTrigger1Click();
            return;
        }
		WebApp.fireEvent('globalsearch', v);
        this.hasSearch = true;
        this.triggers[0].show();
		this.focus();
    },
    
    imitate: function(val) {
    	this.setValue(val);
    	this.onTrigger2Click();
    }
});


Ext.reg('gsearchfield', App.SearchField);