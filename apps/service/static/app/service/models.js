Ext.ns('App.models');

App.models.BaseService = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'resource_uri'},
    {name: 'name'},
    {name: 'parent_uri'},
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

App.models.ExtendedService = new Ext.data.Record.create([
    {name: 'id'},
    {name: 'resource_uri'},
    {name: 'base_service'},
    {name: 'state'},
    {name: 'branches'},
    {name: 'tube'},
    {name: 'tube_count'},
    {name: 'is_active'},
    {name: 'is_manual'},
    {name: 'staff'},
    {name: 'code'},
    {name: 'base_profile'},
    {name: 'state_name'},
    {name: 'service_name'},
    {name: 'price'}
]);
