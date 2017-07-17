var node = require ('../node');
var _targets = [];

function resetTargets(){
	_targets.length = 0;
}

function addTarget(target){
	_targets.push(target);
}

function buildTargets(avd) {
	var target;
	var i, len = _targets.length;
	for(i = 0; i < len; i += 1) {
		target = _targets[i];
		node.nestChild(avd, target);
	} 
}

module.exports = {
	resetTargets: resetTargets,
	addTarget: addTarget,
	buildTargets: buildTargets
};