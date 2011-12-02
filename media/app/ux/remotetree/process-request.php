<?
// vim: ts=4:sw=4:nu:fdc=4:nospell

// include classess
require("classes/ctree.php");
require("classes/cobj.php");
require("classes/cfield.php");
require("classes/cquery.php");

// create odb
//$odb = new PDO("sqlite:tree.sqlite");
$odb = new PDO("mysql:unix_socket=/var/lib/mysql/mysql.sock;dbname=test","test","test");
$odb->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$cmd = $_POST["cmd"];
$config = $_POST;
$config["odb"] = $odb;

$otree = new ctree($config);
//error_log(print_r($otree,1));
$error = $cmd($otree);
exit;

function getTree($otree) {
	echo json_encode($otree->getTree());
} // eo function getTree

function appendTreeChild($otree) {
	$nodeID = $otree->appendChild();
	echo "string" === gettype($nodeID) 
		? '{"success":false,"error":"' . $nodeID . '"}'
		: '{"success":true,"id":' . $nodeID . '}'
	;

} // eo function appendTreeChild

function insertTreeChild($otree) {
	$nodeID = $otree->insertChild();
	echo "string" === gettype($nodeID) 
		? '{"success":false,"error":"' . $nodeID . '"}'
		: '{"success":true,"id":' . $nodeID . '}'
	;

} // eo function insertTreeChild


function removeTreeNode($otree) {
	$nodeID = $otree->removeNode();
	echo "string" === gettype($nodeID) 
		? '{"success":false,"error":"' . $nodeID . '"}'
		: '{"success":true}'
	;
} // eo function removeTreeNode

function renameTreeNode($otree) {
	$nodeID = $otree->renameNode();
	echo "string" === gettype($nodeID) 
		? '{"success":false,"error":"' . $nodeID . '"}'
		: '{"success":true}'
	;
} // eo function renameTreeNode

function moveTreeNode($otree) {
	$error = $otree->moveNode();
	echo "string" === gettype($error) 
		? '{"success":false,"error":"' . $nodeID . '"}'
		: '{"success":true}'
	;
} // eo function moveTreeNode

// eof
?>
