Ext.ns('App.webapp');


App.webapp.ProfileWidget = Ext.extend(Ext.Button, {
    initComponent : function(config){

        this.profileItems = ['<b class="menu-title">Выберите профиль</b>'];
        Ext.each(WebApp.profiles, function(profile){
            config = {
                profileId:profile[0],
                text:profile[1],
                checked:profile[0]==WebApp.active_profile,
                group:'profile',
                checkHandler:function(menuitem,checked){
                    if(checked){
                        window.location.href = String.format('/webapp/setactiveprofile/{0}/',menuitem.profileId);
                    }
                }
            };
            this.profileItems.push(config);
        }, this);

        this.appsItems = [];
        Ext.each(WebApp.appPool, function(app){
            config = {
                text:app[0],
                appUrl:app[1],
                group:'apps',
                handler:function(menuitem,e){
                    window.location.href = menuitem.appUrl;
                }
            };
            this.appsItems.push(config);
        }, this);

        config = {
            iconCls:'silk-cog',
            iconAlign:'right',
            text:String.format('{0}, {1}', WebApp.active_user, WebApp.active_state),
            menu:new Ext.menu.Menu({
                items:[{
                    text:'Приложения',
                    menu:{
                        items:this.appsItems
                    }
                },{
                    text:'Профиль',
                    menu:{
                        items:this.profileItems
                    }
                },{
                    text:'Выход',
                    iconCls:'silk-door-out',
                    handler:function(){
                        window.location.href = '/webapp/logout/';
                    }
                }]
            })
        };
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        App.webapp.ProfileWidget.superclass.initComponent.apply(this, arguments);

    }

});


Ext.reg('profileWidget', App.webapp.ProfileWidget);