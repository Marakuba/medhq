Ext.ns('App.settings','App.accounting');

Ext.onReady(function(){

    Ext.QuickTips.init();

    Ext.Ajax.defaultHeaders = {Accept:'application/json'};

    //medstateStore - Список организаций. Передаётся во все компоненты, где это необходимо.
    // Вынесен в app для исключения множественной загрузки идентичных данных

    var medstateStore = new Ext.data.RESTStore({
        autoSave: true,
        autoLoad : true,
        apiUrl : App.getApiUrl('state','state','medstate'),
        model: App.models.MedState
    });

    var centralPanel = new App.AccCentralPanel({
        medstateStore:medstateStore
    });

    var viewport = new Ext.Viewport({
        layout:'border',
        items:[centralPanel]
    });

    centralPanel.launchApp('accounting');
    // centralPanel.launchApp('accinvoiceapp', {
    //     // contractId: 1
    //     invoiceId: 17
    // }, true);


});
