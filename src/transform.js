var node = require('./node');
var property = require('./property');
var targets = require('./targets/targets');

function applyTransformToContainer(container, transform, timeOffset, frameRate) {
	var name = node.getAttribute(container, 'android:name');
	if(transform.p.a === 0 && transform.a.a === 0) {
			if(transform.p.k[0] - transform.a.k[0] !== 0) {
				node.addAttribute(container,'android:translateX', transform.p.k[0] - transform.a.k[0]);
			}
			if(transform.p.k[1] - transform.a.k[1] !== 0) {
				node.addAttribute(container,'android:translateY', transform.p.k[1] - transform.a.k[1]);
			}
			if(transform.r.a === 1 || transform.r.k !== 0 || transform.s.a === 1 || transform.s.k[0] !== 100 || transform.s.k[1] !== 100) {
				if(transform.a.k[0] !== 0) {
					node.addAttribute(container,'android:pivotX', transform.a.k[0]);
				}
				if(transform.a.k[1] !== 0) {
					node.addAttribute(container,'android:pivotY', transform.a.k[1]);
				}
				if(transform.r.a === 1 || transform.r.k !== 0) {
					if(transform.r.a === 0) {
						if(transform.r.k !== 0) {
							node.addAttribute(container,'android:rotation', transform.r.k);
						}
					} else {
						node.addAttribute(container,'android:rotation', transform.r.k[0].s);
						var animatedProperty = property.createAnimatedProperty(name, 'rotation', transform.r.k, timeOffset, frameRate);
						targets.addTarget(animatedProperty);
					}
				}
				if(transform.s.a === 1 || transform.s.k[0] !== 100 || transform.s.k[1] !== 100) {
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
						var animatedProperty = property.createAnimatedProperty(name, 'scale', transform.s.k, timeOffset, frameRate);
						targets.addTarget(animatedProperty);
					}
				}
			}
	} else {
		if(transform.a.a !== 0 || transform.a.k[0] !== 0 || transform.a.k[1] !== 0) {
			if (transform.a.a === 1) {
				var animatedProperty = property.createAnimatedProperty(name, 'anchor', transform.a.k, timeOffset, frameRate);
				targets.addTarget(animatedProperty);
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
			var anchorGroupName = name + '_pivot';
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
				var animatedProperty = property.createAnimatedProperty(name, 'position', transform.p.k, timeOffset, frameRate);
				targets.addTarget(animatedProperty);
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
			var animatedProperty = property.createAnimatedProperty(name, 'scale', transform.s.k, timeOffset, frameRate);
			targets.addTarget(animatedProperty);
		}
		if(transform.r.a === 0) {
			if(transform.r.k !== 0) {
				node.addAttribute(container,'android:rotation', transform.r.k);
			}
		} else {
			node.addAttribute(container,'android:rotation', transform.r.k[0].s);
			var animatedProperty = property.createAnimatedProperty(name, 'rotation', transform.r.k, timeOffset, frameRate);
			targets.addTarget(animatedProperty);
		}
	}

	
	return container;
}

module.exports = applyTransformToContainer;