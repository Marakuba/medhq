Ext.ns('App.utils');

App.utils.getApiUrl = function() {
    var path = [WebApp.API_URL];
    for (var index = 0; index < arguments.length; index++) {
        path.push(arguments[index]);
    }
    return path.join("/");
};

App.utils.uriToId = function(uri) {
    var paths = uri.split('/');
    return paths[paths.length-1];
};

Ext.idToColor = function(id) {
    return parseInt(id) % 3 + 1;
};
