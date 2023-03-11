import { Event } from 'react-big-calendar'

export interface MyEvent extends Event {
	id: number | string
	resourceId: number | string
	textColor: string
	fixed?: boolean
}

export interface MyResource {
	resourceId: number
	resourceTitle: string
}
