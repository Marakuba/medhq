# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Adding model 'AdSource'
        db.create_table('crm_adsource', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=200)),
        ))
        db.send_create_signal('crm', ['AdSource'])


    def backwards(self, orm):
        
        # Deleting model 'AdSource'
        db.delete_table('crm_adsource')


    models = {
        'crm.adsource': {
            'Meta': {'ordering': "('name',)", 'object_name': 'AdSource'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'})
        }
    }

    complete_apps = ['crm']
