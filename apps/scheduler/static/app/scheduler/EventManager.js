Ext.ns('App','App.calendar');

App.calendar.eventManager = new Ext.util.Observable();
App.calendar.eventManager.addEvents('nodeclick');
App.calendar.eventManager.addEvents('preordercreate');
App.calendar.eventManager.addEvents('preorderwrite');
App.calendar.eventManager.addEvents('globalsearch');
