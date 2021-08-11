function select(target, selector) {
	target = target === true ? document.body : target
	return target.querySelector(selector)
}

function selectAll(target, selector) {
	target = target === true ? document.body : target
	return Array.from(target.querySelectorAll(selector))
}

export { select, selectAll }
