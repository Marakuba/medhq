Ext.ns('App.barcoding');

function initPrinter(config) {
    
    var slug = config.slug, address = config.address, port = config.port;

    var ws = App.barcoding[slug+'WebSocket'] = new WebSocket(String.format("ws://{0}:{1}/", address, port));
    ws.onopen = function() {
        if(config.onopen){
            config.onopen();
        }
    };
    ws.onmessage = function() {
        if(config.onmessage){
            config.onmessage();
        }
    };
    ws.onclose = function() {
        if(config.onclose){
            config.onclose();
        }
    };
    ws.onerror = function() {
        if(config.onerror){
            config.onerror();
        }
        Ext.MessageBox.alert('Ошибка','Невозможно подключиться к принтеру!');
    };
}

function getBarcodePrinters(slug, key, callback, scope){
    App.direct.numeration.getPrinterBySlug(slug, function(res, e) {
        if(res && res.success) {
            console.info(res);
            App.barcoding.printers = res.data.printers;
            if(App.barcoding.printers.length) {
                var stateKey = key || String.format('{1}_printer_{0}', WebApp.active_state_id, slug);
                var printer = Ext.state.Manager.getProvider().get(stateKey);
                if(!printer){
                    printer = App.barcoding.printers[0];
                    Ext.state.Manager.getProvider().set(key, printer);
                }
                initPrinter({
                    slug:slug,
                    address:printer.address,
                    port:printer.port
                });
            }
            if(callback){
                Ext.callback(callback, scope || window);
            }
        } else {
            // printer not found handler
        }
    });
}