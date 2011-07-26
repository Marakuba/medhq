# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Changing field 'Event.url'
        db.alter_column('scheduler_event', 'url', self.gf('django.db.models.fields.CharField')(max_length=300, null=True))

        # Changing field 'Event.rem'
        db.alter_column('scheduler_event', 'rem', self.gf('django.db.models.fields.CharField')(max_length=60, null=True))


    def backwards(self, orm):
        
        # User chose to not deal with backwards NULL issues for 'Event.url'
        raise RuntimeError("Cannot reverse this migration. 'Event.url' and its values cannot be restored.")

        # User chose to not deal with backwards NULL issues for 'Event.rem'
        raise RuntimeError("Cannot reverse this migration. 'Event.rem' and its values cannot be restored.")


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
            'rem': ('django.db.models.fields.CharField', [], {'max_length': '60', 'null': 'True', 'blank': 'True'}),
            'start': ('scheduler.models.CustomDateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '300'}),
            'url': ('django.db.models.fields.CharField', [], {'max_length': '300', 'null': 'True', 'blank': 'True'})
        }
    }

    complete_apps = ['scheduler']
