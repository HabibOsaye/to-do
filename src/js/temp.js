import { subDays } from 'date-fns'

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
			dateCreated: subDays(new Date(), 10),
			completed: true,
			order: 6,
		},
		{
			id: '9b969754-b3dc-48e4-b563-132ec5dadcc6',
			content: 'Get laundry done',
			dateCreated: subDays(new Date(), 5),
			completed: true,
			order: 5,
		},
		{
			id: '55af1668-725a-4ccd-b9ab-f6a5f11909ee',
			content: 'Take a 30min walk across town',
			dateCreated: subDays(new Date(), 3.2),
			completed: false,
			order: 4,
		},
		{
			id: '711a6641-80c4-4a5c-854c-2d7990261c03',
			content: 'Pick up chilies on your way back from town',
			completed: false,
			dateCreated: subDays(new Date(), 3),
			order: 3,
		},
		{
			id: 'ced86257-0036-42e6-8da2-2633a13af8bf',
			content: 'Catch up with French lessons',
			dateCreated: subDays(new Date(), 2.2),
			completed: false,
			order: 2,
		},
		{
			id: '3c7f53a2-2c72-4dbb-b473-90526871cc99',
			content: 'Get a new pc work station',
			dateCreated: subDays(new Date(), 1.05),
			completed: false,
			order: 1,
		},
		{
			id: '2c81b418-fc51-471d-88cc-951788edda78',
			content: 'Checkout Suicide Squad 2',
			dateCreated: new Date(),
			completed: false,
			order: 0,
		},
	],
}

export default TEMP
