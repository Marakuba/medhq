# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Changing field 'RemoteState.state'
        db.alter_column('remoting_remotestate', 'state_id', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['state.State'], unique=True))

        # Adding unique constraint on 'RemoteState', fields ['state']
        db.create_unique('remoting_remotestate', ['state_id'])


    def backwards(self, orm):
        
        # Removing unique constraint on 'RemoteState', fields ['state']
        db.delete_unique('remoting_remotestate', ['state_id'])

        # Changing field 'RemoteState.state'
        db.alter_column('remoting_remotestate', 'state_id', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['state.State']))


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
            'state': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['state.State']", 'unique': 'True'})
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
            'uuid': ('django.db.models.fields.CharField', [], {'max_length': '36'}),
            'website': ('django.db.models.fields.URLField', [], {'max_length': '200', 'blank': 'True'})
        }
    }

    complete_apps = ['remoting']
