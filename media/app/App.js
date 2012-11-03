Ext.ns('App');
Ext.ns('Ext');


/*
 * MEDIA_URL passing from server
 */
App.MEDIA_URL = MEDIA_URL || '/media/';

/*
 * API_URL
 */
App.API_URL = '/api/v1/dashboard';

/*
 * Generates api url
 */
App.getApiUrl = function() {
	var path = [App.API_URL];
	for (var index = 0; index < arguments.length; index++) {
		path.push(arguments[index]);
	}
	return path.join("/");
};

App.App.getApiUrl = App.getApiUrl; // backward compatibility

App.uriToId = function(uri) {
	var paths = uri.split('/');
	return paths[paths.length-1];
};

Ext.idToColor = function(id) {
	return parseInt(id) % 3 + 1;
};

