Ext.onReady(function(){
    var comboCategory = new Ext.form.ComboBox({
    fieldLabel    : 'Category',
    name        : 'category',
           allowBlank     : false,
           store        : ['Business', 'Personal'],
           typeAhead    : true,
    mode        : 'local',
    triggerAction    : 'all',
    emptyText    :'-- Select category --',
    selectOnFocus    :true
   });

   var active = new Ext.form.Checkbox({
     name        : 'active',
     fieldLabel : 'Active',
     checked    : true,
     inputValue : '1'
   });

   var datetime = new Ext.form.CompositeField({
   	items:[new Ext.form.DateField({}), new Ext.form.TimeField({})]
   });
   
   var propsGrid = new Ext.grid.PropertyGrid({
        el:'props-grid',
        nameText: 'Properties Grid',
        width:300,
        autoHeight:true,
        viewConfig : {
            forceFit:true,
            scrollOffset:2 // the grid will never have scrollbars
        },
	    customEditors: {
            'Category': new Ext.grid.GridEditor(comboCategory),
    	    'Active'  : new Ext.grid.GridEditor(active),
    	    'created': new Ext.grid.GridEditor(new Ext.form.DateField({ altFormats:'d.m.Y',format:'d.m.Y' }))
        }
    });

    propsGrid.render();
    
    propsGrid.setSource({
        "(name)": "Properties Grid11",
        "grouping": false,
        "autoFitColumns": true,
        "productionQuality": false,
        "created": new Date(Date.parse('26.03.2011')),
        "tested": false,
        "version": 0.01,
        "borderWidth": 1,
        "Category": 'Personal',
    "Active" : true
    });
});