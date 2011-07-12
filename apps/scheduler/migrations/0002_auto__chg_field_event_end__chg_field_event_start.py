# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Changing field 'Event.end'
        db.alter_column('scheduler_event', 'end', self.gf('scheduler.models.CustomDateTimeField')(null=True))

        # Changing field 'Event.start'
        db.alter_column('scheduler_event', 'start', self.gf('scheduler.models.CustomDateTimeField')(null=True))


    def backwards(self, orm):
        
        # Changing field 'Event.end'
        db.alter_column('scheduler_event', 'end', self.gf('django.db.models.fields.DateTimeField')(null=True))

        # Changing field 'Event.start'
        db.alter_column('scheduler_event', 'start', self.gf('django.db.models.fields.DateTimeField')(null=True))


    models = {
        'scheduler.calendar': {
            'Meta': {'ordering': "('title',)", 'object_name': 'Calendar'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '300'})
        },
        'scheduler.event': {
            'Meta': {'ordering': "('cid',)", 'object_name': 'Event'},
            'ad': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'cid': ('django.db.models.fields.PositiveIntegerField', [], {'null': 'True', 'blank': 'True'}),
            'end': ('scheduler.models.CustomDateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'loc': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'n': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'notes': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'rem': ('django.db.models.fields.CharField', [], {'max_length': '60'}),
            'start': ('scheduler.models.CustomDateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '300'}),
            'url': ('django.db.models.fields.CharField', [], {'max_length': '300'})
        }
    }

    complete_apps = ['scheduler']
