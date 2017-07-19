var grouper = require ('./grouper');
var masker = require ('./masker');
var transformer = require ('./transformer');
var layer = require ('./layer');
var node = require ('../node');
var shapeFactory = require ('../layers/shape/shape');
var naming = require('../naming');

function composition(compositionData, assets) {

	var compLayersData = compositionData.layers ||  getCompositionLayers(compositionData.refId, assets);

	var state = {
		inPoint: compositionData.ip || 0,
		outPoint: compositionData.op || 0,
		startPoint: compositionData.st || 0,
		layerData: compositionData,
		layers: []
	}

	function getCompositionLayers(compId, assets, layers) {
		var i = 0, len = assets.length;
		while (i < len) {
			if(assets[i].id === compId) {
				return assets[i].layers;
			}
			i += 1;
		}
		return [];
	}

	function exportNode(name) {
		var gr = node.createNode('group', name);
		var parentNode = factoryInstance.buildParenting(state.layerData.parent, gr, name, true);
		var layers = state.layers;
		var len = layers.length;
		for (i = 0; i < len; i += 1) {
			node.nestChild(gr, layers[i].exportNode(name + naming.LAYER_NAME + '_' + i));
		}
		return parentNode;
	}

	function processData() {
		var i, len = compLayersData.length;
		var layer;
		for(i = 0; i < len; i += 1) {
			if(compLayersData[i].ty === 4) {
				layer = shapeFactory(compLayersData[i]);
			} else if(compLayersData[i].ty === 0) {
				layer = composition(compLayersData[i], assets);
			} else {
				layer = null;
			}
			if(layer){
				layer.setTimeOffset(state.timeOffset + state.startPoint);
				layer.setFrameRate(state.frameRate);
				layer.setSiblings(compLayersData);
				layer.processData();
				state.layers.push(layer);
			}
		}
	}

	var factoryInstance = {
		exportNode: exportNode,
		processData: processData
	};
	Object.assign(factoryInstance, layer(state), masker(state), transformer(state)); 

	return factoryInstance;
}

module.exports = composition;