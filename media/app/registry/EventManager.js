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