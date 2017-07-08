 function createNodeWithAttributes(tagName, attributes, name) {
 	var node = createNode(tagName, name);
 	var i, len = attributes.length;
 	for(i = 0; i < len; i += 1) {
 		addAttribute(node, attributes[i].key, attributes[i].value);
 	}
 	return node;
 }

 function createNode(tagName, name) {
 	var node = {
 		[tagName]:[]
 	};
 	if(name) {
 		node[tagName][0] = {_attr:{'android:name': name}}
 	}
 	return node; 
 }

 function addAttribute(object, key, value) {
 	tagName = getTagName(object);
 	var children = object[tagName];
 	var i = 0, len = children.length;
 	var attrsContainer;
 	while(i < len) {
 		if(children[i]._attr) {
 			attrsContainer = children[i];
 			break;
 		}		
 		i += 1;
 	}
 	if (!attrsContainer) {
 		attrsContainer = {_attr:{}}
 	}
 	attrsContainer._attr[key] = value;
 	children[i] = attrsContainer;
 }

 function getTagName(nodeElem) {
 	var keys = Object.keys(nodeElem);
 	return keys[0];
 }

 function getAttribute(nodeElem, key) {
 	var tagName = getTagName(nodeElem);
 	var children = nodeElem[tagName];
 	var i =0, len = children.length;
 	while(i < len) {
 		if(children[i]._attr && children[i]._attr[key]) {
 			return children[i]._attr[key];
 		}
 		i += 1;
 	}
 	return '';
 }

 function nestChild(nodeElem, nested) {
 	var tagName = getTagName(nodeElem);
 	nodeElem[tagName].push(nested);
 }

 function cloneNode(node, targets, suffix) {
 	var cloningNode = JSON.parse(JSON.stringify(node));
 	renameNode(cloningNode, targets, suffix);
 	return cloningNode;
 }

 function renameNode(nodeElem, targets, suffix) {
 	var tagName = getTagName(nodeElem);
 	var children = nodeElem[tagName];
 	if(children) {
	 	var i, len = children.length;
	 	for( i = 0; i < len; i += 1) {
	 		renameNode(children[i], targets, suffix);
	 	}
 	}
 	var androidName = getAttribute(nodeElem, 'android:name');
 	if(androidName) {
 		duplicateTargets(targets, androidName, androidName + suffix);
 		addAttribute(nodeElem, 'android:name', androidName + suffix);
 	}
 }

 function duplicateTargets(targets, name, newName) {
 	var i, len = targets.length, newTarget;
 	for( i = 0 ; i < len; i += 1) {
 		if(targets[i].target[0]._attr['android:name'] === name) {
 			newTarget = JSON.parse(JSON.stringify(targets[i]));
 			newTarget.target[0]._attr['android:name'] = newName;
 			targets.push(newTarget);
 		}
 	}
 }

 module.exports = {
 	createNode: createNode,
 	createNodeWithAttributes: createNodeWithAttributes,
 	addAttribute: addAttribute,
 	getTagName: getTagName,
 	getAttribute: getAttribute,
 	nestChild: nestChild,
 	cloneNode: cloneNode
 }