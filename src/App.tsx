import { useCallback, useMemo, useState } from 'react'
import {
	Calendar,
	Event,
	Views,
	dayjsLocalizer,
	Components,
	EventProps,
	CalendarProps,
} from 'react-big-calendar'
import withDragAndDrop, { withDragAndDropProps } from 'react-big-calendar/lib/addons/dragAndDrop'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'

import dayjs from './config/date'
import { uid } from './utils/uid'

const localizer = dayjsLocalizer(dayjs)

const DragAndDropCalendar = withDragAndDrop<MyEvent, MyResource>(Calendar)

const events: MyEvent[] = [
	{
		id: 0,
		title: 'Board meeting',
		start: new Date(2018, 0, 29, 9, 0, 0),
		end: new Date(2018, 0, 29, 13, 0, 0),
		resourceId: 1,
	},
	{
		id: 1,
		title: 'MS training',
		start: new Date(2018, 0, 29, 14, 0, 0),
		end: new Date(2018, 0, 29, 16, 30, 0),
		resourceId: 2,
	},
	{
		id: 2,
		title: 'Team lead meeting',
		start: new Date(2018, 0, 29, 8, 30, 0),
		end: new Date(2018, 0, 29, 12, 30, 0),
		resourceId: 3,
	},
	{
		id: 10,
		title: 'Board meeting',
		start: new Date(2018, 0, 30, 23, 0, 0),
		end: new Date(2018, 0, 30, 23, 59, 0),
		resourceId: 1,
	},
	{
		id: 11,
		title: 'Birthday Party',
		start: new Date(2018, 0, 30, 7, 0, 0),
		end: new Date(2018, 0, 30, 10, 30, 0),
		resourceId: 4,
	},
	{
		id: 12,
		title: 'Board meeting',
		start: new Date(2018, 0, 29, 23, 59, 0),
		end: new Date(2018, 0, 30, 13, 0, 0),
		resourceId: 1,
	},
	{
		id: 13,
		title: 'Board meeting',
		start: new Date(2018, 0, 29, 23, 50, 0),
		end: new Date(2018, 0, 30, 13, 0, 0),
		resourceId: 2,
	},
	{
		id: 14,
		title: 'Board meeting',
		start: new Date(2018, 0, 29, 23, 40, 0),
		end: new Date(2018, 0, 30, 13, 0, 0),
		resourceId: 4,
	},
]

const resourceMap = [
	{ resourceId: 1, resourceTitle: 'Board room' },
	{ resourceId: 2, resourceTitle: 'Training room' },
	{ resourceId: 3, resourceTitle: 'Meeting room 1' },
	{ resourceId: 4, resourceTitle: 'Meeting room 2' },
]

interface MyEvent extends Event {
	id: number | string
	resourceId: number | string
}

type MyResource = typeof resourceMap[number]

type StringOrDate = string | Date

interface MoveOrResizeEventOptions {
	event: MyEvent
	start: StringOrDate
	end: StringOrDate
	isAllDay: boolean
	resourceId?: number
}

/* Task Description: Create a calendar grid with the ability to create and organize tasks. 
Required Functionality: 
 1. Create and edit tasks inside calendar cells (days) in an inline manner.
 2. Reassign tasks between days (calendar cells) using drag and drop.
 3. Reorder task in one cell using drag and drop.
 4. Filter tasks in the calendar by a searching text.
 5. Create and edit labels for tasks (color, text).Assign multiple labels to the task.Filter tasks by labels.
 6. Import and export calendar to file (json or other formats).
 7. Ability to download the calendar as an image.Show worldwide holidays for each day in the calendar. 
 8. Holiday name must be fixed at of the cell and must not participate in re-ordering. 
 API - (https://date.nager.at/swagger/index.html)
*/

const CustomDayEvent = ({ children }: EventProps<MyEvent> & { children?: any }) => {
	return <div style={{ color: 'black' }}>{children}</div>
}

const CustomEventContainerWrapper = ({ children }: any) => {
	return <div style={{ border: '1px solid green' }}>{children}</div>
}

const CustomEventWrapper = ({ children }: any) => {
	return <div style={{ border: '1px solid pink' }}>{children}</div>
}

