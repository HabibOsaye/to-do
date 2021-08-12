import { subMinutes } from 'date-fns'

const min = 1440

const TEMP = {
	config: {
		toDo: {
			collapsed: false,
		},
		done: {
			collapsed: false,
		},
	},
	tasks: [
		{
			id: 'f0d627a9-91be-4d58-a957-86aec86166da',
			content: 'Get an overview of React Js',
			dateCreated: subMinutes(new Date(), 10 * min),
			completed: true,
			order: 6,
		},
		{
			id: '9b969754-b3dc-48e4-b563-132ec5dadcc6',
			content: 'Get laundry done',
			dateCreated: subMinutes(new Date(), 5 * min),
			completed: true,
			order: 5,
		},
		{
			id: '55af1668-725a-4ccd-b9ab-f6a5f11909ee',
			content: 'Take a 30min walk across town',
			dateCreated: subMinutes(new Date(), 3 * min + 203),
			completed: false,
			order: 4,
		},
		{
			id: '711a6641-80c4-4a5c-854c-2d7990261c03',
			content: 'Stuff to pick up on your way back from town\n  - Chilies\n  - Get film batteries\n  - Microfiber cloth',
			completed: false,
			dateCreated: subMinutes(new Date(), 3 * min + 130),
			order: 3,
		},
		{
			id: 'ced86257-0036-42e6-8da2-2633a13af8bf',
			content: 'Catch up with French lessons',
			dateCreated: subMinutes(new Date(), 2 * min + 290),
			completed: false,
			order: 2,
		},
		{
			id: '3c7f53a2-2c72-4dbb-b473-90526871cc99',
			content: 'Get a new pc work station',
			dateCreated: subMinutes(new Date(), 1 * min + 31),
			completed: false,
			order: 1,
		},
		{
			id: '2c81b418-fc51-471d-88cc-951788edda78',
			content: 'Rebuild this project with React Js?',
			dateCreated: subMinutes(new Date(), 1 + 27),
			completed: false,
			order: 0,
			lastEdit: subMinutes(new Date(), 1 + 18),
		},
	],
}

export default TEMP
