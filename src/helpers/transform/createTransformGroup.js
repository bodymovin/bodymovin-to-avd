var node = require('../../node');
var property = require('../../property');
var targets = require('../../targets/targets');
var naming = require('../../naming');


function createTransformGroup(name, transform, timeOffset, _container) {
	var changed = false;
	var nodes =[];
	var currentName = name;
	var container;
	//var name = node.getAttribute(container, 'android:name');
	if(_container) {
		container = _container;
		nodes.push(container);
	}
	function addAttributeToContainer(key, value) {
		if(!container) {
			currentName = name + naming.TRANSFORM_NAME + '_' + + nodes.length;
			container = node.createNode('group', currentName);
			nodes.push(container);
		}
		node.addAttribute(container,key, value);
		return container;
	}
	if(transform.p.a === 0 && transform.a.a === 0) {
			if(transform.p.k[0] - transform.a.k[0] !== 0) {
				addAttributeToContainer('android:translateX', transform.p.k[0] - transform.a.k[0]);
				//node.addAttribute(container,'android:translateX', transform.p.k[0] - transform.a.k[0]);
			}
			if(transform.p.k[1] - transform.a.k[1] !== 0) {
				addAttributeToContainer('android:translateY', transform.p.k[1] - transform.a.k[1]);
				//node.addAttribute(container,'android:translateY', transform.p.k[1] - transform.a.k[1]);
			}
			if(transform.r.a === 1 || transform.r.k !== 0 || transform.s.a === 1 || transform.s.k[0] !== 100 || transform.s.k[1] !== 100) {
				if(transform.a.k[0] !== 0) {
					addAttributeToContainer('android:pivotX', transform.a.k[0]);
					//node.addAttribute(container,'android:pivotX', transform.a.k[0]);
				}
				if(transform.a.k[1] !== 0) {
					addAttributeToContainer('android:pivotY', transform.a.k[1]);
					//node.addAttribute(container,'android:pivotY', transform.a.k[1]);
				}
				if(transform.r.a === 1 || transform.r.k !== 0) {
					if(transform.r.a === 0) {
						if(transform.r.k !== 0) {
							addAttributeToContainer('android:rotation', transform.r.k);
							//node.addAttribute(container,'android:rotation', transform.r.k);
						}
					} else {
						addAttributeToContainer('android:rotation', transform.r.k[0].s);
						//node.addAttribute(container,'android:rotation', transform.r.k[0].s);
						var animatedProperty = property.createAnimatedProperty(currentName, 'rotation', transform.r.k, timeOffset);
						targets.addTarget(animatedProperty);
					}
				}
				if(transform.s.a === 1 || transform.s.k[0] !== 100 || transform.s.k[1] !== 100) {
					if(transform.s.a === 0) {
						if(transform.s.k[0] !== 100) {
							//node.addAttribute(container,'android:scaleX', transform.s.k[0]/100);
							addAttributeToContainer('android:scaleX', transform.s.k[0]/100);
						}
						if(transform.s.k[1] !== 100) {
							//node.addAttribute(container,'android:scaleY', transform.s.k[1]/100);
							addAttributeToContainer('android:scaleY', transform.s.k[1]/100);
						}
					}else {
						//node.addAttribute(container,'android:scaleX', transform.s.k[0].s[0]/100);
						//node.addAttribute(container,'android:scaleY', transform.s.k[0].s[1]/100);
						addAttributeToContainer('android:scaleX', transform.s.k[0].s[0]/100);
						addAttributeToContainer('android:scaleY', transform.s.k[0].s[1]/100);
						var animatedProperty = property.createAnimatedProperty(currentName, 'scale', transform.s.k, timeOffset);
						targets.addTarget(animatedProperty);
					}
				}
			}
	} else {
		if(transform.a.a !== 0 || transform.a.k[0] !== 0 || transform.a.k[1] !== 0) {
			if (transform.a.a === 1) {
				var animatedProperty = property.createAnimatedProperty(currentName, 'anchor', transform.a.k, timeOffset);
				targets.addTarget(animatedProperty);
				//node.addAttribute(container,'android:translateX', -transform.a.k[0].s[0]);
				//node.addAttribute(container,'android:translateY', -transform.a.k[0].s[1]);
				addAttributeToContainer('android:translateX', -transform.a.k[0].s[0]);
				addAttributeToContainer('android:translateY', -transform.a.k[0].s[1]);
			} else if(transform.a.k[0] !== 0 || transform.a.k[1] !== 0) {
				if(transform.a.k[0] !== 0) {
					//node.addAttribute(container,'android:translateX', -transform.a.k[0]);
					addAttributeToContainer('android:translateX', -transform.a.k[0]);
				}
				if(transform.a.k[1] !== 0) {
					//node.addAttribute(container,'android:translateY', -transform.a.k[1]);
					addAttributeToContainer('android:translateY', -transform.a.k[1]);
				}
			}
			//var anchorGroupName = name + '_pivot';
			container = null;
			//var anchorContainer = node.createNode('group', anchorGroupName);
			//node.nestChild(anchorContainer, container);
			//container = anchorContainer;
			//name = anchorGroupName;
		}
		if(transform.p){
			if(transform.p.a === 0) {
				if(transform.p.k[0] !== 0) {
					//node.addAttribute(container,'android:translateX', transform.p.k[0]);
					addAttributeToContainer('android:translateX', transform.p.k[0]);
				}
				if(transform.p.k[1] !== 0) {
					//node.addAttribute(container,'android:translateY', transform.p.k[1]);
					addAttributeToContainer('android:translateY', transform.p.k[1]);
				}
			} else {
				//node.addAttribute(container,'android:translateX', transform.p.k[0].s[0]);
				//node.addAttribute(container,'android:translateY', transform.p.k[0].s[1]);
				addAttributeToContainer('android:translateX', transform.p.k[0].s[0]);
				addAttributeToContainer('android:translateY', transform.p.k[0].s[1]);
				var animatedProperty = property.createAnimatedProperty(currentName, 'position', transform.p.k, timeOffset);
				targets.addTarget(animatedProperty);
			}
		}
		if(transform.s.a === 0) {
			if(transform.s.k[0] !== 100) {
				//node.addAttribute(container,'android:scaleX', transform.s.k[0]/100);
				addAttributeToContainer('android:scaleX', transform.s.k[0]/100);
			}
			if(transform.s.k[1] !== 100) {
				//node.addAttribute(container,'android:scaleY', transform.s.k[1]/100);
				addAttributeToContainer('android:scaleY', transform.s.k[1]/100);
			}
		}else {
			//node.addAttribute(container,'android:scaleX', transform.s.k[0].s[0]/100);
			//node.addAttribute(container,'android:scaleY', transform.s.k[0].s[1]/100);
			addAttributeToContainer('android:scaleX', transform.s.k[0].s[0]/100);
			addAttributeToContainer('android:scaleY', transform.s.k[0].s[1]/100);
			var animatedProperty = property.createAnimatedProperty(currentName, 'scale', transform.s.k, timeOffset);
			targets.addTarget(animatedProperty);
		}
		if(transform.r.a === 0) {
			if(transform.r.k !== 0) {
				//node.addAttribute(container,'android:rotation', transform.r.k);
				addAttributeToContainer('android:rotation', transform.r.k);
			}
		} else {
			//node.addAttribute(container,'android:rotation', transform.r.k[0].s);
			addAttributeToContainer('android:rotation', transform.r.k[0].s);
			var animatedProperty = property.createAnimatedProperty(currentName, 'rotation', transform.r.k, timeOffset);
			targets.addTarget(animatedProperty);
		}
	}

	
	return nodes;
}

module.exports = createTransformGroup;