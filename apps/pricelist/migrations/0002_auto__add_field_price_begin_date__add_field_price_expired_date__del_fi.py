# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Adding field 'Price.begin_date'
        db.add_column('pricelist_price', 'begin_date', self.gf('django.db.models.fields.DateField')(default=datetime.datetime(2010, 9, 8, 10, 56, 12, 218323)), keep_default=False)

        # Adding field 'Price.expired_date'
        db.add_column('pricelist_price', 'expired_date', self.gf('django.db.models.fields.DateField')(null=True), keep_default=False)

        # Deleting field 'PriceType.begin_date'
        db.delete_column('pricelist_pricetype', 'begin_date')

        # Deleting field 'PriceType.expired_date'
        db.delete_column('pricelist_pricetype', 'expired_date')


    def backwards(self, orm):
        
        # Deleting field 'Price.begin_date'
        db.delete_column('pricelist_price', 'begin_date')

        # Deleting field 'Price.expired_date'
        db.delete_column('pricelist_price', 'expired_date')

        # We cannot add back in field 'PriceType.begin_date'
        raise RuntimeError(
            "Cannot reverse this migration. 'PriceType.begin_date' and its values cannot be restored.")

        # We cannot add back in field 'PriceType.expired_date'
        raise RuntimeError(
            "Cannot reverse this migration. 'PriceType.expired_date' and its values cannot be restored.")


    models = {
        'pricelist.price': {
            'Meta': {'object_name': 'Price'},
            'begin_date': ('django.db.models.fields.DateField', [], {}),
            'expired_date': ('django.db.models.fields.DateField', [], {'null': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'service': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['service.BaseService']"}),
            'type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['pricelist.PriceType']"}),
            'value': ('django.db.models.fields.DecimalField', [], {'max_digits': '10', 'decimal_places': '2'})
        },
        'pricelist.pricetype': {
            'Meta': {'object_name': 'PriceType'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'only_for_state': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['state.State']", 'null': 'True'})
        },
        'service.baseservice': {
            'Meta': {'object_name': 'BaseService'},
            'code': ('django.db.models.fields.CharField', [], {'max_length': '25'}),
            'execution_time': ('django.db.models.fields.PositiveIntegerField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'level': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            'lft': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '250'}),
            'parent': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'children'", 'null': 'True', 'to': "orm['service.BaseService']"}),
            'rght': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            'standard_service': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['service.StandardService']", 'null': 'True'}),
            'tree_id': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'})
        },
        'service.standardservice': {
            'Meta': {'object_name': 'StandardService'},
            'code': ('django.db.models.fields.CharField', [], {'max_length': '20'}),
            'description': ('django.db.models.fields.CharField', [], {'max_length': '500'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'level': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            'lft': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '512'}),
            'parent': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'children'", 'null': 'True', 'to': "orm['service.StandardService']"}),
            'rght': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            'tree_id': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'})
        },
        'state.state': {
            'Meta': {'object_name': 'State'},
            'address_street': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'official_title': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'type': ('django.db.models.fields.CharField', [], {'max_length': '1'}),
            'website': ('django.db.models.fields.URLField', [], {'max_length': '200', 'blank': 'True'})
        }
    }

    complete_apps = ['pricelist']
