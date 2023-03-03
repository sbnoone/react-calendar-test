import { PropsWithChildren, ReactNode, useCallback, useMemo, useState } from 'react'
import {
	Calendar,
	Views,
	dayjsLocalizer,
	Components,
	EventProps,
	CalendarProps,
	EventWrapperProps,
	SlotInfo,
} from 'react-big-calendar'
import withDragAndDrop, { withDragAndDropProps } from 'react-big-calendar/lib/addons/dragAndDrop'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'

import dayjs from './config/date'
import { uid } from './utils/uid'
import { useBoolean } from './hooks/useBoolean'
import { EventModal } from './components/event-modal/event-modal'
import { MyEvent, MyResource } from './types/events'
import { Box } from '@mui/material'

const localizer = dayjsLocalizer(dayjs)

const DragAndDropCalendar = withDragAndDrop<MyEvent, MyResource>(Calendar)

const events: MyEvent[] = [
	// {
	// 	id: 0,
	// 	title: 'Board meeting',
	// 	start: new Date(2018, 0, 29, 9, 0, 0),
	// 	end: new Date(2018, 0, 29, 13, 0, 0),
	// 	resourceId: 1,
	// },
	// {
]

const resourceMap: MyResource[] = [
	{ resourceId: 1, resourceTitle: 'Board room' },
	{ resourceId: 2, resourceTitle: 'Training room' },
	{ resourceId: 3, resourceTitle: 'Meeting room 1' },
	{ resourceId: 4, resourceTitle: 'Meeting room 2' },
]

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

function App() {
	const [myEvents, setMyEvents] = useState<MyEvent[]>(events)
	const { bool: isModalOpen, setTrue: openModal, setFalse: closeModal } = useBoolean()
	const [selectedSlotInfo, setSelectedSlotInfo] = useState<SlotInfo | null>(null)
	const [selectedEvent, setSelectedEvent] = useState<MyEvent | null>(null)
	console.log(myEvents)
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
		e.stopPropagation()
		setSelectedEvent(event)
		openModal()
	}

	const onSelectSlot: CalendarProps<MyEvent, MyResource>['onSelectSlot'] = (slotInfo) => {
		setSelectedSlotInfo(slotInfo)
		openModal()
		// setMyEvents((e) => {
		// 	return [...e, { ...slotInfo, id: uid(), resourceId: 2, title: 'TEST' }]
		// })
	}

	const addEvent = ({
		slotInfo,
		title,
		textColor,
	}: {
		slotInfo?: SlotInfo | null
		title: ReactNode
		textColor: string
	}) => {
		if (!slotInfo) return
		const { end, start } = slotInfo
		const newEvent: MyEvent = {
			start,
			end,
			title,
			id: uid(),
			resourceId: 2,
			textColor,
		}

		setMyEvents((e) => {
			return [...e, newEvent]
		})
		setSelectedEvent(null)
	}

	const handleCloseModal = () => {
		setSelectedEvent(null)
		closeModal()
	}

	const components: Components<MyEvent, MyResource> = useMemo(
		() => ({
			// dateCellWrapper: CustomDateCellWrapper, // day cell
			eventWrapper: CustomEventWrapper,
			eventContainerWrapper: CustomEventContainerWrapper,
			timeSlotWrapper: MyTimeSlotWrapper,
			// event: CustomEvent,
			day: { event: CustomDayEvent },
			month: {
				event: MyMonthEvent,
				// header: MyMonthHeader,
				// dateHeader: MyMonthDateHeader,
			},
		}),
		[]
	)

	const { defaultDate, scrollToTime } = useMemo(
		() => ({
			defaultDate: new Date(2023, 2, 1),
			scrollToTime: new Date(1972, 0, 1, 8),
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
					components={components}
					defaultDate={defaultDate}
					defaultView={Views.MONTH}
					views={{ month: true }}
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
					popup
				/>
			</div>

			{isModalOpen && (
				<EventModal
					setEvents={setMyEvents}
					event={selectedEvent}
					addEvent={addEvent}
					slotInfo={selectedSlotInfo}
					isOpen={isModalOpen}
					onClose={handleCloseModal}
				/>
			)}
		</div>
	)
}

export default App

const CustomDayEvent = ({ title }: EventProps<MyEvent>) => {
	return (
		<div
			data-day-event
			style={{ color: 'black' }}
		>
			{title}
		</div>
	)
}

const CustomEventContainerWrapper = ({ children }: any) => {
	return (
		<div
			data-event-container-wrapper
			style={{ border: '1px solid green' }}
		>
			{children}
		</div>
	)
}

const CustomEventWrapper = ({ children }: PropsWithChildren<EventWrapperProps<MyEvent>>) => {
	return <div data-event-wrapper>{children}</div>
}

const MyMonthEvent = ({ title, event }: EventProps<MyEvent>) => {
	return (
		<Box
			sx={{
				color: event.textColor,
				border: '5px solid red',
			}}
		>
			{title}
		</Box>
	)
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

const MyTimeSlotWrapper = ({ children }: any) => {
	return <div data-time-slot-wrapper>{children} time slot</div>
}
