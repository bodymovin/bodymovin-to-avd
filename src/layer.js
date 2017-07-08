var node = require('./node');
var path = require('./path');
var property = require('./property');
var applyTransformToContainer = require('./transform');
var createPathData = require('./pathData');

function addLayers(container, layers, animation, targets, name, timeOffset) {
	var i, len = layers.length, layer, containerGroup, layerName;
	for(i = len - 1; i >= 0; i -= 1) {
		if(layers[i].ty === 4 || layers[i].ty === 0 || layers[i].ty === 1) {
			layerName = name + 'layer_' + i + '_';
			if(layers[i].ty === 4) {
				layer = path.createShapeLayer(layers[i], layers, targets, layerName, timeOffset);
			} else if(layers[i].ty === 0) {
				layerName = name + 'layer_' + i + '_';
				layer = node.createNode('group', layerName);
				var compositionLayers = getCompositionLayers(layers[i].refId, animation.assets);
				addLayers(layer, compositionLayers, animation, targets, layerName, timeOffset + layers[i].st);
			} else if(layers[i].ty === 1) {
				layerName = name + 'layer_' + i + '_';
				layer = path.createSolidLayer(layers[i], layerName);
			}
			containerGroup = addMasks(layer, layers[i].masksProperties, targets, timeOffset);
			containerGroup = applyTransformToContainer(containerGroup, layers[i].ks, targets, timeOffset);
			containerGroup = addGroupToParent(containerGroup, layers[i].parent, layers, targets, timeOffset);
			containerGroup = setTimeLimits(containerGroup, layers[i], targets, animation.ip + timeOffset, animation.op + timeOffset);
			node.nestChild(container, containerGroup);
		} else {
			//console.log(layers[i].ty);
		}
	}
}

function getCompositionLayers(compId, assets) {
	var i = 0, len = assets.length;
	while (i < len) {
		if(assets[i].id === compId) {
			return assets[i].layers;
		}
		i += 1;
	}
	return [];
}

function getLayerDataByIndex(index, layers) {
	var i = 0, len = layers.length;
	while( i < len) {
		if(layers[i].ind === index) {
			return layers[i];
		}
		i += 1;
	}
}

function addNewClipPathDataToTargets(targets, pathName, clipPathData) {
	var i, len = targets.length, pathDataAttr;
	for( i = 0; i < len; i += 1) {
		if(targets[i].target[0]._attr['android:name'] === pathName) {
			pathDataAttr = targets[i].target[1]['aapt:attr'][1]["set"][1].objectAnimator[0]._attr;
			pathDataAttr['android:valueFrom'] += ' ' + clipPathData;
			pathDataAttr['android:valueTo'] += ' ' + clipPathData;
		}
	}
}

