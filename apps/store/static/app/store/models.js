Ext.ns('App.models');

App.models.Product = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'name'},
    {name: 'parent'},
    {name: 'parent_uri'},
    {name: 'full_name'},
    {name: 'unit'},
    {name: 'is_group'},
    {name: 'delivery_preriod'}

]);
