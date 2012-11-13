Ext.ns('App');

WebApp = new Ext.util.Observable();
WebApp.addEvents('globalsearch',
	'patientselect',
	'visitcreate',
	'visitclose',
	'visitchange',
	'visitwrite',
	'servicedblclick',
	'updatetotalsum',
	'patientwrite',
	'sumchange');
	
WebApp.addEvents('nodeclick');
WebApp.addEvents('addform');
WebApp.addEvents('clientcreate');
WebApp.addEvents('globalsearch');
WebApp.addEvents('openform');
//WebApp.addEvents('paymentsave');