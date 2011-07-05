# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Adding model 'CardTemplate'
        db.create_table('examination_cardtemplate', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('objective_data', self.gf('django.db.models.fields.CharField')(max_length=400)),
            ('psycho_status', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('gen_diag', self.gf('django.db.models.fields.CharField')(max_length=400)),
            ('complication', self.gf('django.db.models.fields.CharField')(max_length=400)),
            ('concomitant_diag', self.gf('django.db.models.fields.CharField')(max_length=400)),
            ('clinical_diag', self.gf('django.db.models.fields.CharField')(max_length=400)),
            ('treatment', self.gf('django.db.models.fields.CharField')(max_length=400)),
            ('referral', self.gf('django.db.models.fields.CharField')(max_length=400)),
        ))
        db.send_create_signal('examination', ['CardTemplate'])

        # Adding model 'ExaminationCard'
        db.create_table('examination_examinationcard', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('disease', self.gf('django.db.models.fields.CharField')(max_length=400)),
            ('complaints', self.gf('django.db.models.fields.CharField')(max_length=400)),
            ('history', self.gf('django.db.models.fields.CharField')(max_length=400)),
            ('anamnesis', self.gf('django.db.models.fields.CharField')(max_length=400)),
            ('objective_data', self.gf('django.db.models.fields.CharField')(max_length=400)),
            ('psycho_status', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('gen_diag', self.gf('django.db.models.fields.CharField')(max_length=400)),
            ('mbk_diag', self.gf('django.db.models.fields.CharField')(max_length=400)),
            ('complication', self.gf('django.db.models.fields.CharField')(max_length=400)),
            ('concomitant_diag', self.gf('django.db.models.fields.CharField')(max_length=400)),
            ('clinical_diag', self.gf('django.db.models.fields.CharField')(max_length=400)),
            ('treatment', self.gf('django.db.models.fields.CharField')(max_length=400)),
            ('referral', self.gf('django.db.models.fields.CharField')(max_length=400)),
            ('extra_service', self.gf('django.db.models.fields.CharField')(max_length=400)),
        ))
        db.send_create_signal('examination', ['ExaminationCard'])


    def backwards(self, orm):
        
        # Deleting model 'CardTemplate'
        db.delete_table('examination_cardtemplate')

        # Deleting model 'ExaminationCard'
        db.delete_table('examination_examinationcard')


    models = {
        'examination.cardtemplate': {
            'Meta': {'object_name': 'CardTemplate'},
            'clinical_diag': ('django.db.models.fields.CharField', [], {'max_length': '400'}),
            'complication': ('django.db.models.fields.CharField', [], {'max_length': '400'}),
            'concomitant_diag': ('django.db.models.fields.CharField', [], {'max_length': '400'}),
            'gen_diag': ('django.db.models.fields.CharField', [], {'max_length': '400'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'objective_data': ('django.db.models.fields.CharField', [], {'max_length': '400'}),
            'psycho_status': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'referral': ('django.db.models.fields.CharField', [], {'max_length': '400'}),
            'treatment': ('django.db.models.fields.CharField', [], {'max_length': '400'})
        },
        'examination.examinationcard': {
            'Meta': {'object_name': 'ExaminationCard'},
            'anamnesis': ('django.db.models.fields.CharField', [], {'max_length': '400'}),
            'clinical_diag': ('django.db.models.fields.CharField', [], {'max_length': '400'}),
            'complaints': ('django.db.models.fields.CharField', [], {'max_length': '400'}),
            'complication': ('django.db.models.fields.CharField', [], {'max_length': '400'}),
            'concomitant_diag': ('django.db.models.fields.CharField', [], {'max_length': '400'}),
            'disease': ('django.db.models.fields.CharField', [], {'max_length': '400'}),
            'extra_service': ('django.db.models.fields.CharField', [], {'max_length': '400'}),
            'gen_diag': ('django.db.models.fields.CharField', [], {'max_length': '400'}),
            'history': ('django.db.models.fields.CharField', [], {'max_length': '400'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'mbk_diag': ('django.db.models.fields.CharField', [], {'max_length': '400'}),
            'objective_data': ('django.db.models.fields.CharField', [], {'max_length': '400'}),
            'psycho_status': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'referral': ('django.db.models.fields.CharField', [], {'max_length': '400'}),
            'treatment': ('django.db.models.fields.CharField', [], {'max_length': '400'})
        }
    }

    complete_apps = ['examination']
