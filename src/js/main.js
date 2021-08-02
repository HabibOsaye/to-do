// import getFillerText from './utils/getFillerText.js'
import * as Bind from './utils/bind.js'
const LOCAL_STORAGE_KEY = '__TODO_APP__'
let listData = []
const temp = [
	{
		id: 1627919959233,
		content: 'Get an overview of React Js',
		completed: true,
		order: 5,
	},
	{
		id: 1627927102427,
		content: 'Get laundry done',
		completed: true,
		order: 4,
	},
	{
		id: 1627919016236,
		content: 'Take a 30min walk across town',
		completed: false,
		order: 3,
	},
	{
		id: 1627919152336,
		content: 'Pick up chilies on your way back from town',
		completed: false,
		order: 2,
	},
	{
		id: 1627926978591,
		content: 'Catch up with French lessons',
		completed: false,
		order: 1,
	},
	{
		id: 1627919959240,
		content: 'Get a new pc work station',
		completed: false,
		order: 0,
	},
]

const initialize = () => {
	const App = document.body.querySelector('.App')
	const taskForm = App.querySelector('form')
	const taskFormInput = App.querySelector('[data-task-input]')
	const toDoList = App.querySelector('[data-task="to-do"] [data-task-list]')
	const doneList = App.querySelector('[data-task="done"] [data-task-list]')
	const listContainers = [...App.querySelectorAll('[data-task-list]')]
	const dragImage = document.body.querySelector('.task-item-drag-image')

	document.addEventListener('keyup', (e) => {
		e.stopPropagation()
		const t = e.target
		// Actuate click on checkbox
		if (e.code === 'Enter' && t.matches('[type="checkbox"]')) t.click()
	})

	const taskElementEvents = [
		{ type: 'click', listener: handleClick },
		{ type: 'dragstart', listener: handleDragStart },
		{ type: 'drag', listener: handleDrag },
		{ type: 'dragend', listener: handleDragEnd },
	]

	taskForm.addEventListener('submit', function (e) {
		e.preventDefault()
		let content = taskFormInput.value
		// let content = taskFormInput.value === '' ? getFillerText() : taskFormInput.value
		if (content.toString().trim() == '') return
		taskFormInput.value = ''

		const newTask = {
			id: uniqueId(),
			content,
			completed: false,
		}
		listData.push(newTask)
		renderElement(newTask)
		updateListCount()
		saveState()
	})

	const renderElement = ({ id, content, completed }) => {
		const template = document.querySelector('#task-template')
		const taskElement = template.content.firstElementChild.cloneNode(true)

		taskElement.dataset.taskId = id
		taskElement.querySelector('.checkbox label').htmlFor = id
		taskElement.querySelector('[data-task-content]').textContent = content
		const checkbox = taskElement.querySelector('[data-task-checkbox]')
		checkbox.id = id
		checkbox.checked = completed

		// Assign listeners to taskElement
		Bind.bindAll(taskElement, taskElementEvents)

		taskElement.classList.toggle('completed', completed)
		const list = completed ? doneList : toDoList
		list.prepend(taskElement)
	}

	const loadData = () => {
		const localStorageData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY))
		if (localStorageData == null) return
		listData = [...localStorageData]
		listData.forEach(renderElement)
	}

	const saveState = () => {
		const taskElements = [...App.querySelectorAll('.task-item')]

		for (let i = taskElements.length - 1; i >= 0; i--) {
			const id = parseInt(taskElements[i].dataset.taskId)
			const task = findTask(id)
			if (task) task.order = i
			console.log(task)
		}

		listData.sort((a, b) => b.order - a.order)

		const listDataString = JSON.stringify(listData)
		localStorage.setItem(LOCAL_STORAGE_KEY, listDataString)
	}

	const findTask = (id) => {
		return listData.find((task) => id === task.id)
	}

	const uniqueId = () => {
		return new Date().valueOf()
	}

	function handleClick(e) {
		e.stopPropagation()
		const t = e.target
		const taskElement = e.currentTarget
		const taskId = parseInt(taskElement.dataset.taskId)
		const deleteButton = taskElement.querySelector('[data-task-delete]')
		const timeDuration = 250
		let task

		// Complete
		if (t.matches('[data-task-checkbox]')) {
			task = findTask(taskId)
			if (task == null) return

			task.completed = t.checked
			taskElement.classList.toggle('completed', t.checked)

			moveTask(taskElement, t.checked)
			updateListCount()
			saveState()
		}

		// Delete
		if (t === deleteButton || t.closest('[data-task-delete]')) {
			const offsetHeight = taskElement.offsetHeight
			const nextSibling = taskElement.nextElementSibling

			task = findTask(taskId)
			if (task == null) return
			listData.splice(listData.indexOf(task), 1)

			// Animate exit
			taskElement.classList.add('anim-delete-exit')
			if (nextSibling && nextSibling.matches('.task-item')) {
				nextSibling.style = `margin-top: -${offsetHeight}px; transition-property: margin;`
			}

			setTimeout(() => {
				taskElement.remove()
				if (nextSibling) nextSibling.removeAttribute('style')

				// Remove all listeners from taskElement
				Bind.unbindAll(taskElement, taskElementEvents)
				saveState()
				updateListCount()
			}, timeDuration)
		}
	}

	function handleDragStart(e) {
		// console.log('dragstart')
		const t = e.target
		t.classList.add('dragging')

		e.dataTransfer.setDragImage(new Image(), 0, 0)
		const content = t.querySelector('[data-task-content]').textContent
		dragImage.querySelector('.content').textContent = content
	}

	function handleDrag(e) {
		// console.log('drag');
		placeDragImage(e.pageX, e.pageY)
	}

	function handleDragEnd(e) {
		// console.log('dragend')
		const t = e.target
		const taskId = parseInt(t.dataset.taskId)
		const checkbox = t.querySelector('[data-task-checkbox]')

		const dragOver = [...App.querySelectorAll('.drag-over')]
		dragOver.forEach((n) => n.classList.remove('drag-over'))

		// Switch state according to task group
		if (t.closest('[data-task="to-do"]') && t.matches('.task-item.completed')) {
			const task = findTask(taskId)
			if (task == null) return
			checkbox.checked = false
			task.completed = false
			t.classList.remove('completed')
		} else if (
			t.closest('[data-task="done"]') &&
			t.matches('.task-item:not(.completed)')
		) {
			const task = findTask(taskId)
			if (task == null) return
			checkbox.checked = true
			task.completed = true
			t.classList.add('completed')
		}

		t.classList.remove('dragging')
		hideDragImage()
		updateListCount()
		saveState()
	}

	listContainers.forEach((listContainer) => {
		listContainer.addEventListener('dragover', (e) => {
			// console.log('dragover')
			e.preventDefault()
			const t = e.target

			const activeDragElement = App.querySelector('.task-item.dragging')
			const afterElement = getDragAfterElement(listContainer, e.clientY)

			if (afterElement == null) {
				listContainer.appendChild(activeDragElement)
			} else {
				afterElement.classList.add('drag-over')
				listContainer.insertBefore(activeDragElement, afterElement)
			}
			updateListCount()
		})
	})

	const getDragAfterElement = (container, y) => {
		const siblings = [
			...container.querySelectorAll('.task-item:not(.dragging)'),
		]
		return siblings.reduce(
			(closest, child) => {
				const { top, height } = child.getBoundingClientRect()
				const offset = y - top - height / 2

				if (offset < 0 && offset > closest.offset) {
					return {
						offset: offset,
						element: child,
					}
				} else {
					return closest
				}
			},
			{ offset: Number.NEGATIVE_INFINITY, element: null }
		).element
	}

	const moveTask = (taskElement, boolean) => {
		// const isDragging = taskElement.matches('.task-item.dragging')

		if (boolean) {
			// if (taskElement.closest('[data-task="done"]') && isDragging) {
			// 	// console.log('converted @doneList')
			// } else {
			doneList.prepend(taskElement)
			// }
		} else {
			// if (taskElement.closest('[data-task="to-do"]') && isDragging) {
			// 	// console.log('converted @toDoList')
			// } else {
			toDoList.prepend(taskElement)
			// }
		}
	}

	const updateListCount = () => {
		const containers = [...App.querySelectorAll('[data-task]')]

		containers.forEach((container) => {
			const count =
				container.querySelector('[data-task-list]').childElementCount - 1

			container.querySelector('[data-counter]').textContent = `${count}`
			container
				.querySelector('.state-message')
				.classList.toggle('active', count === 0)
		})

		document.title = `To Do (${
			document.querySelector('[data-counter]').textContent
		})`
	}

	const placeDragImage = (x, y) => {
		if (x === 0 || y === 0) {
			hideDragImage()
			return
		}

		dragImage.style.opacity = '1'
		dragImage.style.transform = 'translate(0%, -50%) scale(1)'
		dragImage.style.left = `${x}px`
		dragImage.style.top = `${y}px`
	}

	const hideDragImage = () => {
		dragImage.removeAttribute('style')
	}

	if (localStorage.getItem(LOCAL_STORAGE_KEY) == null) {
		temp.forEach(renderElement)
		listData = [...temp]
	}

	loadData()
	updateListCount()
}

document.addEventListener('DOMContentLoaded', initialize)
