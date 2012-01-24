# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Adding model 'SyncObject'
        db.create_table('remoting_syncobject', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('created', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('content_type', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['contenttypes.ContentType'])),
            ('object_id', self.gf('django.db.models.fields.IntegerField')()),
            ('sync_id', self.gf('django.db.models.fields.IntegerField')()),
            ('state', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['state.State'])),
        ))
        db.send_create_signal('remoting', ['SyncObject'])

        # Adding model 'RemoteState'
        db.create_table('remoting_remotestate', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('created', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('modified', self.gf('django.db.models.fields.DateTimeField')(auto_now=True, blank=True)),
            ('state', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['state.State'])),
            ('secret_key', self.gf('django.db.models.fields.CharField')(max_length=256)),
            ('domain_url', self.gf('django.db.models.fields.URLField')(max_length=200)),
        ))
        db.send_create_signal('remoting', ['RemoteState'])

        # Adding model 'Transaction'
        db.create_table('remoting_transaction', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('created', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('type', self.gf('django.db.models.fields.CharField')(max_length=20)),
            ('sender', self.gf('django.db.models.fields.related.ForeignKey')(related_name='sender_state', to=orm['state.State'])),
            ('reciever', self.gf('django.db.models.fields.related.ForeignKey')(related_name='reciever_state', to=orm['state.State'])),
        ))
        db.send_create_signal('remoting', ['Transaction'])

        # Adding model 'TransactionItem'
        db.create_table('remoting_transactionitem', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('transaction', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['remoting.Transaction'])),
            ('status', self.gf('django.db.models.fields.CharField')(max_length=20)),
            ('content_type', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['contenttypes.ContentType'])),
            ('object_id', self.gf('django.db.models.fields.IntegerField')()),
        ))
        db.send_create_signal('remoting', ['TransactionItem'])


    def backwards(self, orm):
        
        # Deleting model 'SyncObject'
        db.delete_table('remoting_syncobject')

        # Deleting model 'RemoteState'
        db.delete_table('remoting_remotestate')

        # Deleting model 'Transaction'
        db.delete_table('remoting_transaction')

        # Deleting model 'TransactionItem'
        db.delete_table('remoting_transactionitem')


    models = {
        'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        'remoting.remotestate': {
            'Meta': {'ordering': "('-created',)", 'object_name': 'RemoteState'},
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'domain_url': ('django.db.models.fields.URLField', [], {'max_length': '200'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'modified': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'secret_key': ('django.db.models.fields.CharField', [], {'max_length': '256'}),
            'state': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['state.State']"})
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
            'object_id': ('django.db.models.fields.IntegerField', [], {}),
            'status': ('django.db.models.fields.CharField', [], {'max_length': '20'}),
            'transaction': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['remoting.Transaction']"})
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
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'official_title': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'ogrn': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '15', 'decimal_places': '0', 'blank': 'True'}),
            'phones': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'post_address': ('django.db.models.fields.CharField', [], {'max_length': '200', 'blank': 'True'}),
            'print_name': ('django.db.models.fields.CharField', [], {'default': "u''", 'max_length': '200'}),
            'type': ('django.db.models.fields.CharField', [], {'max_length': '1'}),
            'website': ('django.db.models.fields.URLField', [], {'max_length': '200', 'blank': 'True'})
        }
    }

    complete_apps = ['remoting']
