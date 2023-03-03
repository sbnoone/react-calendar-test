import { Event } from 'react-big-calendar'

export interface MyEvent extends Event {
	id: number | string
	resourceId: number | string
}

export interface MyResource {
	resourceId: number
	resourceTitle: string
}
