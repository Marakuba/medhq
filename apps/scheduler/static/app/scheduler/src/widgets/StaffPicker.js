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
Ext.calendar.StaffPicker = Ext.extend(Ext.form.ComboBox, {
    fieldLabel: 'Врач',
    valueField: 'Staff',
    displayField: 'Name',
    triggerAction: 'all',
    mode: 'local',
    forceSelection: true,
    width: 200,

    // private
    initComponent: function() {
        Ext.calendar.StaffPicker.superclass.initComponent.call(this);
        this.tpl = this.tpl ||
        '<tpl for="."><div class="x-combo-list-item ext-color-{' + this.valueField +
        '}"><div class="ext-cal-picker-icon">&nbsp;</div>{' + this.displayField + '}</div></tpl>';
    },

    // private
    afterRender: function() {
        Ext.calendar.StaffPicker.superclass.afterRender.call(this);

        this.wrap = this.el.up('.x-form-field-wrap');
        this.wrap.addClass('ext-staff-picker');

        this.icon = Ext.DomHelper.append(this.wrap, {
            tag: 'div',
            cls: 'ext-staff-picker-icon ext-cal-picker-mainicon'
        });
    },

    // inherited docs
    setValue: function(value) {
        this.wrap.removeClass('ext-color-' + this.getValue());
        if (!value && this.store !== undefined) {
            // always default to a valid calendar
            value = this.store.getAt(0).data.Staff;
        }
        Ext.calendar.StaffPicker.superclass.setValue.call(this, value);
        this.wrap.addClass('ext-color-' + value);
    }
});

Ext.reg('staffpicker', Ext.calendar.StaffPicker);