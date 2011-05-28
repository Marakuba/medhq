# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Changing field 'LabOrder.created'
        db.alter_column('lab_laborder', 'created', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True))


    def backwards(self, orm):
        
        # Changing field 'LabOrder.created'
        db.alter_column('lab_laborder', 'created', self.gf('django.db.models.fields.DateTimeField')())


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
        'lab.analysis': {
            'Meta': {'object_name': 'Analysis'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'input_list': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['lab.InputList']", 'null': 'True', 'blank': 'True'}),
            'input_mask': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['lab.InputMask']", 'null': 'True', 'blank': 'True'}),
            'measurement': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['lab.Measurement']", 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '300'}),
            'order': ('django.db.models.fields.PositiveIntegerField', [], {'default': '0', 'null': 'True', 'blank': 'True'}),
            'ref_range_text': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'service': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['service.BaseService']", 'null': 'True', 'blank': 'True'}),
            'tube': ('django.db.models.fields.related.ManyToManyField', [], {'blank': 'True', 'related_name': "'m2m_tube'", 'null': 'True', 'symmetrical': 'False', 'to': "orm['lab.Tube']"})
        },
        'lab.factor': {
            'Meta': {'object_name': 'Factor'},
            'field': ('django.db.models.fields.CharField', [], {'max_length': '20', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'operator': ('django.db.models.fields.CharField', [], {'max_length': '2', 'blank': 'True'}),
            'ref_range': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['lab.ReferenceRange']"}),
            'value': ('django.db.models.fields.CharField', [], {'max_length': '50', 'blank': 'True'})
        },
        'lab.inputlist': {
            'Meta': {'object_name': 'InputList'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        'lab.inputmask': {
            'Meta': {'object_name': 'InputMask'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'value': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        'lab.laborder': {
            'Meta': {'ordering': "('-created',)", 'object_name': 'LabOrder'},
            'comment': ('django.db.models.fields.TextField', [], {'default': "''", 'blank': 'True'}),
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_completed': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_printed': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'lab_group': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['service.LabServiceGroup']", 'null': 'True', 'blank': 'True'}),
            'laboratory': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'laboratory'", 'to': "orm['state.State']"}),
            'office': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'office'", 'to': "orm['state.State']"}),
            'print_date': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'printed_by': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']", 'null': 'True', 'blank': 'True'}),
            'staff': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['staff.Staff']", 'null': 'True', 'blank': 'True'}),
            'status': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['workflow.Status']", 'null': 'True', 'blank': 'True'}),
            'visit': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['visit.Visit']", 'null': 'True', 'blank': 'True'})
        },
        'lab.measurement': {
            'Meta': {'ordering': "('name',)", 'object_name': 'Measurement'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        'lab.referencerange': {
            'Meta': {'object_name': 'ReferenceRange'},
            'analysis': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['lab.Analysis']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'operator1': ('django.db.models.fields.CharField', [], {'max_length': '2'}),
            'operator2': ('django.db.models.fields.CharField', [], {'max_length': '2', 'blank': 'True'}),
            'value1': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'value2': ('django.db.models.fields.CharField', [], {'max_length': '50', 'blank': 'True'})
        },
        'lab.result': {
            'Meta': {'ordering': "('analysis__service__tree_id', '-analysis__service__lft', 'analysis__order')", 'object_name': 'Result'},
            'analysis': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['lab.Analysis']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'input_list': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['lab.InputList']", 'null': 'True', 'blank': 'True'}),
            'is_validated': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'order': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['lab.LabOrder']"}),
            'presence': ('django.db.models.fields.CharField', [], {'max_length': '1', 'null': 'True', 'blank': 'True'}),
            'sample': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['lab.Sampling']", 'null': 'True', 'blank': 'True'}),
            'status': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['workflow.Status']", 'null': 'True', 'blank': 'True'}),
            'test_form': ('django.db.models.fields.CharField', [], {'max_length': '6', 'null': 'True', 'blank': 'True'}),
            'to_print': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'value': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'})
        },
        'lab.sampling': {
            'Meta': {'object_name': 'Sampling'},
            'code': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'created': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime(2011, 3, 30, 9, 6, 55, 590772)'}),
            'execution_type_group': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['service.ExecutionTypeGroup']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'laboratory': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['state.State']"}),
            'number': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['numeration.NumeratorItem']", 'null': 'True', 'blank': 'True'}),
            'status': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['workflow.Status']", 'null': 'True', 'blank': 'True'}),
            'tube': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['lab.Tube']"}),
            'tube_count': ('django.db.models.fields.IntegerField', [], {'default': '1'}),
            'visit': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['visit.Visit']", 'null': 'True', 'blank': 'True'})
        },
        'lab.tube': {
            'Meta': {'ordering': "('name',)", 'object_name': 'Tube'},
            'bc_count': ('django.db.models.fields.IntegerField', [], {'default': '1'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        'numeration.barcode': {
            'Meta': {'ordering': "('-id',)", 'object_name': 'Barcode'},
            'duplicates': ('django.db.models.fields.IntegerField', [], {'default': '1'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'package': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['numeration.BarcodePackage']", 'null': 'True', 'blank': 'True'}),
            'status': ('django.db.models.fields.IntegerField', [], {'default': '1'})
        },
        'numeration.barcodepackage': {
            'Meta': {'ordering': "('-created',)", 'object_name': 'BarcodePackage'},
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'laboratory': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['state.State']"}),
            'operator': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'operator_in_barcodepackage'", 'to': "orm['auth.User']"}),
            'print_date': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'x2': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'x3': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'x4': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'x5': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'x6': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'x7': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'x8': ('django.db.models.fields.IntegerField', [], {'default': '0'})
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
            'valid_till': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime(2011, 3, 30, 9, 6, 53, 805591)'})
        },
        'numeration.numeratoritem': {
            'Meta': {'ordering': "('-id',)", 'object_name': 'NumeratorItem'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'number': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'numerator': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['numeration.Numerator']"})
        },
        'patient.patient': {
            'Meta': {'ordering': "('last_name',)", 'object_name': 'Patient'},
            'billed_account': ('django.db.models.fields.PositiveIntegerField', [], {'default': '0'}),
            'birth_day': ('django.db.models.fields.DateField', [], {}),
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'discount': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['pricelist.Discount']", 'null': 'True', 'blank': 'True'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'gender': ('django.db.models.fields.CharField', [], {'max_length': '1'}),
            'hid_card': ('django.db.models.fields.CharField', [], {'max_length': '50', 'blank': 'True'}),
            'home_address_street': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'home_phone': ('django.db.models.fields.CharField', [], {'max_length': '15', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'initial_account': ('django.db.models.fields.PositiveIntegerField', [], {'default': '0'}),
            'insurance_doc': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'insurance_state': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['state.State']", 'null': 'True', 'blank': 'True'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'mid_name': ('django.db.models.fields.CharField', [], {'max_length': '50', 'blank': 'True'}),
            'mobile_phone': ('django.db.models.fields.CharField', [], {'max_length': '15', 'blank': 'True'}),
            'operator': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'operator_in_patient'", 'to': "orm['auth.User']"}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'django_user'", 'null': 'True', 'to': "orm['auth.User']"}),
            'work_address_street': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'work_phone': ('django.db.models.fields.CharField', [], {'max_length': '15', 'blank': 'True'})
        },
        'pricelist.discount': {
            'Meta': {'ordering': "('id',)", 'object_name': 'Discount'},
            'accumulation': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'comment': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '30'}),
            'value': ('django.db.models.fields.DecimalField', [], {'max_digits': '5', 'decimal_places': '2'})
        },
        'service.baseservice': {
            'Meta': {'ordering': "('name',)", 'object_name': 'BaseService'},
            'base_group': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['service.BaseServiceGroup']", 'null': 'True', 'blank': 'True'}),
            'code': ('django.db.models.fields.CharField', [], {'max_length': '25', 'null': 'True', 'blank': 'True'}),
            'conditions': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['service.Condition']", 'null': 'True', 'blank': 'True'}),
            'execution_form': ('django.db.models.fields.CharField', [], {'default': "u'\\u043f'", 'max_length': '1'}),
            'execution_place': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['state.State']", 'null': 'True', 'through': "orm['service.ExecutionPlace']", 'blank': 'True'}),
            'execution_time': ('django.db.models.fields.PositiveIntegerField', [], {'null': 'True', 'blank': 'True'}),
            'execution_type_group': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['service.ExecutionTypeGroup']", 'null': 'True', 'blank': 'True'}),
            'gen_ref_interval': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'individual_tube': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'inner_template': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'lab_group': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['service.LabServiceGroup']", 'null': 'True', 'blank': 'True'}),
            'level': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            'lft': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            'manual': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'material': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['service.Material']", 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '300'}),
            'normal_tubes': ('django.db.models.fields.related.ManyToManyField', [], {'blank': 'True', 'related_name': "'normal_tubes'", 'null': 'True', 'symmetrical': 'False', 'to': "orm['lab.Tube']"}),
            'parent': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'children'", 'null': 'True', 'to': "orm['service.BaseService']"}),
            'partnership': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'rght': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            'short_name': ('django.db.models.fields.CharField', [], {'max_length': '300', 'null': 'True', 'blank': 'True'}),
            'staff': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['staff.Position']", 'null': 'True', 'blank': 'True'}),
            'standard_service': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['service.StandardService']", 'null': 'True'}),
            'transport_tubes': ('django.db.models.fields.related.ManyToManyField', [], {'blank': 'True', 'related_name': "'transport_tubes'", 'null': 'True', 'symmetrical': 'False', 'to': "orm['lab.Tube']"}),
            'tree_id': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
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
        'service.executionplace': {
            'Meta': {'object_name': 'ExecutionPlace'},
            'base_service': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['service.BaseService']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_blocked': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_prefer': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'state': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['state.State']"})
        },
        'service.executiontypegroup': {
            'Meta': {'object_name': 'ExecutionTypeGroup'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
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
        },
        'staff.position': {
            'Meta': {'ordering': "('staff__last_name', 'staff__first_name')", 'object_name': 'Position'},
            'department': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['state.Department']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'staff': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['staff.Staff']"}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        'staff.staff': {
            'Meta': {'ordering': "('last_name', 'first_name')", 'object_name': 'Staff'},
            'birth_day': ('django.db.models.fields.DateField', [], {}),
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'gender': ('django.db.models.fields.CharField', [], {'max_length': '1'}),
            'high_school': ('django.db.models.fields.CharField', [], {'max_length': '200', 'blank': 'True'}),
            'high_school_end_date': ('django.db.models.fields.PositiveIntegerField', [], {'null': 'True', 'blank': 'True'}),
            'home_address_street': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'home_phone': ('django.db.models.fields.CharField', [], {'max_length': '15', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'medical_experience': ('django.db.models.fields.CharField', [], {'max_length': '2', 'blank': 'True'}),
            'mid_name': ('django.db.models.fields.CharField', [], {'max_length': '50', 'blank': 'True'}),
            'mobile_phone': ('django.db.models.fields.CharField', [], {'max_length': '15', 'blank': 'True'}),
            'operator': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'operator_in_staff'", 'to': "orm['auth.User']"}),
            'spec_experience': ('django.db.models.fields.CharField', [], {'max_length': '2', 'blank': 'True'}),
            'speciality': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'user': ('django.db.models.fields.related.OneToOneField', [], {'blank': 'True', 'related_name': "'staff_user'", 'unique': 'True', 'null': 'True', 'to': "orm['auth.User']"}),
            'work_address_street': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'work_phone': ('django.db.models.fields.CharField', [], {'max_length': '15', 'blank': 'True'})
        },
        'state.department': {
            'Meta': {'object_name': 'Department'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'state': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['state.State']"})
        },
        'state.state': {
            'Meta': {'ordering': "('name',)", 'object_name': 'State'},
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
        },
        'visit.referral': {
            'Meta': {'ordering': "('name',)", 'object_name': 'Referral'},
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'ins_state': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'operator': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'operator_in_referral'", 'to': "orm['auth.User']"})
        },
        'visit.visit': {
            'Meta': {'ordering': "('-created',)", 'object_name': 'Visit'},
            'accept_rules': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'barcode': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['numeration.Barcode']", 'null': 'True', 'blank': 'True'}),
            'bill_date': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'cls': ('django.db.models.fields.CharField', [], {'default': "u'\\u043f'", 'max_length': '1'}),
            'comment': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'diagnosis': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'discount': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['pricelist.Discount']", 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_billed': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'menopause': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'menses_day': ('django.db.models.fields.PositiveIntegerField', [], {'null': 'True', 'blank': 'True'}),
            'office': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['state.State']"}),
            'on_date': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime(2011, 3, 30, 9, 6, 54, 104743)', 'null': 'True', 'blank': 'True'}),
            'operator': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'operator_in_visit'", 'to': "orm['auth.User']"}),
            'patient': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['patient.Patient']"}),
            'payer': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'payer_in_visit'", 'null': 'True', 'to': "orm['state.State']"}),
            'payment_status': ('django.db.models.fields.CharField', [], {'max_length': '1', 'null': 'True', 'blank': 'True'}),
            'payment_type': ('django.db.models.fields.CharField', [], {'default': "u'\\u043d'", 'max_length': '1'}),
            'pregnancy_week': ('django.db.models.fields.PositiveIntegerField', [], {'null': 'True', 'blank': 'True'}),
            'referral': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['visit.Referral']", 'null': 'True', 'blank': 'True'}),
            'sampled': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'services': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['service.BaseService']", 'null': 'True', 'blank': 'True'}),
            'source_lab': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'source_lab_in_visit'", 'null': 'True', 'to': "orm['state.State']"}),
            'staff': ('core.fields.SeparatedValuesField', [], {'null': 'True', 'blank': 'True'}),
            'status': ('django.db.models.fields.CharField', [], {'max_length': '1', 'null': 'True', 'blank': 'True'}),
            'total_discount': ('django.db.models.fields.DecimalField', [], {'default': '0', 'null': 'True', 'max_digits': '10', 'decimal_places': '2', 'blank': 'True'}),
            'total_paid': ('django.db.models.fields.DecimalField', [], {'default': '0', 'null': 'True', 'max_digits': '10', 'decimal_places': '2', 'blank': 'True'}),
            'total_price': ('django.db.models.fields.DecimalField', [], {'default': '0', 'null': 'True', 'max_digits': '10', 'decimal_places': '2', 'blank': 'True'})
        },
        'workflow.status': {
            'Meta': {'object_name': 'Status'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'type': ('django.db.models.fields.CharField', [], {'max_length': '10'})
        }
    }

    complete_apps = ['lab']
