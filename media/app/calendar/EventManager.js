Ext.ns('App');

App.eventManager = new Ext.util.Observable();
App.eventManager.addEvents('nodeclick');
App.eventManager.addEvents('preordercreate');
App.eventManager.addEvents('globalsearch');
