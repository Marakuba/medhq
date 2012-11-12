Ext.ns('App.utils');

App.utils.getApiUrl = function() {
    var path = [App.API_URL];
    for (var index = 0; index < arguments.length; index++) {
        path.push(arguments[index]);
    }
    return path.join("/");
};