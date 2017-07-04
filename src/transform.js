var node = require('./node');
var property = require('./property');

function applyTransformToContainer(container, transform, targets, name) {

	if(transform.a.a !== 0 || transform.a.k[0] !== 0 || transform.a.k[1] !== 0) {
		if (transform.a.a === 1) {
			var animatedProperty = property.createAnimatedProperty(name, 'anchor', transform.a.k);
			targets.push(animatedProperty);
			node.addAttribute(container,'android:translateX', -transform.a.k[0].s[0]);
			node.addAttribute(container,'android:translateY', -transform.a.k[0].s[1]);
		} else if(transform.a.k[0] !== 0 || transform.a.k[1] !== 0) {
			if(transform.a.k[0] !== 0) {
				node.addAttribute(container,'android:translateX', -transform.a.k[0]);
			}
			if(transform.a.k[1] !== 0) {
				node.addAttribute(container,'android:translateY', -transform.a.k[1]);
			}
		}
		var anchorGroupName = name + 'pivot_';
		var anchorContainer = node.createNode('group', anchorGroupName);
		node.nestChild(anchorContainer, container);
		container = anchorContainer;
		name = anchorGroupName;
	}
	if(transform.p){
		if(transform.p.a === 0) {
			if(transform.p.k[0] !== 0) {
				node.addAttribute(container,'android:translateX', transform.p.k[0]);
			}
			if(transform.p.k[1] !== 0) {
				node.addAttribute(container,'android:translateY', transform.p.k[1]);
			}
		} else {
			node.addAttribute(container,'android:translateX', transform.p.k[0].s[0]);
			node.addAttribute(container,'android:translateY', transform.p.k[0].s[1]);
			var animatedProperty = property.createAnimatedProperty(name, 'position', transform.p.k);
			targets.push(animatedProperty);
		}
	}
	if(transform.s.a === 0) {
		if(transform.s.k[0] !== 100) {
			node.addAttribute(container,'android:scaleX', transform.s.k[0]/100);
		}
		if(transform.s.k[1] !== 100) {
			node.addAttribute(container,'android:scaleY', transform.s.k[1]/100);
		}
	}else {
		node.addAttribute(container,'android:scaleX', transform.s.k[0].s[0]/100);
		node.addAttribute(container,'android:scaleY', transform.s.k[0].s[1]/100);
		var animatedProperty = property.createAnimatedProperty(name, 'scale', transform.s.k);
		targets.push(animatedProperty);
	}
	if(transform.r.a === 0) {
		if(transform.r.k !== 0) {
			node.addAttribute(container,'android:rotation', transform.r.k);
		}
	} else {
		node.addAttribute(container,'android:rotation', transform.r.k[0].s);
		var animatedProperty = property.createAnimatedProperty(name, 'rotation', transform.r.k);
		targets.push(animatedProperty);
	}
	return container;
}

module.exports = applyTransformToContainer;