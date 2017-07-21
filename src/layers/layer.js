var naming = require('../naming');
var node = require ('../node');
var masker = require ('./masker');
var transformer = require ('./transformer');

function layer(state) {

	state.timeOffset = 0;
	state.frameRate = 0;

	function setTimeOffset(_timeOffset) {
		state.timeOffset = _timeOffset;
	}

	function setFrameRate(_frameRate) {
		state.frameRate = _frameRate;
	}

	function exportNode(name) {
		var groupName = name + naming.GROUP_NAME;
		var masksGroup = factoryInstance.getMasks(name);
		var gr;
		if(masksGroup) {
			gr = masksGroup;
			var leaves = node.getLastLeaves(masksGroup);
			var i, len = leaves.length;
			for(i = 0; i < len; i += 1) {
				this.createNodeInstance(leaves[i], groupName + naming.GROUP_NAME + '_' + i);
			}
		} else {
			gr = node.createNode('group', groupName);
			this.createNodeInstance(gr, groupName);
		}
		var parentNode = factoryInstance.buildParenting(state.layerData.parent, gr, groupName, true);
		return parentNode;
	}

	var factoryInstance = {
		setTimeOffset: setTimeOffset,
		setFrameRate: setFrameRate,
		exportNode: exportNode
	}
	return Object.assign(factoryInstance, masker(state), transformer(state));
}

module.exports = layer;