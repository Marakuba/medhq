Ext.ns('Ext.ux.form');

Ext.ux.form.TagField = Ext.extend(Ext.form.TextField, {

	initComponent: function(){
		
		config = {
		}
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		Ext.ux.form.TagField.superclass.initComponent.call(this);
	},
	
	onRender: function(ct, position) {
		Ext.ux.form.TagField.superclass.onRender.call(this, ct, position);
		
		this.wrap = this.el.wrap();
		this.style = {
			display:'none'
		};
		if(this.tags) {
			var wd = 0;
			Ext.each(this.tags, function(tag,i){
				var bx = new Ext.BoxComponent({
					autoEl:{
						tag:'a',
						href:'#',
						cls:'tag',
						html:tag,
						qtip:'Удалить этот тэг'
					},
					renderTo:this.wrap
				}); 
				wd+= bx.el.getWidth();
			}, this);
		}

		this.wrap.setWidth(wd);
		this.resizeEl = this.positionEl = this.wrap;
	}
	
});

Ext.reg('tagfield', Ext.ux.form.TagField);