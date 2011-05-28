# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Adding model 'AdrType'
        db.create_table('rusgeo_adrtype', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('level', self.gf('django.db.models.fields.PositiveIntegerField')()),
            ('shortcut', self.gf('django.db.models.fields.CharField')(max_length=10)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=29)),
        ))
        db.send_create_signal('rusgeo', ['AdrType'])

        # Adding model 'Region'
        db.create_table('rusgeo_region', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=40)),
            ('code', self.gf('django.db.models.fields.CharField')(max_length=2)),
            ('adrtype', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['rusgeo.AdrType'])),
        ))
        db.send_create_signal('rusgeo', ['Region'])

        # Adding model 'District'
        db.create_table('rusgeo_district', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=40)),
            ('code', self.gf('django.db.models.fields.CharField')(max_length=3)),
            ('adrtype', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['rusgeo.AdrType'])),
            ('status', self.gf('django.db.models.fields.CharField')(max_length=1)),
        ))
        db.send_create_signal('rusgeo', ['District'])

        # Adding model 'City'
        db.create_table('rusgeo_city', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=40)),
            ('code', self.gf('django.db.models.fields.CharField')(max_length=3)),
            ('adrtype', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['rusgeo.AdrType'])),
            ('region', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['rusgeo.Region'])),
            ('district', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['rusgeo.District'], null=True, blank=True)),
            ('major_city', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['rusgeo.City'], null=True, blank=True)),
            ('status', self.gf('django.db.models.fields.CharField')(max_length=1)),
        ))
        db.send_create_signal('rusgeo', ['City'])


    def backwards(self, orm):
        
        # Deleting model 'AdrType'
        db.delete_table('rusgeo_adrtype')

        # Deleting model 'Region'
        db.delete_table('rusgeo_region')

        # Deleting model 'District'
        db.delete_table('rusgeo_district')

        # Deleting model 'City'
        db.delete_table('rusgeo_city')


    models = {
        'rusgeo.adrtype': {
            'Meta': {'object_name': 'AdrType'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'level': ('django.db.models.fields.PositiveIntegerField', [], {}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '29'}),
            'shortcut': ('django.db.models.fields.CharField', [], {'max_length': '10'})
        },
        'rusgeo.city': {
            'Meta': {'object_name': 'City'},
            'adrtype': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['rusgeo.AdrType']"}),
            'code': ('django.db.models.fields.CharField', [], {'max_length': '3'}),
            'district': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['rusgeo.District']", 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'major_city': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['rusgeo.City']", 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '40'}),
            'region': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['rusgeo.Region']"}),
            'status': ('django.db.models.fields.CharField', [], {'max_length': '1'})
        },
        'rusgeo.district': {
            'Meta': {'object_name': 'District'},
            'adrtype': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['rusgeo.AdrType']"}),
            'code': ('django.db.models.fields.CharField', [], {'max_length': '3'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '40'}),
            'status': ('django.db.models.fields.CharField', [], {'max_length': '1'})
        },
        'rusgeo.region': {
            'Meta': {'object_name': 'Region'},
            'adrtype': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['rusgeo.AdrType']"}),
            'code': ('django.db.models.fields.CharField', [], {'max_length': '2'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '40'})
        }
    }

    complete_apps = ['rusgeo']
