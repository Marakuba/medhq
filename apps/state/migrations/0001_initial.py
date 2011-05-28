# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Adding model 'Staff'
        db.create_table('state_staff', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('operator', self.gf('django.db.models.fields.related.ForeignKey')(related_name='operator_in_staff', to=orm['auth.User'])),
            ('created', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('last_name', self.gf('django.db.models.fields.CharField')(max_length=50)),
            ('first_name', self.gf('django.db.models.fields.CharField')(max_length=50)),
            ('mid_name', self.gf('django.db.models.fields.CharField')(max_length=50, blank=True)),
            ('birth_day', self.gf('django.db.models.fields.DateField')()),
            ('gender', self.gf('django.db.models.fields.CharField')(max_length=1)),
            ('work_phone', self.gf('django.db.models.fields.CharField')(max_length=15, blank=True)),
            ('home_phone', self.gf('django.db.models.fields.CharField')(max_length=15, blank=True)),
            ('mobile_phone', self.gf('django.db.models.fields.CharField')(max_length=15, blank=True)),
            ('work_address_street', self.gf('django.db.models.fields.CharField')(max_length=100, blank=True)),
            ('home_address_street', self.gf('django.db.models.fields.CharField')(max_length=100, blank=True)),
            ('idcard_type', self.gf('django.db.models.fields.CharField')(max_length=1, blank=True)),
            ('idcard_number', self.gf('django.db.models.fields.CharField')(max_length=5, blank=True)),
            ('idcard_series', self.gf('django.db.models.fields.CharField')(max_length=10, blank=True)),
            ('idcard_issue_date', self.gf('django.db.models.fields.DateField')(null=True, blank=True)),
            ('idcard_organization', self.gf('django.db.models.fields.CharField')(max_length=100, blank=True)),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(blank=True, related_name='staff_user_field', null=True, to=orm['auth.User'])),
            ('high_school', self.gf('django.db.models.fields.CharField')(max_length=200, blank=True)),
            ('speciality', self.gf('django.db.models.fields.CharField')(max_length=100, blank=True)),
            ('high_school_end_date', self.gf('django.db.models.fields.PositiveIntegerField')(null=True, blank=True)),
            ('medical_experience', self.gf('django.db.models.fields.CharField')(max_length=2, blank=True)),
            ('spec_experience', self.gf('django.db.models.fields.CharField')(max_length=2, blank=True)),
        ))
        db.send_create_signal('state', ['Staff'])

        # Adding model 'Position'
        db.create_table('state_position', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=200)),
        ))
        db.send_create_signal('state', ['Position'])

        # Adding model 'State'
        db.create_table('state_state', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('official_title', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('address_street', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('website', self.gf('django.db.models.fields.URLField')(max_length=200, blank=True)),
            ('email', self.gf('django.db.models.fields.EmailField')(max_length=75, blank=True)),
            ('type', self.gf('django.db.models.fields.CharField')(max_length=1)),
        ))
        db.send_create_signal('state', ['State'])

        # Adding model 'Branch'
        db.create_table('state_branch', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('state', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['state.State'], unique=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=200)),
        ))
        db.send_create_signal('state', ['Branch'])

        # Adding model 'Department'
        db.create_table('state_department', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('state', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['state.State'])),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=200)),
        ))
        db.send_create_signal('state', ['Department'])

        # Adding M2M table for field services on 'Department'
        db.create_table('state_department_services', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('department', models.ForeignKey(orm['state.department'], null=False)),
            ('baseservice', models.ForeignKey(orm['service.baseservice'], null=False))
        ))
        db.create_unique('state_department_services', ['department_id', 'baseservice_id'])

        # Adding model 'DepartmentStaff'
        db.create_table('state_departmentstaff', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('department', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['state.Department'])),
            ('staff', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['state.Staff'])),
            ('position', self.gf('django.db.models.fields.CharField')(max_length=50)),
        ))
        db.send_create_signal('state', ['DepartmentStaff'])

        # Adding M2M table for field allowed_services on 'DepartmentStaff'
        db.create_table('state_departmentstaff_allowed_services', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('departmentstaff', models.ForeignKey(orm['state.departmentstaff'], null=False)),
            ('baseservice', models.ForeignKey(orm['service.baseservice'], null=False))
        ))
        db.create_unique('state_departmentstaff_allowed_services', ['departmentstaff_id', 'baseservice_id'])


    def backwards(self, orm):
        
        # Deleting model 'Staff'
        db.delete_table('state_staff')

        # Deleting model 'Position'
        db.delete_table('state_position')

        # Deleting model 'State'
        db.delete_table('state_state')

        # Deleting model 'Branch'
        db.delete_table('state_branch')

        # Deleting model 'Department'
        db.delete_table('state_department')

        # Removing M2M table for field services on 'Department'
        db.delete_table('state_department_services')

        # Deleting model 'DepartmentStaff'
        db.delete_table('state_departmentstaff')

        # Removing M2M table for field allowed_services on 'DepartmentStaff'
        db.delete_table('state_departmentstaff_allowed_services')


    models = {
        'auth.group': {
            'Meta': {'object_name': 'Group'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        'auth.permission': {
            'Meta': {'ordering': "('content_type__app_label', 'content_type__model', 'codename')", 'unique_together': "(('content_type', 'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['contenttypes.ContentType']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        'auth.user': {
            'Meta': {'object_name': 'User'},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Group']", 'symmetrical': 'False', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'})
        },
        'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
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
            'staff': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['state.Staff']", 'through': "orm['state.DepartmentStaff']", 'symmetrical': 'False'}),
            'state': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['state.State']"})
        },
        'state.departmentstaff': {
            'Meta': {'object_name': 'DepartmentStaff'},
            'allowed_services': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['service.BaseService']", 'symmetrical': 'False'}),
            'department': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['state.Department']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'position': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'staff': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['state.Staff']"})
        },
        'state.position': {
            'Meta': {'object_name': 'Position'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'})
        },
        'state.staff': {
            'Meta': {'object_name': 'Staff'},
            'birth_day': ('django.db.models.fields.DateField', [], {}),
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'gender': ('django.db.models.fields.CharField', [], {'max_length': '1'}),
            'high_school': ('django.db.models.fields.CharField', [], {'max_length': '200', 'blank': 'True'}),
            'high_school_end_date': ('django.db.models.fields.PositiveIntegerField', [], {'null': 'True', 'blank': 'True'}),
            'home_address_street': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'home_phone': ('django.db.models.fields.CharField', [], {'max_length': '15', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'idcard_issue_date': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            'idcard_number': ('django.db.models.fields.CharField', [], {'max_length': '5', 'blank': 'True'}),
            'idcard_organization': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'idcard_series': ('django.db.models.fields.CharField', [], {'max_length': '10', 'blank': 'True'}),
            'idcard_type': ('django.db.models.fields.CharField', [], {'max_length': '1', 'blank': 'True'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'medical_experience': ('django.db.models.fields.CharField', [], {'max_length': '2', 'blank': 'True'}),
            'mid_name': ('django.db.models.fields.CharField', [], {'max_length': '50', 'blank': 'True'}),
            'mobile_phone': ('django.db.models.fields.CharField', [], {'max_length': '15', 'blank': 'True'}),
            'operator': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'operator_in_staff'", 'to': "orm['auth.User']"}),
            'spec_experience': ('django.db.models.fields.CharField', [], {'max_length': '2', 'blank': 'True'}),
            'speciality': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'staff_user_field'", 'null': 'True', 'to': "orm['auth.User']"}),
            'work_address_street': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'work_phone': ('django.db.models.fields.CharField', [], {'max_length': '15', 'blank': 'True'})
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

    complete_apps = ['state']
