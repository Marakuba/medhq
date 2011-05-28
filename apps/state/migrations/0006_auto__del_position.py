# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Deleting model 'Position'
        db.delete_table('state_position')


    def backwards(self, orm):
        
        # Adding model 'Position'
        db.create_table('state_position', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=200)),
        ))
        db.send_create_signal('state', ['Position'])


    models = {
        'state.department': {
            'Meta': {'object_name': 'Department'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'state': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['state.State']"})
        },
        'state.state': {
            'Meta': {'object_name': 'State'},
            'address_street': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'bank_details': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'inn': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '12', 'decimal_places': '0', 'blank': 'True'}),
            'kpp': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '9', 'decimal_places': '0', 'blank': 'True'}),
            'licenses': ('django.db.models.fields.CharField', [], {'max_length': '150', 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'official_title': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'ogrn': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '15', 'decimal_places': '0', 'blank': 'True'}),
            'phones': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'print_name': ('django.db.models.fields.CharField', [], {'default': "u''", 'max_length': '200'}),
            'type': ('django.db.models.fields.CharField', [], {'max_length': '1'}),
            'website': ('django.db.models.fields.URLField', [], {'max_length': '200', 'blank': 'True'})
        }
    }

    complete_apps = ['state']
