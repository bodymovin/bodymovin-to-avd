var node = require ('../../node');
var naming = require ('../../naming');
var layer = require ('../layer');

function solid(layerData) {

	var state = {
		layerData: layerData
	}

	function createNodeInstance(grouper, groupName) {
		var layerData = state.layerData;
		var attributes = [];
		attributes.push({
			key: 'android:fillColor',
			value: state.layerData.sc
		})
		attributes.push({
			key: 'android:pathData',
			value: 'M0,0 L' + layerData.sw + ',0 L' + layerData.sw + ',' + layerData.sh + ' L0,' + layerData.sh + 'z'
		})
		var path = node.createNodeWithAttributes('path', attributes, groupName + naming.SOLID_NAME);
		if(!(layerData.ks && layerData.ks.o && layerData.ks.o.a === 0 && layerData.ks.o.k === 0)) {
			node.nestChild(grouper, path);
		}
	}

	function processData() {}

	var factoryInstance = {
		createNodeInstance: createNodeInstance,
		processData: processData
	};

	Object.assign(factoryInstance, layer(state)); 

	return factoryInstance;
}

module.exports = solid;