# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'AgeCategory'
        db.create_table('medstandart_agecategory', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=200)),
        ))
        db.send_create_signal('medstandart', ['AgeCategory'])

        # Adding model 'NosologicalForm'
        db.create_table('medstandart_nosologicalform', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=200)),
        ))
        db.send_create_signal('medstandart', ['NosologicalForm'])

        # Adding model 'Phase'
        db.create_table('medstandart_phase', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=200)),
        ))
        db.send_create_signal('medstandart', ['Phase'])

        # Adding model 'Stage'
        db.create_table('medstandart_stage', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=200)),
        ))
        db.send_create_signal('medstandart', ['Stage'])

        # Adding model 'Complications'
        db.create_table('medstandart_complications', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=200)),
        ))
        db.send_create_signal('medstandart', ['Complications'])

        # Adding model 'Term'
        db.create_table('medstandart_term', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=200)),
        ))
        db.send_create_signal('medstandart', ['Term'])

        # Adding model 'Standart'
        db.create_table('medstandart_standart', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('age_from', self.gf('django.db.models.fields.PositiveIntegerField')(default=0)),
            ('age_to', self.gf('django.db.models.fields.PositiveIntegerField')(default=250)),
            ('nosological_form', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['medstandart.NosologicalForm'], null=True, blank=True)),
            ('phase', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['medstandart.Phase'], null=True, blank=True)),
            ('stage', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['medstandart.Stage'], null=True, blank=True)),
            ('complications', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['medstandart.Complications'], null=True, blank=True)),
            ('mkb10', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['service.ICD10'], null=True, blank=True)),
        ))
        db.send_create_signal('medstandart', ['Standart'])

        # Adding M2M table for field age_category on 'Standart'
        db.create_table('medstandart_standart_age_category', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('standart', models.ForeignKey(orm['medstandart.standart'], null=False)),
            ('agecategory', models.ForeignKey(orm['medstandart.agecategory'], null=False))
        ))
        db.create_unique('medstandart_standart_age_category', ['standart_id', 'agecategory_id'])

        # Adding M2M table for field terms on 'Standart'
        db.create_table('medstandart_standart_terms', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('standart', models.ForeignKey(orm['medstandart.standart'], null=False)),
            ('term', models.ForeignKey(orm['medstandart.term'], null=False))
        ))
        db.create_unique('medstandart_standart_terms', ['standart_id', 'term_id'])

        # Adding model 'StandartItem'
        db.create_table('medstandart_standartitem', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('standart', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['medstandart.Standart'])),
            ('base_service', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['service.BaseService'])),
            ('frequency', self.gf('django.db.models.fields.DecimalField')(default=1, max_digits=7, decimal_places=4)),
            ('average', self.gf('django.db.models.fields.DecimalField')(default=1, max_digits=7, decimal_places=4)),
        ))
        db.send_create_signal('medstandart', ['StandartItem'])

    def backwards(self, orm):
        # Deleting model 'AgeCategory'
        db.delete_table('medstandart_agecategory')

        # Deleting model 'NosologicalForm'
        db.delete_table('medstandart_nosologicalform')

        # Deleting model 'Phase'
        db.delete_table('medstandart_phase')

        # Deleting model 'Stage'
        db.delete_table('medstandart_stage')

        # Deleting model 'Complications'
        db.delete_table('medstandart_complications')

        # Deleting model 'Term'
        db.delete_table('medstandart_term')

        # Deleting model 'Standart'
        db.delete_table('medstandart_standart')

        # Removing M2M table for field age_category on 'Standart'
        db.delete_table('medstandart_standart_age_category')

        # Removing M2M table for field terms on 'Standart'
        db.delete_table('medstandart_standart_terms')

        # Deleting model 'StandartItem'
        db.delete_table('medstandart_standartitem')

    models = {
        'medstandart.agecategory': {
            'Meta': {'ordering': "('name',)", 'object_name': 'AgeCategory'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'})
        },
        'medstandart.complications': {
            'Meta': {'ordering': "('name',)", 'object_name': 'Complications'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'})
        },
        'medstandart.nosologicalform': {
            'Meta': {'ordering': "('name',)", 'object_name': 'NosologicalForm'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'})
        },
        'medstandart.phase': {
            'Meta': {'ordering': "('name',)", 'object_name': 'Phase'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'})
        },
        'medstandart.stage': {
            'Meta': {'ordering': "('name',)", 'object_name': 'Stage'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'})
        },
        'medstandart.standart': {
            'Meta': {'ordering': "('name',)", 'object_name': 'Standart'},
            'age_category': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['medstandart.AgeCategory']", 'null': 'True', 'blank': 'True'}),
            'age_from': ('django.db.models.fields.PositiveIntegerField', [], {'default': '0'}),
            'age_to': ('django.db.models.fields.PositiveIntegerField', [], {'default': '250'}),
            'complications': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['medstandart.Complications']", 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'mkb10': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['service.ICD10']", 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'nosological_form': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['medstandart.NosologicalForm']", 'null': 'True', 'blank': 'True'}),
            'phase': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['medstandart.Phase']", 'null': 'True', 'blank': 'True'}),
            'stage': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['medstandart.Stage']", 'null': 'True', 'blank': 'True'}),
            'terms': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['medstandart.Term']", 'null': 'True', 'blank': 'True'})
        },
        'medstandart.standartitem': {
            'Meta': {'ordering': "('standart',)", 'object_name': 'StandartItem'},
            'average': ('django.db.models.fields.DecimalField', [], {'default': '1', 'max_digits': '7', 'decimal_places': '4'}),
            'base_service': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['service.BaseService']"}),
            'frequency': ('django.db.models.fields.DecimalField', [], {'default': '1', 'max_digits': '7', 'decimal_places': '4'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'standart': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['medstandart.Standart']"})
        },
        'medstandart.term': {
            'Meta': {'ordering': "('name',)", 'object_name': 'Term'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'})
        },
        'numeration.numerator': {
            'Meta': {'ordering': "('name',)", 'object_name': 'Numerator'},
            'current': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'max_value': ('django.db.models.fields.IntegerField', [], {'default': '999'}),
            'min_value': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'prefix': ('django.db.models.fields.CharField', [], {'max_length': '10', 'blank': 'True'}),
            'reset_on': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'tag': ('django.db.models.fields.CharField', [], {'max_length': '20'}),
            'valid_till': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime(2012, 7, 20, 0, 0)'})
        },
        'service.baseservice': {
            'Meta': {'ordering': "('name',)", 'object_name': 'BaseService'},
            'base_group': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['service.BaseServiceGroup']", 'null': 'True', 'blank': 'True'}),
            'code': ('django.db.models.fields.CharField', [], {'max_length': '25', 'null': 'True', 'blank': 'True'}),
            'conditions': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['service.Condition']", 'null': 'True', 'blank': 'True'}),
            'description': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'execution_time': ('django.db.models.fields.PositiveIntegerField', [], {'null': 'True', 'blank': 'True'}),
            'execution_type_group': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['service.ExecutionTypeGroup']", 'null': 'True', 'blank': 'True'}),
            'gen_ref_interval': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'inner_template': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'is_group': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'lab_group': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['service.LabServiceGroup']", 'null': 'True', 'blank': 'True'}),
            'level': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            'lft': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            'material': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['service.Material']", 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '300'}),
            'parent': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'children'", 'null': 'True', 'to': "orm['service.BaseService']"}),
            'partnership': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'rght': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            'short_name': ('django.db.models.fields.CharField', [], {'max_length': '300', 'null': 'True', 'blank': 'True'}),
            'standard_service': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['service.StandardService']", 'null': 'True'}),
            'tree_id': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            'type': ('django.db.models.fields.CharField', [], {'default': "u'cons'", 'max_length': '10'}),
            'version': ('django.db.models.fields.PositiveIntegerField', [], {'default': '0', 'null': 'True', 'blank': 'True'})
        },
        'service.baseservicegroup': {
            'Meta': {'object_name': 'BaseServiceGroup'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        'service.condition': {
            'Meta': {'object_name': 'Condition'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        'service.executiontypegroup': {
            'Meta': {'object_name': 'ExecutionTypeGroup'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        'service.icd10': {
            'Meta': {'ordering': "('code',)", 'object_name': 'ICD10'},
            'code': ('django.db.models.fields.CharField', [], {'max_length': '20'}),
            'description': ('django.db.models.fields.TextField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'level': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            'lft': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '512'}),
            'parent': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'children'", 'null': 'True', 'to': "orm['service.ICD10']"}),
            'rght': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            'tree_id': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'})
        },
        'service.labservicegroup': {
            'Meta': {'object_name': 'LabServiceGroup'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'numerator': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['numeration.Numerator']", 'null': 'True', 'blank': 'True'}),
            'template': ('django.db.models.fields.CharField', [], {'default': "'print/lab/results.html'", 'max_length': '100'})
        },
        'service.material': {
            'Meta': {'object_name': 'Material'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        'service.standardservice': {
            'Meta': {'ordering': "('code',)", 'object_name': 'StandardService'},
            'code': ('django.db.models.fields.CharField', [], {'max_length': '20'}),
            'description': ('django.db.models.fields.CharField', [], {'max_length': '500', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'level': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            'lft': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '512'}),
            'parent': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'children'", 'null': 'True', 'to': "orm['service.StandardService']"}),
            'rght': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            'tree_id': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'})
        }
    }

    complete_apps = ['medstandart']