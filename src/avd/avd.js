var compositionFactory = require ('../layers/composition')
var node = require ('../node')
var targets = require ('../targets/targets')

function avd(_animationData) {

	var attributes = [{
		key: 'xmlns:android',
		value: 'http://schemas.android.com/apk/res/android'
	},{
		key: 'xmlns:aapt',
		value: 'http://schemas.android.com/aapt'
	}];

	var _composition, animationData;

	function createVectorDrawable(width, height) {
		var attributes = [{
			key: 'android:height',
			value: height + 'dp'
		},{
			key: 'android:width',
			value: width + 'dp'
		},{
			key: 'android:viewportHeight',
			value: height
		},{
			key: 'android:viewportWidth',
			value: width
		}];
		var nodeElement = node.createNodeWithAttributes('vector', attributes, '');
		return nodeElement;
	}

	function createAAPTVectorDrawable() {
		var attributes = [{
			key: 'name',
			value: 'android:drawable'
		}];
		var nodeElement = node.createNodeWithAttributes('aapt:attr', attributes, '');
		return nodeElement;
		//<aapt:attr name="android:drawable">
	}
	

	function exportNode() {
		var promise = new Promise(function(resolve, reject){
			targets.resetTargets();
			var avdElem = node.createNodeWithAttributes('animated-vector', attributes);
			var aaptVectorElem = createAAPTVectorDrawable();
			var vectorElem = createVectorDrawable(animationData.w, animationData.h);
			node.nestChild(aaptVectorElem, vectorElem);
			node.nestChild(avdElem, aaptVectorElem);
			node.nestChild(vectorElem, _composition.exportNode('root'));
			targets.buildTargets(avdElem);
			resolve(avdElem);
		})
		return promise;
	}

	function createTargets() {
		var targets = [];
		_composition.createTargets(targets);
	}

	function processAnimation(_animationData) {
		var promise = new Promise(function(resolve, reject){
			animationData = _animationData;
			_composition = compositionFactory(_animationData, _animationData.assets);
			_composition.setFrameRate(_animationData.fr);
			_composition.setTimeOffset(0);
			_composition.processData();
			resolve();
		})
		return promise;
	}

	return  {
		exportNode: exportNode,
		createTargets: createTargets,
		processAnimation: processAnimation
	}
}

module.exports = avd;