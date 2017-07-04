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

 function getTagName(node) {
 	var keys = Object.keys(node);
 	return keys[0];
 }

 function nestChild(nodeElem, nested) {
 	var tagName = getTagName(nodeElem);
 	nodeElem[tagName].push(nested);
 }

module.exports = {
	createNode: createNode,
	createNodeWithAttributes: createNodeWithAttributes,
	addAttribute: addAttribute,
	getTagName: getTagName,
	nestChild: nestChild
}