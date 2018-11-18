var naming = require ('../naming');
var node = require ('../node');
var targets = require ('../targets/targets');
var property = require ('../property');
var createPathData = require ('../pathData');

function masker(state) {
	var masks = [];
	var maskCount = 0, nestCount = 0;
	var hasAnimatedProp = false;
	var currentMaskData = {
		type:'',
		currentPaths: []
	};
	var clipName,containerGroup,animatedProp;
	var clipPathString = '';
	var masksList = [];

	var buildMask = (function() {
		var prevType = '';
		return function(path) {
			if(!path) {
				return;
			}
			var groupContainerNode = node.createNode('group', clipName + naming.GROUP_NAME);
			var clipPath = node.createNode('clip-path', clipName);
			var groupNode = node.createNode('group', clipName + naming.GROUP_NAME + naming.GROUP_NAME);
			node.nestChild(groupContainerNode, clipPath);
			node.addAttribute(clipPath,'android:pathData', path);
			if (currentMaskData.type === 'i') {
				if(masksList.length) {
					// We can add intersecting masks as siblings instead of nesting one inside the other
					if (prevType === 'i') {
						var currentContainer = masksList[masksList.length -1].container;
						var index = node.getChildren(currentContainer).length - 1;
						node.nestChildAt(currentContainer, clipPath, index);
						groupContainerNode = currentContainer;
					} else {
						var i, len = masksList.length;
						for(i = 0; i < len; i += 1) {
							node.nestChild(groupContainerNode, masksList[i].container);
						}
					}
					
				} else {
					node.nestChild(groupContainerNode, groupNode);
				}
				masksList.length = 0;
			} else if (currentMaskData.type === 'a') {
				node.nestChild(groupContainerNode, groupNode);
			}
			masksList.push({
				container: groupContainerNode
			})

			animatedProp = null;
			nestCount = 0;
			clipPathString = '';
			prevType = currentMaskData.type;
		}
	}())

	function buildPreviousMaskGroup(name){
		if(!currentMaskData.type){
			return;
		}
		if(!containerGroup){
			containerGroup = node.createNode('group', name + naming.GROUP_NAME);
		}
		var paths = currentMaskData.currentPaths;
		var i, len = paths.length, j, jLen;
		var currentClipPathString = '';
		var animatedProp, prevNode, maskNode;
		clipName = name + naming.CLIP_NAME + '_' + maskCount;
		for (i = 0; i < len; i+= 1) {
			if (paths[i].type === 'i') {
				if (paths[i].pt.a === 1) {
					animatedProp = property.createAnimatedPathData(clipName, paths[i].pt.k, null, clipPathString, state.timeOffset);
					targets.addTarget(animatedProp);
					clipPathString += ' ' + createPathData(paths[i].pt.k[0].s[0], null);
				} else {
					clipPathString += ' ' + createPathData(paths[i].pt.k, null);
				}
			} else if (paths[i].type === 'a') {
				if (paths[i].pt.a === 1) {
					animatedProp = property.createAnimatedPathData(clipName, paths[i].pt.k, null, clipPathString, state.timeOffset);
					targets.addTarget(animatedProp);
					clipPathString += ' ' + createPathData(paths[i].pt.k[0].s[0], null);
				} else {
					currentClipPathString = createPathData(paths[i].pt.k, null);
					if(animatedProp) {
						var aaptAttr = node.getChild(animatedProp,'aapt:attr');
						var setProp = node.getChild(aaptAttr,'set');
						var setChildren = node.getChildren(setProp);
						jLen = setChildren.length;
						var objectAnimator, value;
						for(j = 0; j < jLen; j += 1) {
							value = node.getAttribute(setChildren[j],'android:valueFrom');
							if(value) { 
								node.addAttribute(setChildren[j],'android:valueFrom', value + currentClipPathString);
								value = node.getAttribute(setChildren[j],'android:valueTo');
								node.addAttribute(setChildren[j],'android:valueTo', value + currentClipPathString);
							}
						}
					}
					clipPathString += ' ' + currentClipPathString;
				}
			}
		}
		buildMask(clipPathString);
		currentMaskData.type = '';
		currentMaskData.currentPaths.length = 0;
		hasAnimatedProp = false;
		maskCount += 1;
	}

	function getMasks(name) {
		var masksProperties = state.layerData.masksProperties;
		if(masksProperties) {
			var i, len = masksProperties.length, maskProp;
			for (i = 0; i < len; i += 1) {
				maskProp = masksProperties[i];
				if (!maskProp.inv) {
					if (maskProp.mode === 'a') {
						if(currentMaskData.type !== 'a' && currentMaskData.type !== '' || (maskProp.pt.a === 1 && hasAnimatedProp)){
							buildPreviousMaskGroup(name);
						}
						currentMaskData.type = 'a';
						if (maskProp.pt.a === 1) {
							hasAnimatedProp = true;
						}
						currentMaskData.currentPaths.push({pt:maskProp.pt, type:'a'});
					} else if (maskProp.mode === 'i') {
						if(currentMaskData.type !== ''){
							buildPreviousMaskGroup(name);
						}
						currentMaskData.type = 'i';
						currentMaskData.currentPaths.push({pt:maskProp.pt, type:'i'});
					}
				}
			}
			buildPreviousMaskGroup(name);
			if(masksList.length) {
				len = masksList.length;
				for (i = 0; i < len; i += 1) {
					// node.nestChild(containerGroup, masksList[i].clip);
					// node.nestChild(containerGroup, masksList[i].group);
					node.nestChild(containerGroup, masksList[i].container);
				}
			}
		}
		return containerGroup;
	}

	return {
		getMasks: getMasks
	}
}

module.exports = masker;