# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Adding model 'Patient'
        db.create_table('patient_patient', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('operator', self.gf('django.db.models.fields.related.ForeignKey')(related_name='operator_in_patient', to=orm['auth.User'])),
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
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(blank=True, related_name='django_user', null=True, to=orm['auth.User'])),
            ('hid_card', self.gf('django.db.models.fields.CharField')(max_length=50, blank=True)),
        ))
        db.send_create_signal('patient', ['Patient'])

        # Adding model 'CardType'
        db.create_table('patient_cardtype', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=100)),
        ))
        db.send_create_signal('patient', ['CardType'])

        # Adding model 'PatientCard'
        db.create_table('patient_patientcard', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('operator', self.gf('django.db.models.fields.related.ForeignKey')(related_name='operator_in_patient_card', to=orm['auth.User'])),
            ('created', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('patient', self.gf('django.db.models.fields.related.ForeignKey')(related_name='patient_field', to=orm['patient.Patient'])),
            ('card_type', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['patient.CardType'])),
        ))
        db.send_create_signal('patient', ['PatientCard'])


    def backwards(self, orm):
        
        # Deleting model 'Patient'
        db.delete_table('patient_patient')

        # Deleting model 'CardType'
        db.delete_table('patient_cardtype')

        # Deleting model 'PatientCard'
        db.delete_table('patient_patientcard')


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
        'patient.cardtype': {
            'Meta': {'object_name': 'CardType'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        'patient.patient': {
            'Meta': {'object_name': 'Patient'},
            'birth_day': ('django.db.models.fields.DateField', [], {}),
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'gender': ('django.db.models.fields.CharField', [], {'max_length': '1'}),
            'hid_card': ('django.db.models.fields.CharField', [], {'max_length': '50', 'blank': 'True'}),
            'home_address_street': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'home_phone': ('django.db.models.fields.CharField', [], {'max_length': '15', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'idcard_issue_date': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            'idcard_number': ('django.db.models.fields.CharField', [], {'max_length': '5', 'blank': 'True'}),
            'idcard_organization': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'idcard_series': ('django.db.models.fields.CharField', [], {'max_length': '10', 'blank': 'True'}),
            'idcard_type': ('django.db.models.fields.CharField', [], {'max_length': '1', 'blank': 'True'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'mid_name': ('django.db.models.fields.CharField', [], {'max_length': '50', 'blank': 'True'}),
            'mobile_phone': ('django.db.models.fields.CharField', [], {'max_length': '15', 'blank': 'True'}),
            'operator': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'operator_in_patient'", 'to': "orm['auth.User']"}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'django_user'", 'null': 'True', 'to': "orm['auth.User']"}),
            'work_address_street': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'work_phone': ('django.db.models.fields.CharField', [], {'max_length': '15', 'blank': 'True'})
        },
        'patient.patientcard': {
            'Meta': {'object_name': 'PatientCard'},
            'card_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['patient.CardType']"}),
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'operator': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'operator_in_patient_card'", 'to': "orm['auth.User']"}),
            'patient': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'patient_field'", 'to': "orm['patient.Patient']"})
        }
    }

    complete_apps = ['patient']
