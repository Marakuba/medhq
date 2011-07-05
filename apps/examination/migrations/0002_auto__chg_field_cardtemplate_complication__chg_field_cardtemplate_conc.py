# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Changing field 'CardTemplate.complication'
        db.alter_column('examination_cardtemplate', 'complication', self.gf('django.db.models.fields.CharField')(max_length=400, null=True))

        # Changing field 'CardTemplate.concomitant_diag'
        db.alter_column('examination_cardtemplate', 'concomitant_diag', self.gf('django.db.models.fields.CharField')(max_length=400, null=True))

        # Changing field 'CardTemplate.gen_diag'
        db.alter_column('examination_cardtemplate', 'gen_diag', self.gf('django.db.models.fields.CharField')(max_length=400, null=True))

        # Changing field 'CardTemplate.name'
        db.alter_column('examination_cardtemplate', 'name', self.gf('django.db.models.fields.CharField')(max_length=100, null=True))

        # Changing field 'CardTemplate.objective_data'
        db.alter_column('examination_cardtemplate', 'objective_data', self.gf('django.db.models.fields.CharField')(max_length=400, null=True))

        # Changing field 'CardTemplate.clinical_diag'
        db.alter_column('examination_cardtemplate', 'clinical_diag', self.gf('django.db.models.fields.CharField')(max_length=400, null=True))

        # Changing field 'CardTemplate.treatment'
        db.alter_column('examination_cardtemplate', 'treatment', self.gf('django.db.models.fields.CharField')(max_length=400, null=True))

        # Changing field 'CardTemplate.referral'
        db.alter_column('examination_cardtemplate', 'referral', self.gf('django.db.models.fields.CharField')(max_length=400, null=True))

        # Changing field 'CardTemplate.psycho_status'
        db.alter_column('examination_cardtemplate', 'psycho_status', self.gf('django.db.models.fields.CharField')(max_length=100, null=True))

        # Changing field 'ExaminationCard.complication'
        db.alter_column('examination_examinationcard', 'complication', self.gf('django.db.models.fields.CharField')(max_length=400, null=True))

        # Changing field 'ExaminationCard.concomitant_diag'
        db.alter_column('examination_examinationcard', 'concomitant_diag', self.gf('django.db.models.fields.CharField')(max_length=400, null=True))

        # Changing field 'ExaminationCard.gen_diag'
        db.alter_column('examination_examinationcard', 'gen_diag', self.gf('django.db.models.fields.CharField')(max_length=400, null=True))

        # Changing field 'ExaminationCard.objective_data'
        db.alter_column('examination_examinationcard', 'objective_data', self.gf('django.db.models.fields.CharField')(max_length=400, null=True))

        # Changing field 'ExaminationCard.disease'
        db.alter_column('examination_examinationcard', 'disease', self.gf('django.db.models.fields.CharField')(max_length=400, null=True))

        # Changing field 'ExaminationCard.anamnesis'
        db.alter_column('examination_examinationcard', 'anamnesis', self.gf('django.db.models.fields.CharField')(max_length=400, null=True))

        # Changing field 'ExaminationCard.clinical_diag'
        db.alter_column('examination_examinationcard', 'clinical_diag', self.gf('django.db.models.fields.CharField')(max_length=400, null=True))

        # Changing field 'ExaminationCard.treatment'
        db.alter_column('examination_examinationcard', 'treatment', self.gf('django.db.models.fields.CharField')(max_length=400, null=True))

        # Changing field 'ExaminationCard.extra_service'
        db.alter_column('examination_examinationcard', 'extra_service', self.gf('django.db.models.fields.CharField')(max_length=400, null=True))

        # Changing field 'ExaminationCard.complaints'
        db.alter_column('examination_examinationcard', 'complaints', self.gf('django.db.models.fields.CharField')(max_length=400, null=True))

        # Changing field 'ExaminationCard.referral'
        db.alter_column('examination_examinationcard', 'referral', self.gf('django.db.models.fields.CharField')(max_length=400, null=True))

        # Changing field 'ExaminationCard.psycho_status'
        db.alter_column('examination_examinationcard', 'psycho_status', self.gf('django.db.models.fields.CharField')(max_length=100, null=True))

        # Changing field 'ExaminationCard.mbk_diag'
        db.alter_column('examination_examinationcard', 'mbk_diag', self.gf('django.db.models.fields.CharField')(max_length=400, null=True))

        # Changing field 'ExaminationCard.history'
        db.alter_column('examination_examinationcard', 'history', self.gf('django.db.models.fields.CharField')(max_length=400, null=True))


    def backwards(self, orm):
        
        # User chose to not deal with backwards NULL issues for 'CardTemplate.complication'
        raise RuntimeError("Cannot reverse this migration. 'CardTemplate.complication' and its values cannot be restored.")

        # User chose to not deal with backwards NULL issues for 'CardTemplate.concomitant_diag'
        raise RuntimeError("Cannot reverse this migration. 'CardTemplate.concomitant_diag' and its values cannot be restored.")

        # User chose to not deal with backwards NULL issues for 'CardTemplate.gen_diag'
        raise RuntimeError("Cannot reverse this migration. 'CardTemplate.gen_diag' and its values cannot be restored.")

        # User chose to not deal with backwards NULL issues for 'CardTemplate.name'
        raise RuntimeError("Cannot reverse this migration. 'CardTemplate.name' and its values cannot be restored.")

        # User chose to not deal with backwards NULL issues for 'CardTemplate.objective_data'
        raise RuntimeError("Cannot reverse this migration. 'CardTemplate.objective_data' and its values cannot be restored.")

        # User chose to not deal with backwards NULL issues for 'CardTemplate.clinical_diag'
        raise RuntimeError("Cannot reverse this migration. 'CardTemplate.clinical_diag' and its values cannot be restored.")

        # User chose to not deal with backwards NULL issues for 'CardTemplate.treatment'
        raise RuntimeError("Cannot reverse this migration. 'CardTemplate.treatment' and its values cannot be restored.")

        # User chose to not deal with backwards NULL issues for 'CardTemplate.referral'
        raise RuntimeError("Cannot reverse this migration. 'CardTemplate.referral' and its values cannot be restored.")

        # User chose to not deal with backwards NULL issues for 'CardTemplate.psycho_status'
        raise RuntimeError("Cannot reverse this migration. 'CardTemplate.psycho_status' and its values cannot be restored.")

        # User chose to not deal with backwards NULL issues for 'ExaminationCard.complication'
        raise RuntimeError("Cannot reverse this migration. 'ExaminationCard.complication' and its values cannot be restored.")

        # User chose to not deal with backwards NULL issues for 'ExaminationCard.concomitant_diag'
        raise RuntimeError("Cannot reverse this migration. 'ExaminationCard.concomitant_diag' and its values cannot be restored.")

        # User chose to not deal with backwards NULL issues for 'ExaminationCard.gen_diag'
        raise RuntimeError("Cannot reverse this migration. 'ExaminationCard.gen_diag' and its values cannot be restored.")

        # User chose to not deal with backwards NULL issues for 'ExaminationCard.objective_data'
        raise RuntimeError("Cannot reverse this migration. 'ExaminationCard.objective_data' and its values cannot be restored.")

        # User chose to not deal with backwards NULL issues for 'ExaminationCard.disease'
        raise RuntimeError("Cannot reverse this migration. 'ExaminationCard.disease' and its values cannot be restored.")

        # User chose to not deal with backwards NULL issues for 'ExaminationCard.anamnesis'
        raise RuntimeError("Cannot reverse this migration. 'ExaminationCard.anamnesis' and its values cannot be restored.")

        # User chose to not deal with backwards NULL issues for 'ExaminationCard.clinical_diag'
        raise RuntimeError("Cannot reverse this migration. 'ExaminationCard.clinical_diag' and its values cannot be restored.")

        # User chose to not deal with backwards NULL issues for 'ExaminationCard.treatment'
        raise RuntimeError("Cannot reverse this migration. 'ExaminationCard.treatment' and its values cannot be restored.")

        # User chose to not deal with backwards NULL issues for 'ExaminationCard.extra_service'
        raise RuntimeError("Cannot reverse this migration. 'ExaminationCard.extra_service' and its values cannot be restored.")

        # User chose to not deal with backwards NULL issues for 'ExaminationCard.complaints'
        raise RuntimeError("Cannot reverse this migration. 'ExaminationCard.complaints' and its values cannot be restored.")

        # User chose to not deal with backwards NULL issues for 'ExaminationCard.referral'
        raise RuntimeError("Cannot reverse this migration. 'ExaminationCard.referral' and its values cannot be restored.")

        # User chose to not deal with backwards NULL issues for 'ExaminationCard.psycho_status'
        raise RuntimeError("Cannot reverse this migration. 'ExaminationCard.psycho_status' and its values cannot be restored.")

        # User chose to not deal with backwards NULL issues for 'ExaminationCard.mbk_diag'
        raise RuntimeError("Cannot reverse this migration. 'ExaminationCard.mbk_diag' and its values cannot be restored.")

        # User chose to not deal with backwards NULL issues for 'ExaminationCard.history'
        raise RuntimeError("Cannot reverse this migration. 'ExaminationCard.history' and its values cannot be restored.")


    models = {
        'examination.cardtemplate': {
            'Meta': {'object_name': 'CardTemplate'},
            'clinical_diag': ('django.db.models.fields.CharField', [], {'max_length': '400', 'null': 'True', 'blank': 'True'}),
            'complication': ('django.db.models.fields.CharField', [], {'max_length': '400', 'null': 'True', 'blank': 'True'}),
            'concomitant_diag': ('django.db.models.fields.CharField', [], {'max_length': '400', 'null': 'True', 'blank': 'True'}),
            'gen_diag': ('django.db.models.fields.CharField', [], {'max_length': '400', 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'objective_data': ('django.db.models.fields.CharField', [], {'max_length': '400', 'null': 'True', 'blank': 'True'}),
            'psycho_status': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'referral': ('django.db.models.fields.CharField', [], {'max_length': '400', 'null': 'True', 'blank': 'True'}),
            'treatment': ('django.db.models.fields.CharField', [], {'max_length': '400', 'null': 'True', 'blank': 'True'})
        },
        'examination.examinationcard': {
            'Meta': {'object_name': 'ExaminationCard'},
            'anamnesis': ('django.db.models.fields.CharField', [], {'max_length': '400', 'null': 'True', 'blank': 'True'}),
            'clinical_diag': ('django.db.models.fields.CharField', [], {'max_length': '400', 'null': 'True', 'blank': 'True'}),
            'complaints': ('django.db.models.fields.CharField', [], {'max_length': '400', 'null': 'True', 'blank': 'True'}),
            'complication': ('django.db.models.fields.CharField', [], {'max_length': '400', 'null': 'True', 'blank': 'True'}),
            'concomitant_diag': ('django.db.models.fields.CharField', [], {'max_length': '400', 'null': 'True', 'blank': 'True'}),
            'disease': ('django.db.models.fields.CharField', [], {'max_length': '400', 'null': 'True', 'blank': 'True'}),
            'extra_service': ('django.db.models.fields.CharField', [], {'max_length': '400', 'null': 'True', 'blank': 'True'}),
            'gen_diag': ('django.db.models.fields.CharField', [], {'max_length': '400', 'null': 'True', 'blank': 'True'}),
            'history': ('django.db.models.fields.CharField', [], {'max_length': '400', 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'mbk_diag': ('django.db.models.fields.CharField', [], {'max_length': '400', 'null': 'True', 'blank': 'True'}),
            'objective_data': ('django.db.models.fields.CharField', [], {'max_length': '400', 'null': 'True', 'blank': 'True'}),
            'psycho_status': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'referral': ('django.db.models.fields.CharField', [], {'max_length': '400', 'null': 'True', 'blank': 'True'}),
            'treatment': ('django.db.models.fields.CharField', [], {'max_length': '400', 'null': 'True', 'blank': 'True'})
        }
    }

    complete_apps = ['examination']
