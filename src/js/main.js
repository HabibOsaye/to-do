import TEMP from './temp'
import fillerText from './utils/fillerText'
import { select, selectAll } from './utils/select'
import { bindAll, unbindAll } from './utils/bind'
import { v4 as uuidv4 } from 'uuid'
import { format, isToday, isYesterday, isThisWeek } from 'date-fns'
import '../styles/main.scss'

const LOCAL_STORAGE_KEY = '__TODO_APP__'
const DATA = LOCAL_STORAGE_KEY + 'DATA'
let __data = {}

const init = () => {
	const App = select(true, '.App')
	const taskForm = select(App, 'form')
	const taskFormInput = select(App, '[data-task-input]')
	const toDoList = select(App, '[data-task-tab="toDo"] [data-task-list]')
	const doneList = select(App, '[data-task-tab="done"] [data-task-list]')
	const taskContainers = selectAll(App, '[data-task-tab]')
	// const listContainers = selectAll(App, '[data-task-list]')
	const dragImage = select(true, '.task-item-drag-image')

	document.addEventListener('keyup', (e) => {
		// Actuate click on checkboxes
		e.stopPropagation()
		const t = e.target
		if (e.code === 'Enter' && t.matches('[type="checkbox"]')) t.click()
	})

	document.addEventListener('click', (e) => {
		// Hide open menus
		const t = e.target
		if (!t.matches('[data-option="show-menu"]')) {
			selectAll(true, '.menu__list.show').forEach((n) => n.classList.remove('show'))
		}
	})

	const taskElementListeners = [
		{ type: 'dragstart', listener: handleDragStart },
		{ type: 'drag', listener: handleDrag },
		{ type: 'dragend', listener: handleDragEnd },
	]

	taskForm.addEventListener('submit', function (e) {
		e.preventDefault()
		// let content = taskFormInput.value
		let content = taskFormInput.value === '' ? fillerText() : taskFormInput.value
		if (content.toString().trim() == '') return
		taskFormInput.value = ''

		const newTask = {
			id: uniqueId(),
			content,
			dateCreated: new Date(),
			completed: false,
		}
		__data.tasks.push(newTask)
		renderElement(newTask)
		updateListCount()
		saveState()
	})

	taskContainers.forEach((container) => {
		container.addEventListener('click', (e) => {
			// e.stopPropagation()
			const t = e.target
			const option = t.dataset.option
			const taskTab = container.dataset.taskTab
			const timeDuration = 250
			let task

			// Toggle tab view
			if (option === 'toggle-view') {
				container.classList.toggle('collapse')
				t.textContent = t.textContent === 'Hide' ? 'Show' : 'Hide'
				__data.config[taskTab].collapsed = !__data.config[taskTab].collapsed
				saveState()
			}

			//  Task menu
			if (option === 'show-menu') {
				const taskElement = t.closest('.task-item')
				selectAll(true, '.menu__list.show').forEach((n) => {
					if (n.closest('.task-item') === taskElement) return
					n.classList.remove('show')
				})
				select(taskElement, '.menu__list').classList.toggle('show')
			}

			// Edit task
			if (option === 'edit') {
			}

			// Complete task
			if (t.matches('[data-task-checkbox]')) {
				const taskElement = t.closest('.task-item')
				const taskId = taskElement.dataset.taskId

				task = findTask(taskId)
				if (task == null) return

				task.completed = t.checked
				taskElement.classList.toggle('completed', t.checked)

				moveTask(taskElement, t.checked)
				updateListCount()
				saveState()
			}

			// Delete task
			if (option === 'delete') {
				const taskElement = t.closest('.task-item')
				const taskId = taskElement.dataset.taskId
				const offsetHeight = taskElement.offsetHeight
				const nextSibling = taskElement.nextElementSibling

				task = findTask(taskId)
				if (task == null) return
				__data.tasks.splice(__data.tasks.indexOf(task), 1)

				// Animate exit
				taskElement.classList.add('anim-delete-exit')
				if (nextSibling && nextSibling.matches('.task-item')) {
					nextSibling.style = `margin-top: -${offsetHeight}px; transition-property: margin;`
				}

				setTimeout(() => {
					// Remove all listeners from taskElement
					unbindAll(taskElement, taskElementListeners)

					taskElement.remove()
					if (nextSibling) nextSibling.removeAttribute('style')

					saveState()
					updateListCount()
				}, timeDuration)
			}
		})
	})

	const renderElement = ({ id, content, dateCreated, completed }) => {
		const template = select(true, '#task-template')
		const taskElement = template.content.firstElementChild.cloneNode(true)

		taskElement.dataset.taskId = id
		select(taskElement, '.checkbox label').htmlFor = id
		select(taskElement, '[data-task-content]').textContent = content
		select(taskElement, '[data-task-date]').textContent = formatDate(dateCreated)
		const checkbox = select(taskElement, '[data-task-checkbox]')
		checkbox.id = id
		checkbox.checked = completed

		// Assign listeners to taskElement
		bindAll(taskElement, taskElementListeners)

		taskElement.classList.toggle('completed', completed)
		const list = completed ? doneList : toDoList
		list.prepend(taskElement)
	}

	const formatDate = (date) => {
		date = new Date(date).getTime()
		let dateStr = ''
		if (isToday(date)) return (dateStr = format(date, 'p', { weekStartsOn: 1 }))
		if (isYesterday(date)) return (dateStr = format(date, "'Yesterday at' p", { weekStartsOn: 1 }))
		if (isThisWeek(date)) return (dateStr = format(date, "iii 'at' p", { weekStartsOn: 1 }))
		if (dateStr === '') return (dateStr = format(date, 'P', { weekStartsOn: 1 }))
	}

	const loadData = () => {
		const localStorageData = JSON.parse(localStorage.getItem(DATA))
		if (localStorageData == null) return

		// Setup content
		__data = { ...localStorageData }
		__data.tasks.forEach(renderElement)

		taskContainers.forEach((container) => {
			const taskTab = container.dataset.taskTab
			const isCollapsed = __data.config[taskTab].collapsed
			const toggleViewButton = select(container, '[data-option="toggle-view"]')

			container.classList.toggle('collapse', isCollapsed)
			toggleViewButton.textContent = isCollapsed ? 'Show' : 'Hide'
		})
	}

	const saveState = () => {
		taskContainers.forEach((container) => {
			const taskTab = container.dataset.taskTab
			__data.config[taskTab].collapsed = container.classList.contains('collapse')
		})

		const taskElements = selectAll(App, '.task-item')

		for (let i = taskElements.length - 1; i >= 0; i--) {
			const id = taskElements[i].dataset.taskId
			const task = findTask(id)
			if (task) task.order = i
		}

		const sorted = __data.tasks.sort((a, b) => b.order - a.order)
		__data.tasks = sorted
		localStorage.setItem(DATA, JSON.stringify(__data))
	}

	const findTask = (id) => {
		return __data.tasks.find((task) => id === task.id)
	}

	const uniqueId = () => {
		return uuidv4()
	}

	function handleDragStart(e) {
		// console.log('dragstart')
		const t = e.target
		const taskList = t.closest('[data-task-list]')
		t.classList.add('dragging')

		// Hide menu
		select(t, '.menu__list').classList.remove('show')

		// dragImage
		e.dataTransfer.setDragImage(new Image(), 0, 0)
		const content = select(t, '[data-task-content]').textContent
		select(dragImage, '.drag-image__content').textContent = content

		// Marker
		const marker = document.createElement('span')
		marker.className = 'marker'
		taskList.insertBefore(marker, t)
	}

	function handleDrag(e) {
		// console.log('drag');
		placeDragImage(e.pageX, e.pageY)
	}

	function handleDragEnd(e) {
		// console.log('dragend')
		const t = e.target
		const taskId = t.dataset.taskId
		const checkbox = select(t, '[data-task-checkbox]')

		// taskElement & Marker placement
		const marker = select(App, '.marker')
		if (marker) {
			if (t.closest('[data-task-list]')) {
				const taskList = marker.closest('[data-task-list]')
				if (taskList.lastElementChild === marker) {
					taskList.append(t)
				} else {
					taskList.insertBefore(t, marker)
				}
				marker.remove()
			}
		}

		// Update completed state
		if (t.closest('[data-task-tab="toDo"]') && t.matches('.task-item.completed')) {
			const task = findTask(taskId)
			if (task == null) return
			checkbox.checked = false
			task.completed = false
			t.classList.remove('completed')
		} else if (t.closest('[data-task-tab="done"]') && t.matches('.task-item:not(.completed)')) {
			const task = findTask(taskId)
			if (task == null) return
			checkbox.checked = true
			task.completed = true
			t.classList.add('completed')
		}

		t.classList.remove('dragging')
		t.style.cursor = 'default'
		hideDragImage()
		updateListCount()
		saveState()
	}

	taskContainers.forEach((container) => {
		container.addEventListener('dragover', (e) => {
			// console.log('dragover')
			e.preventDefault()
			let t = e.target
			const taskElement = select(App, '.task-item.dragging')
			let taskList = t.closest('[data-task-list]')
			const marker = select(App, '.marker')

			if (container.classList.contains('collapse')) select(t, '.toggle-view').click()

			// taskElement & Marker placement
			if (marker) {
				if (t.closest('.task-item') && taskList) {
					t = e.target.closest('.task-item')
					const { top, height } = t.getBoundingClientRect()
					const { clientY: y } = e
					const offset = y - top - height / 2
					const isDragZone = offset > height * -0.35 && offset < 0

					if (isDragZone) {
						taskList.insertBefore(marker, t)
					} else if (offset >= height * 0.35 && t === taskList.lastElementChild) {
						taskList.append(marker)
					}
				} else if (taskList && taskList.childElementCount === 0) {
					taskList.append(marker, taskElement)
				}
			}
			updateListCount()
		})
	})

	const moveTask = (taskElement, boolean) => {
		const list = boolean ? doneList : toDoList
		list.prepend(taskElement)
	}

	const updateListCount = () => {
		taskContainers.forEach((container) => {
			const count = selectAll(container, '[data-task-list ] .task-item').length
			select(container, '[data-counter]').textContent = count
			select(container, '.state-message').classList.toggle('active', count === 0)
		})
		document.title = `To Do (${select(App, '[data-counter]').textContent})`
	}

	const placeDragImage = (x, y) => {
		if (x === 0 || y === 0) {
			hideDragImage()
			return
		}

		dragImage.style.left = `${x}px`
		dragImage.style.top = `${y}px`
		dragImage.style.transform = 'translate(-8px, -50%) scale(1) rotate(5deg)'
		dragImage.style.opacity = '1'
	}

	const hideDragImage = () => {
		dragImage.removeAttribute('style')
	}

	if (localStorage.getItem(DATA) != null) {
		loadData()
	} else {
		__data = { ...TEMP }
		__data.tasks.forEach(renderElement)
	}
	updateListCount()
}

document.addEventListener('DOMContentLoaded', init)
