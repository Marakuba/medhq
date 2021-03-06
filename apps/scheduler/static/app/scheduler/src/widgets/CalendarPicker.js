/*!
 * Ext JS Library 3.3.0
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
/**
 * @class Ext.calendar.CalendarPicker
 * @extends Ext.form.ComboBox
 * <p>A custom combo used for choosing from the list of available calendars to assign an event to.</p>
 * <p>This is pretty much a standard combo that is simply pre-configured for the options needed by the
 * calendar components. The default configs are as follows:<pre><code>
    fieldLabel: 'Calendar',
    valueField: 'CalendarId',
    displayField: 'Title',
    triggerAction: 'all',
    mode: 'local',
    forceSelection: true,
    width: 200
</code></pre>
 * @constructor
 * @param {Object} config The config object
 */
Ext.ns('Ext.calendar');
Ext.calendar.CalendarPicker = Ext.extend(Ext.form.ComboBox, {
    fieldLabel: 'Календарь',
    valueField: 'CalendarId',
    displayField: 'Title',
    triggerAction: 'all',
    mode: 'local',
    forceSelection: true,
    width: 200,
    // private
    initComponent: function() {
        Ext.calendar.CalendarPicker.superclass.initComponent.call(this);
        this.tpl = this.tpl ||
        new Ext.XTemplate('<tpl for="."><div class="x-combo-list-item ext-color-{' + this.valueField +
        ':this.idToColor}"><div class="ext-cal-picker-icon">&nbsp;</div>{' + this.displayField + '}</div></tpl>',
        	{idToColor:Ext.idToColor});
    },

    // private
    afterRender: function() {
        Ext.calendar.CalendarPicker.superclass.afterRender.call(this);

        this.wrap = this.el.up('.x-form-field-wrap');
        this.wrap.addClass('ext-calendar-picker');

        this.icon = Ext.DomHelper.append(this.wrap, {
            tag: 'div',
            cls: 'ext-cal-picker-icon ext-cal-picker-mainicon'
        });
    },

    // inherited docs
    setValue: function(value) {
    	//value = this.colorID;
        this.wrap.removeClass('ext-color-' + Ext.idToColor(this.getValue()));
        if (!value && this.store !== undefined) {
            // always default to a valid calendar
            value = this.store.getAt(0).data.CalendarId;
        }
        Ext.calendar.CalendarPicker.superclass.setValue.call(this, value);
        this.wrap.addClass('ext-color-' + Ext.idToColor(value));
    }
});

Ext.reg('calendarpicker', Ext.calendar.CalendarPicker);
