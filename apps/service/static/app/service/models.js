Ext.ns('App.models');


App.models.BaseService = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'resource_uri'},
    {name: 'name'},
    {name: 'parent'},
    {name: 'base_group'},
    {name: 'execution_type_group'},
    {name: 'short_name'},
    {name: 'code'},
    {name: 'standard_service'},
    {name: 'execution_time'},
    {name: 'partnership'},
    {name: 'version'},
    {name: 'is_group'},
    {name: 'material'},
    {name: 'gen_ref_interval'},
    {name: 'lab_group'},
    {name: 'inner_template'},
    {name: 'conditions'},
    {name: 'description'},
    {name: 'type'}
]);