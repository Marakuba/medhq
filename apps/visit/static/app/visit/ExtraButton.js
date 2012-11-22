var $this = App.patient.CardVisitGrid;
var $orig = $this.prototype.initComponent;
$this.prototype.initComponent = function(){
    $orig.apply(this, arguments);
    this.getTopToolbar().insert(0, {
        text:'Extra button'
    });
}