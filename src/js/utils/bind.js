function bind(target, { type, listener, options }) {
	target.addEventListener(type, listener, options)

	return function unbind() {
		target.removeEventListener(type, listener, options)
	}
}

function bindAll(target, events) {
	events.forEach((event) => {
		const { type, listener, options } = event
		target.addEventListener(type, listener, options)
	})
}

function unbindAll(target, events) {
	events.forEach((event) => {
		const { type, listener, options } = event
		target.removeEventListener(type, listener, options)
	})
}
export { bind, bindAll, unbindAll }