function addMasks(group, masksProperties, targets, timeOffset){
	if(masksProperties) {
		var name = node.getAttribute(group, 'android:name');
		var child = group;
		var prevClipPath;
		var i, len = masksProperties.length, maskCount = 0, clipName, clipPath, maskProp, prevMaskProp;
		for (i = 0; i < len; i += 1) {
			maskProp = masksProperties[i];
			prevMaskProp = i === 0 ? maskProp : masksProperties[i - 1];
			if (!maskProp.inv) {
				if (maskProp.mode === 'a') {
					if(!prevClipPath) {
						clipName = name + 'clip_' + maskCount + '_'
						clipPath = node.createNode('clip-path', clipName);
						prevClipPath = clipPath;
						if (maskProp.pt.a === 0) {
							node.addAttribute(clipPath,'android:pathData', createPathData(maskProp.pt.k));
						} else {
							node.addAttribute(clipPath,'android:pathData', createPathData(maskProp.pt.k[0].s[0]));
							var animatedPath = property.createAnimatedProperty(clipName, 'pathData', maskProp.pt.k, timeOffset);
							targets.push(animatedPath);
						}
						node.nestChild(clipPath, child);
						child = clipPath;
						maskCount += 1;
					} else if(prevClipPath && prevMaskProp.mode === 'a'
						&& maskProp.pt.a === 0) {
						var newClipPathData = createPathData(maskProp.pt.k);
						var prevPathData =  node.getAttribute(prevClipPath,'android:pathData');
						prevPathData += ' ' + newClipPathData;
						node.addAttribute(clipPath,'android:pathData', prevPathData);
						// Searching for path keyframes in case it's an animated path
						var prevClipName = node.getAttribute(prevClipPath, 'android:name');
						addNewClipPathDataToTargets(targets, prevClipName, newClipPathData);
					} else {
						var clonedGroup = node.cloneNode(group, targets, 'clone_' + maskCount + '_');
						clipName = name + 'clip_' + maskCount + '_';
						clipPath = node.createNode('clip-path', clipName);
						prevClipPath = clipPath;
						if (maskProp.pt.a === 0) {
							node.addAttribute(clipPath,'android:pathData', createPathData(maskProp.pt.k));
						} else {
							node.addAttribute(clipPath,'android:pathData', createPathData(maskProp.pt.k[0].s[0]));
							var animatedPath = property.createAnimatedProperty(clipName, 'pathData', maskProp.pt.k, timeOffset);
							targets.push(animatedPath);
						}
						node.nestChild(clipPath, clonedGroup);
						var parentGroup = node.createNode('group');
						var clipGroup = node.createNode('group');
						node.nestChild(parentGroup, clipGroup);
						node.nestChild(clipGroup, child);
						var clipGroup = node.createNode('group');
						node.nestChild(parentGroup, clipGroup);
						node.nestChild(clipGroup, clipPath);
						child = parentGroup;
					}
				} else if (maskProp.mode === 'i') {
					clipName = name + 'clip_' + maskCount + '_';
					clipPath = node.createNode('clip-path', clipName);
					prevClipPath = clipPath;
					if (maskProp.pt.a === 0) {
						node.addAttribute(clipPath,'android:pathData', createPathData(maskProp.pt.k));
					} else {
						node.addAttribute(clipPath,'android:pathData', createPathData(maskProp.pt.k[0].s[0]));
						var animatedPath = property.createAnimatedProperty(clipName, 'pathData', maskProp.pt.k, timeOffset);
						targets.push(animatedPath);
					}
					node.nestChild(clipPath, child);
					child = clipPath;
					maskCount += 1;
				}
			}
		}
		if(maskCount > 0) {
			var parentGroup = node.createNode('group', name + '_masks_group_');
			node.nestChild(parentGroup, child);
			return parentGroup;
		}
	}
	return group;
}

function addGroupToParent(group, parent, layers, targets, timeOffset) {
	var name = node.getAttribute(group, 'android:name');
	if(parent !== undefined) {
		name = name + 'parent_' + parent + '_';
		var parentGroup = node.createNode('group', name);
		var parentData = getLayerDataByIndex(parent, layers);
		var containerParentGroup = applyTransformToContainer(parentGroup, parentData.ks, targets, timeOffset);
		node.nestChild(parentGroup, group);
		containerParentGroup = addGroupToParent(containerParentGroup, parentData.parent, layers, targets, timeOffset);
		return containerParentGroup;
	}
	return group;
}

function setTimeLimits(group, layerData, targets, inPoint, outPoint) {
	var name = node.getAttribute(group, 'android:name');
	if(layerData.ip > inPoint || layerData.op < outPoint) {
		name += 'time_';
		var timeGroup = node.createNode('group', name);
		node.nestChild(timeGroup, group);
		group = timeGroup;
		var target = property.createTargetNode(name);
		var aapt = property.createAAPTAnimation();
		var set = property.createSetNode();
		node.nestChild(aapt, set);
		node.nestChild(target, aapt);
		if(layerData.ip > inPoint) {
			node.addAttribute(timeGroup, 'android:scaleX', 0);
			var attributes = [{
				key: 'android:propertyName',
				value: 'scaleX'
			},
			{
				key: 'android:duration',
				value: 0
			},
			{
				key: 'android:startOffset',
				value: layerData.ip
			},
			{
				key: 'android:valueFrom',
				value: 0
			},
			{
				key: 'android:valueTo',
				value: 1
			},
			{
				key: 'android:valueType',
				value: 'floatType'
			}];
			var objectAnimator = node.createNodeWithAttributes('objectAnimator', attributes, '');
			node.nestChild(set, objectAnimator);
		}
		if(layerData.op < outPoint) {
			node.addAttribute(timeGroup, 'android:scaleY', 1);
			var attributes = [{
				key: 'android:propertyName',
				value: 'scaleY'
			},
			{
				key: 'android:duration',
				value: 0
			},
			{
				key: 'android:startOffset',
				value: layerData.op
			},
			{
				key: 'android:valueFrom',
				value: 1
			},
			{
				key: 'android:valueTo',
				value: 0
			},
			{
				key: 'android:valueType',
				value: 'floatType'
			}];
			var objectAnimator = node.createNodeWithAttributes('objectAnimator', attributes, '');
			node.nestChild(set, objectAnimator);
		}
		targets.push(target);
		
	}
	return group;
}

module.exports = {
	addLayers: addLayers
}