import { useCallback, useMemo, useState } from 'react'
import { Calendar, Event, Views, dayjsLocalizer, Components } from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'

import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isBetween from 'dayjs/plugin/isBetween'
import localeData from 'dayjs/plugin/localeData'
import minMax from 'dayjs/plugin/minMax'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
dayjs.locale('en')
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)
dayjs.extend(isBetween)
dayjs.extend(localeData)
dayjs.extend(minMax)
dayjs.extend(localizedFormat)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(timezone)

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

/* Task Description: Create a calendar grid with the ability to create and organize tasks. Required Functionality: Create and edit tasks inside calendar cells (days) in an inline manner.Reassign tasks between days (calendar cells) using drag and drop.Reorder task in one cell using drag and drop.Filter tasks in the calendar by a searching text.Create and edit labels for tasks (color, text).Assign multiple labels to the task.Filter tasks by labels.Import and export calendar to file (json or other formats).Ability to download the calendar as an image.Show worldwide holidays for each day in the calendar. Holiday name must be fixed at of the cell and must not participate in re-ordering. API - (https://date.nager.at/swagger/index.html) */

function App() {
	const [myEvents, setMyEvents] = useState<MyEvent[]>(events)

	const moveEvent = useCallback(
		({
			event,
			start,
			end,
			resourceId,
			isAllDay: droppedOnAllDaySlot = false,
		}: MoveOrResizeEventOptions) => {
			const { allDay } = event
			if (!allDay && droppedOnAllDaySlot) {
				event.allDay = true
			}

			setMyEvents((prev) => {
				const existing = prev.find((ev) => ev.id === event.id) ?? {}
				const filtered = prev.filter((ev) => ev.id !== event.id)
				return [...filtered, { ...existing, start, end, resourceId, allDay }] as MyEvent[]
			})
		},
		[setMyEvents]
	)

	const resizeEvent = useCallback(
		({ event, start, end }: MoveOrResizeEventOptions) => {
			setMyEvents((prev) => {
				const existing = prev.find((ev) => ev.id === event.id) ?? {}
				const filtered = prev.filter((ev) => ev.id !== event.id)
				return [...filtered, { ...existing, start, end }] as MyEvent[]
			})
		},
		[setMyEvents]
	)

	const { defaultDate, scrollToTime } = useMemo(
		() => ({
			defaultDate: new Date(2018, 0, 29),
			scrollToTime: new Date(1972, 0, 1, 8),
		}),
		[]
	)

	const components: Components<MyEvent, MyResource> = useMemo(
		() => ({
			day: { event: () => <div>event</div>, header: () => <div>header</div> },
		}),
		[]
	)

	return (
		<div>
			<div style={{ height: 600 }}>
				<DragAndDropCalendar
					components={components}
					defaultDate={defaultDate}
					defaultView={Views.MONTH}
					events={myEvents}
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
