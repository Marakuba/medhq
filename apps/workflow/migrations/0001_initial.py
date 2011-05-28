# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Adding model 'Status'
        db.create_table('workflow_status', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=50)),
            ('type', self.gf('django.db.models.fields.CharField')(max_length=10)),
        ))
        db.send_create_signal('workflow', ['Status'])


    def backwards(self, orm):
        
        # Deleting model 'Status'
        db.delete_table('workflow_status')


    models = {
        'workflow.status': {
            'Meta': {'object_name': 'Status'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'type': ('django.db.models.fields.CharField', [], {'max_length': '10'})
        }
    }

    complete_apps = ['workflow']
