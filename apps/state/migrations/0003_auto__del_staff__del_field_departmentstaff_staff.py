# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Deleting model 'Staff'
        db.delete_table('state_staff')

        # Deleting field 'DepartmentStaff.staff'
        db.delete_column('state_departmentstaff', 'staff_id')


    def backwards(self, orm):
        
        # Adding model 'Staff'
        db.create_table('state_staff', (
            ('last_name', self.gf('django.db.models.fields.CharField')(max_length=50)),
            ('speciality', self.gf('django.db.models.fields.CharField')(max_length=100, blank=True)),
            ('idcard_organization', self.gf('django.db.models.fields.CharField')(max_length=100, blank=True)),
            ('birth_day', self.gf('django.db.models.fields.DateField')()),
            ('operator', self.gf('django.db.models.fields.related.ForeignKey')(related_name='operator_in_staff', to=orm['auth.User'])),
            ('home_address_street', self.gf('django.db.models.fields.CharField')(max_length=100, blank=True)),
            ('idcard_series', self.gf('django.db.models.fields.CharField')(max_length=10, blank=True)),
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('medical_experience', self.gf('django.db.models.fields.CharField')(max_length=2, blank=True)),
            ('first_name', self.gf('django.db.models.fields.CharField')(max_length=50)),
            ('work_phone', self.gf('django.db.models.fields.CharField')(max_length=15, blank=True)),
            ('idcard_number', self.gf('django.db.models.fields.CharField')(max_length=5, blank=True)),
            ('home_phone', self.gf('django.db.models.fields.CharField')(max_length=15, blank=True)),
            ('high_school', self.gf('django.db.models.fields.CharField')(max_length=200, blank=True)),
            ('work_address_street', self.gf('django.db.models.fields.CharField')(max_length=100, blank=True)),
            ('mobile_phone', self.gf('django.db.models.fields.CharField')(max_length=15, blank=True)),
            ('idcard_type', self.gf('django.db.models.fields.CharField')(max_length=1, blank=True)),
            ('high_school_end_date', self.gf('django.db.models.fields.PositiveIntegerField')(null=True, blank=True)),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(related_name='staff_user_field', null=True, to=orm['auth.User'], blank=True)),
            ('created', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('gender', self.gf('django.db.models.fields.CharField')(max_length=1)),
            ('idcard_issue_date', self.gf('django.db.models.fields.DateField')(null=True, blank=True)),
            ('mid_name', self.gf('django.db.models.fields.CharField')(max_length=50, blank=True)),
            ('spec_experience', self.gf('django.db.models.fields.CharField')(max_length=2, blank=True)),
        ))
        db.send_create_signal('state', ['Staff'])

        # We cannot add back in field 'DepartmentStaff.staff'
        raise RuntimeError(
            "Cannot reverse this migration. 'DepartmentStaff.staff' and its values cannot be restored.")


    models = {
        'service.baseservice': {
            'Meta': {'ordering': "('name',)", 'object_name': 'BaseService'},
            'code': ('django.db.models.fields.CharField', [], {'max_length': '25', 'null': 'True', 'blank': 'True'}),
            'execution_form': ('django.db.models.fields.CharField', [], {'default': "u'\\u043f'", 'max_length': '1'}),
            'execution_place': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['state.State']", 'null': 'True', 'through': "orm['service.ExecutionPlace']", 'blank': 'True'}),
            'execution_time': ('django.db.models.fields.PositiveIntegerField', [], {'null': 'True', 'blank': 'True'}),
            'gen_ref_interval': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_lab': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'level': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            'lft': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '300'}),
            'parent': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'children'", 'null': 'True', 'to': "orm['service.BaseService']"}),
            'rght': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            'short_name': ('django.db.models.fields.CharField', [], {'max_length': '300', 'null': 'True', 'blank': 'True'}),
            'standard_service': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['service.StandardService']", 'null': 'True'}),
            'test_form_detail': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'tree_id': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            'version': ('django.db.models.fields.PositiveIntegerField', [], {'default': '0', 'null': 'True', 'blank': 'True'})
        },
        'service.executionplace': {
            'Meta': {'object_name': 'ExecutionPlace'},
            'base_service': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['service.BaseService']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_blocked': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_prefer': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'state': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['state.State']"})
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
        },
        'state.branch': {
            'Meta': {'object_name': 'Branch'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'state': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['state.State']", 'unique': 'True'})
        },
        'state.department': {
            'Meta': {'object_name': 'Department'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'services': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['service.BaseService']", 'symmetrical': 'False'}),
            'state': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['state.State']"})
        },
        'state.departmentstaff': {
            'Meta': {'object_name': 'DepartmentStaff'},
            'allowed_services': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['service.BaseService']", 'symmetrical': 'False'}),
            'department': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['state.Department']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'position': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        'state.position': {
            'Meta': {'object_name': 'Position'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'})
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
