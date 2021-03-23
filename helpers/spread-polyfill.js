function mergeObjects() {
	let targetObject = {};

	for (let i = 0; i < arguments.length; i++) {
		let sourceObject = arguments[i];

		for (let key in sourceObject) {
			if (Object.prototype.hasOwnProperty.call(sourceObject, key)) {
				targetObject[key] = sourceObject[key];
			}
		}
	}

	return targetObject;
}

const _spread = Object.assign || mergeObjects;
export default _spread;