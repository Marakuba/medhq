# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Adding model 'BonusServiceGroup'
        db.create_table('bonus_bonusservicegroup', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=50)),
            ('slug', self.gf('django.db.models.fields.SlugField')(max_length=50, db_index=True)),
        ))
        db.send_create_signal('bonus', ['BonusServiceGroup'])

        # Adding M2M table for field services on 'BonusServiceGroup'
        db.create_table('bonus_bonusservicegroup_services', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('bonusservicegroup', models.ForeignKey(orm['bonus.bonusservicegroup'], null=False)),
            ('baseservice', models.ForeignKey(orm['service.baseservice'], null=False))
        ))
        db.create_unique('bonus_bonusservicegroup_services', ['bonusservicegroup_id', 'baseservice_id'])

        # Adding model 'BonusRule'
        db.create_table('bonus_bonusrule', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('object_type', self.gf('django.db.models.fields.CharField')(default=u'staff', max_length=10)),
            ('category', self.gf('django.db.models.fields.CharField')(max_length=30)),
            ('source', self.gf('django.db.models.fields.CharField')(max_length=50)),
            ('is_active', self.gf('django.db.models.fields.BooleanField')(default=True)),
        ))
        db.send_create_signal('bonus', ['BonusRule'])

        # Adding model 'BonusRuleItem'
        db.create_table('bonus_bonusruleitem', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('rule', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['bonus.BonusRule'])),
            ('service_group', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['bonus.BonusServiceGroup'], null=True, blank=True)),
            ('operation', self.gf('django.db.models.fields.CharField')(default='%', max_length=1)),
            ('on_date', self.gf('django.db.models.fields.DateField')()),
            ('value', self.gf('django.db.models.fields.DecimalField')(max_digits=8, decimal_places=2)),
            ('referral', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['visit.Referral'], null=True, blank=True)),
            ('with_discounts', self.gf('django.db.models.fields.BooleanField')(default=True)),
        ))
        db.send_create_signal('bonus', ['BonusRuleItem'])

        # Adding model 'BonusRuleItemHistory'
        db.create_table('bonus_bonusruleitemhistory', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('rule_item', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['bonus.BonusRuleItem'])),
            ('on_date', self.gf('django.db.models.fields.DateField')()),
            ('value', self.gf('django.db.models.fields.DecimalField')(max_digits=8, decimal_places=2)),
        ))
        db.send_create_signal('bonus', ['BonusRuleItemHistory'])

        # Adding model 'Calculation'
        db.create_table('bonus_calculation', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('start_date', self.gf('django.db.models.fields.DateField')()),
            ('end_date', self.gf('django.db.models.fields.DateField')()),
            ('category', self.gf('django.db.models.fields.CharField')(max_length=30)),
            ('comment', self.gf('django.db.models.fields.TextField')(blank=True)),
        ))
        db.send_create_signal('bonus', ['Calculation'])

        # Adding M2M table for field referral_list on 'Calculation'
        db.create_table('bonus_calculation_referral_list', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('calculation', models.ForeignKey(orm['bonus.calculation'], null=False)),
            ('referral', models.ForeignKey(orm['visit.referral'], null=False))
        ))
        db.create_unique('bonus_calculation_referral_list', ['calculation_id', 'referral_id'])

        # Adding model 'CalculationItem'
        db.create_table('bonus_calculationitem', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('calculation', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['bonus.Calculation'])),
            ('referral', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['visit.Referral'])),
            ('source', self.gf('django.db.models.fields.CharField')(max_length=50)),
            ('service_group', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['bonus.BonusServiceGroup'], null=True, blank=True)),
            ('ordered_service', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['visit.OrderedService'])),
            ('value', self.gf('django.db.models.fields.DecimalField')(max_digits=8, decimal_places=2)),
        ))
        db.send_create_signal('bonus', ['CalculationItem'])


    def backwards(self, orm):
        
        # Deleting model 'BonusServiceGroup'
        db.delete_table('bonus_bonusservicegroup')

        # Removing M2M table for field services on 'BonusServiceGroup'
        db.delete_table('bonus_bonusservicegroup_services')

        # Deleting model 'BonusRule'
        db.delete_table('bonus_bonusrule')

        # Deleting model 'BonusRuleItem'
        db.delete_table('bonus_bonusruleitem')

        # Deleting model 'BonusRuleItemHistory'
        db.delete_table('bonus_bonusruleitemhistory')

        # Deleting model 'Calculation'
        db.delete_table('bonus_calculation')

        # Removing M2M table for field referral_list on 'Calculation'
        db.delete_table('bonus_calculation_referral_list')

        # Deleting model 'CalculationItem'
        db.delete_table('bonus_calculationitem')


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
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime(2013, 2, 12, 12, 27, 55, 195476)'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Group']", 'symmetrical': 'False', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime(2013, 2, 12, 12, 27, 55, 195168)'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'})
        },
        'bonus.bonusrule': {
            'Meta': {'object_name': 'BonusRule'},
            'category': ('django.db.models.fields.CharField', [], {'max_length': '30'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'object_type': ('django.db.models.fields.CharField', [], {'default': "u'staff'", 'max_length': '10'}),
            'source': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        'bonus.bonusruleitem': {
            'Meta': {'object_name': 'BonusRuleItem'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'on_date': ('django.db.models.fields.DateField', [], {}),
            'operation': ('django.db.models.fields.CharField', [], {'default': "'%'", 'max_length': '1'}),
            'referral': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['visit.Referral']", 'null': 'True', 'blank': 'True'}),
            'rule': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['bonus.BonusRule']"}),
            'service_group': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['bonus.BonusServiceGroup']", 'null': 'True', 'blank': 'True'}),
            'value': ('django.db.models.fields.DecimalField', [], {'max_digits': '8', 'decimal_places': '2'}),
            'with_discounts': ('django.db.models.fields.BooleanField', [], {'default': 'True'})
        },
        'bonus.bonusruleitemhistory': {
            'Meta': {'object_name': 'BonusRuleItemHistory'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'on_date': ('django.db.models.fields.DateField', [], {}),
            'rule_item': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['bonus.BonusRuleItem']"}),
            'value': ('django.db.models.fields.DecimalField', [], {'max_digits': '8', 'decimal_places': '2'})
        },
        'bonus.bonusservicegroup': {
            'Meta': {'object_name': 'BonusServiceGroup'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'services': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['service.BaseService']", 'symmetrical': 'False'}),
            'slug': ('django.db.models.fields.SlugField', [], {'max_length': '50', 'db_index': 'True'})
        },
        'bonus.calculation': {
            'Meta': {'object_name': 'Calculation'},
            'category': ('django.db.models.fields.CharField', [], {'max_length': '30'}),
            'comment': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'end_date': ('django.db.models.fields.DateField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'referral_list': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['visit.Referral']", 'symmetrical': 'False'}),
            'start_date': ('django.db.models.fields.DateField', [], {})
        },
        'bonus.calculationitem': {
            'Meta': {'object_name': 'CalculationItem'},
            'calculation': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['bonus.Calculation']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'ordered_service': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['visit.OrderedService']"}),
            'referral': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['visit.Referral']"}),
            'service_group': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['bonus.BonusServiceGroup']", 'null': 'True', 'blank': 'True'}),
            'source': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'value': ('django.db.models.fields.DecimalField', [], {'max_digits': '8', 'decimal_places': '2'})
        },
        'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        'crm.adsource': {
            'Meta': {'ordering': "('name',)", 'object_name': 'AdSource'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'})
        },
        'examination.card': {
            'Meta': {'ordering': "('-created',)", 'object_name': 'Card'},
            'area': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'assistant': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['staff.Position']", 'null': 'True', 'blank': 'True'}),
            'contrast_enhancement': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'data': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'deleted': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'equipment': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['examination.Equipment']", 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'mkb_diag': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['service.ICD10']", 'null': 'True', 'blank': 'True'}),
            'modified': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'ordered_service': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['visit.OrderedService']", 'null': 'True', 'blank': 'True'}),
            'print_date': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'print_name': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'questionnaire': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'scan_mode': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'thickness': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'width': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'})
        },
        'examination.equipment': {
            'Meta': {'object_name': 'Equipment'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '300'})
        },
        'interlayer.clientitem': {
            'Meta': {'object_name': 'ClientItem'},
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        },
        'lab.analysisprofile': {
            'Meta': {'ordering': "('name',)", 'object_name': 'AnalysisProfile'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '150'})
        },
        'lab.sampling': {
            'Meta': {'object_name': 'Sampling'},
            'code': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'created': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime(2013, 2, 12, 12, 27, 54, 449563)'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_barcode': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'laboratory': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['state.State']"}),
            'number': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['numeration.NumeratorItem']", 'null': 'True', 'blank': 'True'}),
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
            'valid_till': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime(2013, 2, 12, 12, 27, 54, 414536)'})
        },
        'numeration.numeratoritem': {
            'Meta': {'ordering': "('-id',)", 'object_name': 'NumeratorItem'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'number': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'numerator': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['numeration.Numerator']"})
        },
        'patient.contract': {
            'Meta': {'object_name': 'Contract'},
            'active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'contract_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['patient.ContractType']", 'null': 'True', 'blank': 'True'}),
            'created': ('django.db.models.fields.DateField', [], {}),
            'expire': ('django.db.models.fields.DateField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'patient': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['patient.Patient']"}),
            'state': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['state.State']", 'null': 'True', 'blank': 'True'})
        },
        'patient.contracttype': {
            'Meta': {'object_name': 'ContractType'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'template': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'type': ('django.db.models.fields.CharField', [], {'default': "u'\\u0433'", 'max_length': '1'}),
            'validity': ('django.db.models.fields.IntegerField', [], {})
        },
        'patient.insurancepolicy': {
            'Meta': {'object_name': 'InsurancePolicy'},
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'end_date': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'insurance_state': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['state.State']"}),
            'number': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'operator': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'operator_in_insurance_policy'", 'to': "orm['auth.User']"}),
            'patient': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['patient.Patient']"}),
            'start_date': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'})
        },
        'patient.patient': {
            'Meta': {'ordering': "('last_name', 'first_name', 'mid_name')", 'object_name': 'Patient'},
            'ad_source': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['crm.AdSource']", 'null': 'True', 'blank': 'True'}),
            'assignment_notify': ('django.db.models.fields.PositiveIntegerField', [], {'default': '0'}),
            'balance': ('django.db.models.fields.FloatField', [], {'null': 'True', 'blank': 'True'}),
            'billed_account': ('django.db.models.fields.DecimalField', [], {'default': "'0.0'", 'max_digits': '10', 'decimal_places': '2'}),
            'birth_day': ('django.db.models.fields.DateField', [], {}),
            'client_item': ('django.db.models.fields.related.OneToOneField', [], {'blank': 'True', 'related_name': "'client'", 'unique': 'True', 'null': 'True', 'to': "orm['interlayer.ClientItem']"}),
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'discount': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['pricelist.Discount']", 'null': 'True', 'blank': 'True'}),
            'doc': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'gender': ('django.db.models.fields.CharField', [], {'max_length': '1'}),
            'guardian': ('django.db.models.fields.CharField', [], {'max_length': '200', 'blank': 'True'}),
            'hid_card': ('django.db.models.fields.CharField', [], {'max_length': '50', 'blank': 'True'}),
            'home_address_street': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'home_phone': ('django.db.models.fields.CharField', [], {'max_length': '15', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'id_card_issue_date': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            'id_card_number': ('django.db.models.fields.CharField', [], {'max_length': '10', 'null': 'True', 'blank': 'True'}),
            'id_card_org': ('django.db.models.fields.CharField', [], {'max_length': '500', 'null': 'True', 'blank': 'True'}),
            'id_card_series': ('django.db.models.fields.CharField', [], {'max_length': '6', 'null': 'True', 'blank': 'True'}),
            'id_card_type': ('django.db.models.fields.CharField', [], {'max_length': '1', 'null': 'True', 'blank': 'True'}),
            'initial_account': ('django.db.models.fields.DecimalField', [], {'default': "'0.0'", 'max_digits': '10', 'decimal_places': '2'}),
            'lab_notify': ('django.db.models.fields.PositiveIntegerField', [], {'default': '0'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'mid_name': ('django.db.models.fields.CharField', [], {'max_length': '50', 'blank': 'True'}),
            'mobile_phone': ('django.db.models.fields.CharField', [], {'max_length': '15', 'blank': 'True'}),
            'modified': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'operator': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'operator_in_patient'", 'to': "orm['auth.User']"}),
            'preorder_notify': ('django.db.models.fields.PositiveIntegerField', [], {'default': '0'}),
            'state': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['state.State']", 'null': 'True', 'blank': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'django_user'", 'null': 'True', 'to': "orm['auth.User']"}),
            'work_address_street': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'work_phone': ('django.db.models.fields.CharField', [], {'max_length': '15', 'blank': 'True'})
        },
        'pricelist.discount': {
            'Meta': {'ordering': "('name',)", 'object_name': 'Discount'},
            'comment': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'max': ('django.db.models.fields.DecimalField', [], {'default': '0.0', 'max_digits': '10', 'decimal_places': '2'}),
            'min': ('django.db.models.fields.DecimalField', [], {'default': '0.0', 'max_digits': '10', 'decimal_places': '2'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '30'}),
            'type': ('django.db.models.fields.CharField', [], {'default': "u'gen'", 'max_length': '5'}),
            'value': ('django.db.models.fields.DecimalField', [], {'max_digits': '5', 'decimal_places': '2'})
        },
        'pricelist.pricetype': {
            'Meta': {'ordering': "('priority', 'active')", 'object_name': 'PriceType'},
            'active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'hour': ('django.db.models.fields.CharField', [], {'default': "u''", 'max_length': '150', 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'month': ('django.db.models.fields.CharField', [], {'default': "u''", 'max_length': '150', 'null': 'True', 'blank': 'True'}),
            'month_day': ('django.db.models.fields.CharField', [], {'default': "u''", 'max_length': '150', 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'priority': ('django.db.models.fields.PositiveIntegerField', [], {'default': '0'}),
            'slug': ('django.db.models.fields.SlugField', [], {'default': "u''", 'max_length': '50', 'null': 'True', 'db_index': 'True', 'blank': 'True'}),
            'week_day': ('django.db.models.fields.CharField', [], {'default': "u''", 'max_length': '150', 'null': 'True', 'blank': 'True'})
        },
        'promotion.promotion': {
            'Meta': {'ordering': "('start_date',)", 'object_name': 'Promotion'},
            'comment': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'discount': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['pricelist.Discount']", 'null': 'True', 'blank': 'True'}),
            'end_date': ('django.db.models.fields.DateField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'start_date': ('django.db.models.fields.DateField', [], {}),
            'state': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['state.State']", 'null': 'True', 'blank': 'True'}),
            'total_price': ('django.db.models.fields.DecimalField', [], {'default': "'0.0'", 'max_digits': '10', 'decimal_places': '2'})
        },
        'remoting.syncobject': {
            'Meta': {'ordering': "('-created',)", 'object_name': 'SyncObject'},
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['contenttypes.ContentType']"}),
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'object_id': ('django.db.models.fields.IntegerField', [], {}),
            'state': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['state.State']"}),
            'sync_id': ('django.db.models.fields.IntegerField', [], {})
        },
        'remoting.transaction': {
            'Meta': {'object_name': 'Transaction'},
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'reciever': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'reciever_state'", 'to': "orm['state.State']"}),
            'sender': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'sender_state'", 'to': "orm['state.State']"}),
            'type': ('django.db.models.fields.CharField', [], {'max_length': '20'})
        },
        'remoting.transactionitem': {
            'Meta': {'object_name': 'TransactionItem'},
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['contenttypes.ContentType']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'message': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'object_id': ('django.db.models.fields.IntegerField', [], {}),
            'status': ('django.db.models.fields.CharField', [], {'max_length': '20'}),
            'transaction': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['remoting.Transaction']"})
        },
        'scheduler.event': {
            'Meta': {'ordering': "('-id',)", 'object_name': 'Event'},
            'ad': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'cid': ('django.db.models.fields.PositiveIntegerField', [], {'null': 'True', 'blank': 'True'}),
            'end': ('scheduler.models.CustomDateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'loc': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'n': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'notes': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'parent': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'children'", 'null': 'True', 'to': "orm['scheduler.Event']"}),
            'rem': ('django.db.models.fields.CharField', [], {'max_length': '60', 'null': 'True', 'blank': 'True'}),
            'staff': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['staff.Position']", 'null': 'True', 'blank': 'True'}),
            'start': ('scheduler.models.CustomDateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'status': ('django.db.models.fields.CharField', [], {'default': "u'\\u0441'", 'max_length': '1'}),
            'timeslot': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '300', 'null': 'True', 'blank': 'True'}),
            'url': ('django.db.models.fields.CharField', [], {'max_length': '300', 'null': 'True', 'blank': 'True'}),
            'vacant': ('django.db.models.fields.BooleanField', [], {'default': 'True'})
        },
        'scheduler.preorder': {
            'Meta': {'ordering': "('-id',)", 'object_name': 'Preorder'},
            'card': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['examination.Card']", 'null': 'True', 'blank': 'True'}),
            'comment': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'completed_count': ('django.db.models.fields.PositiveIntegerField', [], {'default': '0'}),
            'confirmed': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'count': ('django.db.models.fields.PositiveIntegerField', [], {'default': '1'}),
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'deleted': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'deleted_time': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'expiration': ('scheduler.models.CustomDateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'modified': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'operator': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'operator_in_preorder'", 'null': 'True', 'to': "orm['auth.User']"}),
            'patient': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['patient.Patient']", 'null': 'True', 'blank': 'True'}),
            'payment_type': ('django.db.models.fields.CharField', [], {'default': "u'\\u043d'", 'max_length': '1'}),
            'price': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '10', 'decimal_places': '2'}),
            'promotion': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['promotion.Promotion']", 'null': 'True', 'blank': 'True'}),
            'referral': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['visit.Referral']", 'null': 'True', 'blank': 'True'}),
            'rejection_cause': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['scheduler.RejectionCause']", 'null': 'True', 'blank': 'True'}),
            'service': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['service.ExtendedService']", 'null': 'True', 'blank': 'True'}),
            'timeslot': ('django.db.models.fields.related.OneToOneField', [], {'blank': 'True', 'related_name': "'preord'", 'unique': 'True', 'null': 'True', 'to': "orm['scheduler.Event']"}),
            'visit': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['visit.Visit']", 'null': 'True', 'blank': 'True'}),
            'who_deleted': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'operator_deleted_preorder'", 'null': 'True', 'to': "orm['auth.User']"})
        },
        'scheduler.rejectioncause': {
            'Meta': {'ordering': "('name',)", 'object_name': 'RejectionCause'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '150'})
        },
        'service.baseservice': {
            'Meta': {'ordering': "('name',)", 'object_name': 'BaseService'},
            'base_group': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['service.BaseServiceGroup']", 'null': 'True', 'blank': 'True'}),
            'code': ('django.db.models.fields.CharField', [], {'max_length': '25', 'null': 'True', 'blank': 'True'}),
            'conditions': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['service.Condition']", 'null': 'True', 'blank': 'True'}),
            'description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'execution_time': ('django.db.models.fields.PositiveIntegerField', [], {'null': 'True', 'blank': 'True'}),
            'execution_type_group': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['service.ExecutionTypeGroup']", 'null': 'True', 'blank': 'True'}),
            'gen_ref_interval': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'inner_template': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
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
        'service.extendedservice': {
            'Meta': {'unique_together': "(('base_service', 'state'),)", 'object_name': 'ExtendedService'},
            'base_profile': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['lab.AnalysisProfile']", 'null': 'True', 'blank': 'True'}),
            'base_service': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['service.BaseService']"}),
            'branches': ('django.db.models.fields.related.ManyToManyField', [], {'related_name': "'branches'", 'symmetrical': 'False', 'to': "orm['state.State']"}),
            'code': ('django.db.models.fields.CharField', [], {'max_length': '20', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_manual': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'staff': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['staff.Position']", 'null': 'True', 'blank': 'True'}),
            'state': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['state.State']"}),
            'tube': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'tube'", 'null': 'True', 'to': "orm['lab.Tube']"}),
            'tube_count': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'})
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
            'template': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'})
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
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
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
            'guardian': ('django.db.models.fields.CharField', [], {'max_length': '200', 'blank': 'True'}),
            'high_school': ('django.db.models.fields.CharField', [], {'max_length': '200', 'blank': 'True'}),
            'high_school_end_date': ('django.db.models.fields.PositiveIntegerField', [], {'null': 'True', 'blank': 'True'}),
            'home_address_street': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'home_phone': ('django.db.models.fields.CharField', [], {'max_length': '15', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'id_card_issue_date': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            'id_card_number': ('django.db.models.fields.CharField', [], {'max_length': '10', 'null': 'True', 'blank': 'True'}),
            'id_card_org': ('django.db.models.fields.CharField', [], {'max_length': '500', 'null': 'True', 'blank': 'True'}),
            'id_card_series': ('django.db.models.fields.CharField', [], {'max_length': '6', 'null': 'True', 'blank': 'True'}),
            'id_card_type': ('django.db.models.fields.CharField', [], {'max_length': '1', 'null': 'True', 'blank': 'True'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'medical_experience': ('django.db.models.fields.CharField', [], {'max_length': '2', 'blank': 'True'}),
            'mid_name': ('django.db.models.fields.CharField', [], {'max_length': '50', 'blank': 'True'}),
            'mobile_phone': ('django.db.models.fields.CharField', [], {'max_length': '15', 'blank': 'True'}),
            'operator': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'operator_in_staff'", 'to': "orm['auth.User']"}),
            'referral': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['visit.Referral']", 'unique': 'True', 'null': 'True', 'blank': 'True'}),
            'spec_experience': ('django.db.models.fields.CharField', [], {'max_length': '2', 'blank': 'True'}),
            'speciality': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'status': ('django.db.models.fields.CharField', [], {'default': "'\\xd0\\xb4'", 'max_length': '1'}),
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
            'address_street': ('django.db.models.fields.CharField', [], {'max_length': '200', 'blank': 'True'}),
            'bank_details': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'fax': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'head': ('django.db.models.fields.CharField', [], {'max_length': '150', 'null': 'True', 'blank': 'True'}),
            'head_title': ('django.db.models.fields.CharField', [], {'max_length': '300', 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'inn': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '12', 'decimal_places': '0', 'blank': 'True'}),
            'kpp': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '9', 'decimal_places': '0', 'blank': 'True'}),
            'licenses': ('django.db.models.fields.CharField', [], {'max_length': '150', 'null': 'True', 'blank': 'True'}),
            'logo': ('django.db.models.fields.files.ImageField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'official_title': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'ogrn': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '15', 'decimal_places': '0', 'blank': 'True'}),
            'phones': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'post_address': ('django.db.models.fields.CharField', [], {'max_length': '200', 'blank': 'True'}),
            'price_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['pricelist.PriceType']", 'null': 'True', 'blank': 'True'}),
            'print_name': ('django.db.models.fields.CharField', [], {'default': "u''", 'max_length': '200'}),
            'type': ('django.db.models.fields.CharField', [], {'max_length': '1'}),
            'uuid': ('django.db.models.fields.CharField', [], {'max_length': '36', 'blank': 'True'}),
            'website': ('django.db.models.fields.URLField', [], {'max_length': '200', 'blank': 'True'})
        },
        'visit.orderedservice': {
            'Meta': {'ordering': "('-order__created',)", 'object_name': 'OrderedService'},
            'assigment': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['scheduler.Preorder']", 'null': 'True', 'blank': 'True'}),
            'count': ('django.db.models.fields.IntegerField', [], {'default': '1'}),
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'executed': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'execution_place': ('django.db.models.fields.related.ForeignKey', [], {'default': '2', 'to': "orm['state.State']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'modified': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'operator': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'operator_in_ordered_service'", 'to': "orm['auth.User']"}),
            'order': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['visit.Visit']"}),
            'price': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '10', 'decimal_places': '2'}),
            'print_date': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'sampling': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['lab.Sampling']", 'null': 'True', 'blank': 'True'}),
            'service': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['service.BaseService']"}),
            'staff': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['staff.Position']", 'null': 'True', 'blank': 'True'}),
            'status': ('django.db.models.fields.CharField', [], {'default': "u'\\u0442'", 'max_length': '1'}),
            'test_form': ('django.db.models.fields.CharField', [], {'max_length': '1', 'null': 'True', 'blank': 'True'}),
            'total_price': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '10', 'decimal_places': '2'})
        },
        'visit.referral': {
            'Meta': {'ordering': "('name',)", 'object_name': 'Referral'},
            'agent': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['visit.ReferralAgent']", 'null': 'True', 'blank': 'True'}),
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'operator': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'operator_in_referral'", 'to': "orm['auth.User']"}),
            'referral_type': ('django.db.models.fields.CharField', [], {'default': "u'\\u0432'", 'max_length': '1'})
        },
        'visit.referralagent': {
            'Meta': {'ordering': "('name',)", 'object_name': 'ReferralAgent'},
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'operator': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'operator_in_referralagent'", 'to': "orm['auth.User']"})
        },
        'visit.visit': {
            'Meta': {'ordering': "('-created',)", 'object_name': 'Visit'},
            'barcode': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['numeration.Barcode']", 'null': 'True', 'blank': 'True'}),
            'bill_date': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'cls': ('django.db.models.fields.CharField', [], {'default': "u'\\u043f'", 'max_length': '1'}),
            'comment': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'contract': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['patient.Contract']", 'null': 'True', 'blank': 'True'}),
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'diagnosis': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'discount': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['pricelist.Discount']", 'null': 'True', 'blank': 'True'}),
            'discount_value': ('django.db.models.fields.DecimalField', [], {'default': '0', 'null': 'True', 'max_digits': '10', 'decimal_places': '2', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'insurance_policy': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['patient.InsurancePolicy']", 'null': 'True', 'blank': 'True'}),
            'is_billed': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_cito': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'menopause': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'menses_day': ('django.db.models.fields.PositiveIntegerField', [], {'null': 'True', 'blank': 'True'}),
            'modified': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'office': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['state.State']"}),
            'on_date': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'operator': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'operator_in_visit'", 'to': "orm['auth.User']"}),
            'patient': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['patient.Patient']"}),
            'payer': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'payer_in_visit'", 'null': 'True', 'to': "orm['state.State']"}),
            'payment_status': ('django.db.models.fields.CharField', [], {'max_length': '1', 'null': 'True', 'blank': 'True'}),
            'payment_type': ('django.db.models.fields.CharField', [], {'default': "u'\\u043d'", 'max_length': '1'}),
            'pregnancy_week': ('django.db.models.fields.PositiveIntegerField', [], {'null': 'True', 'blank': 'True'}),
            'referral': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['visit.Referral']", 'null': 'True', 'blank': 'True'}),
            'sampled': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'send_to_email': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'source_lab': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'source_lab_in_visit'", 'null': 'True', 'to': "orm['state.State']"}),
            'specimen': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'status': ('django.db.models.fields.CharField', [], {'default': "u'\\u0442'", 'max_length': '1', 'blank': 'True'}),
            'total_discount': ('django.db.models.fields.DecimalField', [], {'default': '0', 'null': 'True', 'max_digits': '10', 'decimal_places': '2', 'blank': 'True'}),
            'total_paid': ('django.db.models.fields.DecimalField', [], {'default': '0', 'null': 'True', 'max_digits': '10', 'decimal_places': '2', 'blank': 'True'}),
            'total_price': ('django.db.models.fields.DecimalField', [], {'default': '0', 'null': 'True', 'max_digits': '10', 'decimal_places': '2', 'blank': 'True'})
        }
    }

    complete_apps = ['bonus']
