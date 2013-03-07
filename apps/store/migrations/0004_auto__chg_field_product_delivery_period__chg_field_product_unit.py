# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):

        # Changing field 'Product.delivery_period'
        db.alter_column('store_product', 'delivery_period', self.gf('django.db.models.fields.PositiveIntegerField')(max_length=3, null=True))

        # Changing field 'Product.unit'
        db.alter_column('store_product', 'unit_id', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['core.Unit'], null=True))

    def backwards(self, orm):

        # User chose to not deal with backwards NULL issues for 'Product.delivery_period'
        raise RuntimeError("Cannot reverse this migration. 'Product.delivery_period' and its values cannot be restored.")

        # User chose to not deal with backwards NULL issues for 'Product.unit'
        raise RuntimeError("Cannot reverse this migration. 'Product.unit' and its values cannot be restored.")

    models = {
        'core.unit': {
            'Meta': {'ordering': "('name',)", 'object_name': 'Unit'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        'store.product': {
            'Meta': {'ordering': "('name',)", 'object_name': 'Product'},
            'code': ('django.db.models.fields.CharField', [], {'max_length': '60', 'null': 'True', 'blank': 'True'}),
            'delivery_period': ('django.db.models.fields.PositiveIntegerField', [], {'max_length': '3', 'null': 'True', 'blank': 'True'}),
            'full_name': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_group': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'level': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            'lft': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '150'}),
            'parent': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'children'", 'null': 'True', 'to': "orm['store.Product']"}),
            'rght': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            'tree_id': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            'unit': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['core.Unit']", 'null': 'True', 'blank': 'True'})
        }
    }

    complete_apps = ['store']