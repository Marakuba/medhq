Ext.ns('App');

App.eventManager = new Ext.util.Observable();
App.eventManager.addEvents('globalsearch',
	'patientselect',
	'visitcreate',
	'visitclose',
	'visitchange',
	'visitwrite',
	'servicedblclick',
	'updatetotalsum',
	'patientwrite',
	'sumchange');
	
App.eventManager.addEvents('nodeclick');
App.eventManager.addEvents('addform');
App.eventManager.addEvents('clientcreate');
App.eventManager.addEvents('globalsearch');
App.eventManager.addEvents('openform');