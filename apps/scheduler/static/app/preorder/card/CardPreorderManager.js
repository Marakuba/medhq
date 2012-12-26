!(function(){

    Ext.ns('App.preorder');

    App.preorder.CardPreorderManager = Ext.extend(App.preorder.PreorderManager, {
        hasPatient: true,
        closable: false
    });

    Ext.reg('cardpreordermanager', App.preorder.CardPreorderManager);

    if(!window['PatientCard']){
        window['PatientCard'] = [];
    }
    window.PatientCard.push(['cardpreordermanager', {}, 0]);

})();