const CustomEvent = ({ event }: EventProps<MyEvent>) => {
	return <div>{event.title}</div>
}
const CustomDateCellWrapper = ({ children }: any) => {
	return <div style={{ border: '1px dashed yellow' }}>{children}</div>
}

const MyMonthHeader = ({ children }: any) => {
	return <div>{children} header</div>
}
const MyMonthDateHeader = ({ children }: any) => {
	return <div>{children} date header</div>
}
const MyMonthEvent = ({ children }: any) => {
	return <div>{children} month event</div>
}

function App() {
	const [myEvents, setMyEvents] = useState<MyEvent[]>(events)

	const [searchText, setSearchText] = useState<string>('')

	const filteredEvents = myEvents.filter((event) => {
		return (event.title as string).toLocaleLowerCase().includes(searchText.toLocaleLowerCase())
	})

	const moveEvent: NonNullable<withDragAndDropProps<MyEvent, MyResource>['onEventDrop']> =
		useCallback(
			({ event, start, end, isAllDay: droppedOnAllDaySlot = false }) => {
				const { allDay } = event
				if (!allDay && droppedOnAllDaySlot) {
					event.allDay = true
				}

				setMyEvents((prev) => {
					const existing = prev.find((ev) => ev.id === event.id) ?? {}
					const filtered = prev.filter((ev) => ev.id !== event.id)
					return [...filtered, { ...existing, start, end, allDay }] as MyEvent[]
				})
			},
			[setMyEvents]
		)

	const resizeEvent: NonNullable<withDragAndDropProps<MyEvent, MyResource>['onEventResize']> =
		useCallback(
			({ event, start, end }) => {
				setMyEvents((prev) => {
					const existing = prev.find((ev) => ev.id === event.id) ?? {}
					const filtered = prev.filter((ev) => ev.id !== event.id)
					return [...filtered, { ...existing, start, end }] as MyEvent[]
				})
			},
			[setMyEvents]
		)

	const onSelectEvent: CalendarProps<MyEvent, MyResource>['onSelectEvent'] = (event, e) => {
		console.log(event)
	}

	const { defaultDate, scrollToTime } = useMemo(
		() => ({
			defaultDate: new Date(2018, 0, 29),
			scrollToTime: new Date(1972, 0, 1, 8),
		}),
		[]
	)

	const onSelectSlot: CalendarProps<MyEvent, MyResource>['onSelectSlot'] = (slotInfo) => {
		console.log(slotInfo)

		setMyEvents((e) => {
			return [...e, { ...slotInfo, id: uid(), resourceId: 2, title: 'TEST' }]
		})
	}

	const components: Components<MyEvent, MyResource> = useMemo(
		() => ({
			dateCellWrapper: CustomDateCellWrapper, // day cell
			eventWrapper: CustomEventWrapper,
			eventContainerWrapper: CustomEventContainerWrapper,
			event: CustomEvent,
			// day: { event: CustomDayEvent, header: ({}) => <div>header</div> },
			// month: {
			// 	header: MyMonthHeader,
			// 	dateHeader: MyMonthDateHeader,
			// 	event: MyMonthEvent,
			// },
		}),
		[]
	)

	return (
		<div>
			<div>
				<input
					type='text'
					value={searchText}
					onChange={(e) => setSearchText(e.target.value.trim())}
					placeholder='Search events...'
				/>
			</div>
			<div style={{ height: 600 }}>
				<DragAndDropCalendar
					onSelectSlot={onSelectSlot}
					onSelectEvent={onSelectEvent}
					// components={components}
					defaultDate={defaultDate}
					defaultView={Views.MONTH}
					events={filteredEvents}
					// events={myEvents}
					localizer={localizer}
					onEventDrop={moveEvent}
					onEventResize={resizeEvent}
					resizable
					resourceIdAccessor='resourceId'
					resources={resourceMap}
					resourceTitleAccessor='resourceTitle'
					scrollToTime={scrollToTime}
					selectable
					showMultiDayTimes={true}
					step={15}
				/>
			</div>
		</div>
	)
}

export default App
