import { select, selectAll } from './utils/select'
import { bindAll, unbindAll } from './utils/bind'
import fillerText from './utils/fillerText'
import { format, subDays, isToday, isYesterday, isThisWeek } from 'date-fns'
import '../styles/main.scss'

const LOCAL_STORAGE_KEY = '__TODO_APP__'
let listData = []
const temp = [
	{
		id: 1627919959233,
		content: 'Get an overview of React Js',
		dateCreated: subDays(new Date(), 10),
		completed: true,
		order: 6,
	},
	{
		id: 1627927102427,
		content: 'Get laundry done',
		dateCreated: subDays(new Date(), 4),
		completed: true,
		order: 5,
	},
	{
		id: 1627919016236,
		content: 'Take a 30min walk across town',
		dateCreated: subDays(new Date('2021-08-09T15:19:16.258Z'), -2),
		completed: false,
		order: 4,
	},
	{
		id: 1627919152336,
		content: 'Pick up chilies on your way back from town',
		completed: false,
		dateCreated: subDays(new Date('2021-08-09T16:37:02.258Z'), -2),
		order: 3,
	},
	{
		id: 1627926978591,
		content: 'Catch up with French lessons',
		dateCreated: subDays(new Date('2021-08-09T08:25:02.258Z'), -1),
		completed: false,
		order: 2,
	},
	{
		id: 1627919959240,
		content: 'Get a new pc work station',
		dateCreated: subDays(new Date('2021-08-09T12:33:02.258Z'), 1),
		completed: false,
		order: 1,
	},
	{
		id: 1627919950240,
		content: 'Checkout Suicide Squad 2',
		dateCreated: new Date(),
		completed: false,
		order: 0,
	},
]

const init = () => {
	const App = select(true, '.App')
	const taskForm = select(App, 'form')
	const taskFormInput = select(App, '[data-task-input]')
	const toDoList = select(App, '[data-task="to-do"] [data-task-list]')
	const doneList = select(App, '[data-task="done"] [data-task-list]')
	const listContainers = selectAll(App, '[data-task-list]')
	const dragImage = select(true, '.task-item-drag-image')

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
		// let content = taskFormInput.value
		let content =
			taskFormInput.value === '' ? fillerText() : taskFormInput.value
		if (content.toString().trim() == '') return
		taskFormInput.value = ''

		const newTask = {
			id: uniqueId(),
			content,
			dateCreated: new Date(),
			completed: false,
		}
		listData.push(newTask)
		renderElement(newTask)
		updateListCount()
		saveState()
	})

	const renderElement = ({ id, content, dateCreated, completed }) => {
		const template = select(true, '#task-template')
		const taskElement = template.content.firstElementChild.cloneNode(true)

		taskElement.dataset.taskId = id
		select(taskElement, '.checkbox label').htmlFor = id
		select(taskElement, '[data-task-content]').textContent = content
		select(taskElement, '[data-task-date]').textContent =
			formatDate(dateCreated)
		const checkbox = select(taskElement, '[data-task-checkbox]')
		checkbox.id = id
		checkbox.checked = completed

		// Assign listeners to taskElement
		bindAll(taskElement, taskElementEvents)

		taskElement.classList.toggle('completed', completed)
		const list = completed ? doneList : toDoList
		list.prepend(taskElement)
	}

	const formatDate = (date) => {
		date = new Date(date).getTime()
		let dateStr = ''
		if (isToday(date)) return (dateStr = format(date, 'p'))
		if (isYesterday(date)) return (dateStr = format(date, "'Yesterday at' p"))
		if (isThisWeek(date)) return (dateStr = format(date, "iii 'at' p"))
		if (dateStr === '') return (dateStr = format(date, 'P'))
	}

	const loadData = () => {
		const localStorageData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY))
		if (localStorageData == null) return
		listData = [...localStorageData]
		listData.forEach(renderElement)
	}

	const saveState = () => {
		const taskElements = selectAll(App, '.task-item')

		for (let i = taskElements.length - 1; i >= 0; i--) {
			const id = parseInt(taskElements[i].dataset.taskId)
			const task = findTask(id)
			if (task) task.order = i
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
		const deleteButton = select(taskElement, '[data-task-delete]')
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
				unbindAll(taskElement, taskElementEvents)
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
		const content = select(t, '[data-task-content]').textContent
		select(dragImage, '.drag-image__content').textContent = content
	}

	function handleDrag(e) {
		// console.log('drag');
		placeDragImage(e.pageX, e.pageY)
	}

	function handleDragEnd(e) {
		// console.log('dragend')
		const t = e.target
		const taskId = parseInt(t.dataset.taskId)
		const checkbox = select(t, '[data-task-checkbox]')

		const dragOver = selectAll(App, '.drag-over')
		dragOver.forEach((n) => n.classList.remove('drag-over'))

		// Completed state according to placed task group
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

			const activeDragElement = select(App, '.task-item.dragging')
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
		const siblings = selectAll(container, '.task-item:not(.dragging)')
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
			const count = select(container, '[data-task-list]').childElementCount - 1
			select(container, '[data-counter]').textContent = count
			select(container, '.state-message').classList.toggle(
				'active',
				count === 0
			)
		})

		document.title = `To Do (${select(App, '[data-counter]').textContent})`
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
		listData = [...temp]
	}

	loadData()
	updateListCount()
}

document.addEventListener('DOMContentLoaded', init)
