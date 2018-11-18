var naming = require('../naming');
var node = require ('../node');
var masker = require ('./masker');
var property = require ('../property');
var targets = require ('../targets/targets');
var transformer = require ('./transformer');
var createTransformGroup = require ('../helpers/transform/createTransformGroup');

function layer(state) {

	state.timeOffset = 0;
	state.workAreaOffset = 0;

	function setTimeOffset(_timeOffset) {
		state.timeOffset = _timeOffset;
		return this;
	}

	function setWorkAreaOffset(_workAreaOffset) {
		state.workAreaOffset = _workAreaOffset;
		return this;
	}

	function exportNode(name, parentWorkAreaOffset) {
		var groupName = name + naming.GROUP_NAME;
		var masksGroup = factoryInstance.getMasks(name);
		var gr;
		if(masksGroup) {
			gr = masksGroup;
			var leaves = node.getLastLeaves(masksGroup, ['group']);
			var i, len = leaves.length;
			for(i = 0; i < len; i += 1) {
				this.createNodeInstance(leaves[i], groupName + naming.GROUP_NAME + '_' + i);
			}
		} else {
			gr = node.createNode('group', groupName);
			this.createNodeInstance(gr, groupName);
		}
		var parentNode = gr;
		if(state.layerData.ks){
			var transformArray = createTransformGroup(groupName, state.layerData.ks, state.timeOffset, parentNode);
			parentNode = node.nestArray(transformArray);
			var canReuse = false; //Todo find out if parent has not animated properties to reuse
			parentNode = factoryInstance.buildParenting(state.layerData.parent, parentNode, groupName, canReuse);
			parentNode = clipTimeLimits(parentNode, node.getAttribute(parentNode, 'android:name'), parentWorkAreaOffset);	
		}
		return parentNode;
	}

	function clipTimeLimits(group, name, parentWorkAreaOffset) {
		var inPoint = state.globalInPoint;
		var outPoint = state.globalOutPoint + state.timeOffset;
		var layerData = state.layerData;
		var animatedProp;
		var timeCap = property.getTimeCap();
		if(layerData.ip + state.timeOffset > 0 || layerData.op + state.timeOffset + parentWorkAreaOffset < timeCap) {
			if(targets.getTargetByNameAndProperty(name,'scaleY')) {
				name += naming.TIME_NAME;
				var timeGroup = node.createNode('group', name);
				node.nestChild(timeGroup, group);
				group = timeGroup;
			}
			var scaleX = (node.getAttribute(group, 'android:scaleX') || 1) * 100;
			var scaleY = (node.getAttribute(group, 'android:scaleY') || 1) * 100;
			var clipStart = layerData.ip + state.timeOffset > 0;
			var clipEnd = layerData.op + state.timeOffset + parentWorkAreaOffset < timeCap;
			if(clipStart) {
				node.addAttribute(group,'android:scaleY', 0);
			}
			if(clipStart || clipEnd) {
				animatedProp = property.createAnimatedProperty(name, 'scaleY', [{s:[0,0,100],e:[scaleX,scaleY,100],t:0},{t:0}], layerData.ip + state.timeOffset);
				targets.addTarget(animatedProp);
			}
			if(clipEnd) {
				animatedProp = property.createAnimatedProperty(name, 'scaleY', [{s:[scaleX,scaleY,100],e:[0,0,100],t:0},{t:0}], layerData.op + state.timeOffset + parentWorkAreaOffset);
				targets.addTarget(animatedProp);
			}
		}
		return group;
	}

	var factoryInstance = {
		setTimeOffset: setTimeOffset,
		setWorkAreaOffset: setWorkAreaOffset,
		exportNode: exportNode
	}
	return Object.assign(factoryInstance, masker(state), transformer(state));
}

module.exports = layer;