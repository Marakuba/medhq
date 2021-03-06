# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Adding model 'Viewport'
        db.create_table('webapp_viewport', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=50)),
            ('slug', self.gf('django.db.models.fields.SlugField')(max_length=50, db_index=True)),
        ))
        db.send_create_signal('webapp', ['Viewport'])

        # Adding M2M table for field groups on 'Viewport'
        db.create_table('webapp_viewport_groups', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('viewport', models.ForeignKey(orm['webapp.viewport'], null=False)),
            ('group', models.ForeignKey(orm['auth.group'], null=False))
        ))
        db.create_unique('webapp_viewport_groups', ['viewport_id', 'group_id'])

        # Adding M2M table for field users on 'Viewport'
        db.create_table('webapp_viewport_users', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('viewport', models.ForeignKey(orm['webapp.viewport'], null=False)),
            ('user', models.ForeignKey(orm['auth.user'], null=False))
        ))
        db.create_unique('webapp_viewport_users', ['viewport_id', 'user_id'])

        # Adding model 'ViewportApp'
        db.create_table('webapp_viewportapp', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('viewport', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['webapp.Viewport'])),
            ('xtype', self.gf('django.db.models.fields.CharField')(max_length=50)),
            ('is_default', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('tbar_group', self.gf('django.db.models.fields.CharField')(max_length=50, blank=True)),
            ('splitter', self.gf('django.db.models.fields.CharField')(max_length=1)),
        ))
        db.send_create_signal('webapp', ['ViewportApp'])

        # Adding M2M table for field groups on 'ViewportApp'
        db.create_table('webapp_viewportapp_groups', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('viewportapp', models.ForeignKey(orm['webapp.viewportapp'], null=False)),
            ('group', models.ForeignKey(orm['auth.group'], null=False))
        ))
        db.create_unique('webapp_viewportapp_groups', ['viewportapp_id', 'group_id'])

        # Adding M2M table for field users on 'ViewportApp'
        db.create_table('webapp_viewportapp_users', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('viewportapp', models.ForeignKey(orm['webapp.viewportapp'], null=False)),
            ('user', models.ForeignKey(orm['auth.user'], null=False))
        ))
        db.create_unique('webapp_viewportapp_users', ['viewportapp_id', 'user_id'])


    def backwards(self, orm):
        
        # Deleting model 'Viewport'
        db.delete_table('webapp_viewport')

        # Removing M2M table for field groups on 'Viewport'
        db.delete_table('webapp_viewport_groups')

        # Removing M2M table for field users on 'Viewport'
        db.delete_table('webapp_viewport_users')

        # Deleting model 'ViewportApp'
        db.delete_table('webapp_viewportapp')

        # Removing M2M table for field groups on 'ViewportApp'
        db.delete_table('webapp_viewportapp_groups')

        # Removing M2M table for field users on 'ViewportApp'
        db.delete_table('webapp_viewportapp_users')


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
        'webapp.viewport': {
            'Meta': {'object_name': 'Viewport'},
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['auth.Group']", 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'slug': ('django.db.models.fields.SlugField', [], {'max_length': '50', 'db_index': 'True'}),
            'users': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['auth.User']", 'null': 'True', 'blank': 'True'})
        },
        'webapp.viewportapp': {
            'Meta': {'object_name': 'ViewportApp'},
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['auth.Group']", 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_default': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'splitter': ('django.db.models.fields.CharField', [], {'max_length': '1'}),
            'tbar_group': ('django.db.models.fields.CharField', [], {'max_length': '50', 'blank': 'True'}),
            'users': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['auth.User']", 'null': 'True', 'blank': 'True'}),
            'viewport': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['webapp.Viewport']"}),
            'xtype': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        }
    }

    complete_apps = ['webapp']
