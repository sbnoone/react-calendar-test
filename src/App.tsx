import {
	Dispatch,
	PropsWithChildren,
	ReactNode,
	SetStateAction,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'
import {
	Calendar,
	Event,
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
import { Button, Input, Modal, Typography } from '@mui/material'
import { Box } from '@mui/system'
import { useBoolean } from './hooks/useBoolean'

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
	// 	id: 1,
	// 	title: 'MS training',
	// 	start: new Date(2018, 0, 29, 14, 0, 0),
	// 	end: new Date(2018, 0, 29, 16, 30, 0),
	// 	resourceId: 2,
	// },
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
const MyMonthEvent = ({ title }: EventProps<MyEvent>) => {
	return <div data-month-event>{title}</div>
}

function App() {
	const [myEvents, setMyEvents] = useState<MyEvent[]>(events)
	const { bool: isModalOpen, setTrue: openModal, setFalse: closeModal } = useBoolean()
	const [selectedSlotInfo, setSelectedSlotInfo] = useState<any>()
	const [selectedEvent, setSelectedEvent] = useState<any>()
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

	const addEvent = ({ slotInfo, title }: { slotInfo: SlotInfo; title: ReactNode }) => {
		const { end, start } = slotInfo
		const newEvent: MyEvent = {
			start,
			end,
			title,
			id: uid(),
			resourceId: 2,
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
				// header: MyMonthHeader,
				// dateHeader: MyMonthDateHeader,
				// event: MyMonthEvent,
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

const EventModal = ({
	isOpen,
	onClose,
	slotInfo,
	addEvent,
	event,
	setEvents,
}: {
	isOpen: boolean
	onClose: () => void
	slotInfo: SlotInfo
	event?: MyEvent
	setEvents: Dispatch<SetStateAction<MyEvent[]>>
	addEvent: (o: { slotInfo: SlotInfo; title: ReactNode }) => void
}) => {
	console.log({
		slotInfo,
		event,
	})
	const [title, setTitle] = useState<ReactNode>(event?.title ?? '')

	const onChangeTitle = (e: any) => {
		setTitle(e.target.value.trim())
	}

	const handleAddEvent = () => {
		if (!title) return

		if (event) {
			setEvents((events) => {
				return events.map((e) => {
					if (e.id === event.id) {
						return {
							...e,
							title,
						}
					}
					return e
				})
			})

			return onClose()
		}

		addEvent({ slotInfo, title })
		onClose()
	}

	const inputRef = useRef<HTMLInputElement | null>(null)

	useEffect(() => {
		const input = inputRef.current
		if (input) {
			input.focus()
			const length = input.value.length
			input.setSelectionRange(length, length)
		}
	}, [])

	return (
		<Modal
			open={isOpen}
			onClose={onClose}
			aria-labelledby='modal-modal-title'
			aria-describedby='modal-modal-description'
		>
			<Box
				sx={{
					position: 'absolute',
					top: '50%',
					left: '50%',
					transform: 'translate(-50%, -50%)',
					width: 400,
					bgcolor: 'whitesmoke',
					boxShadow: 24,
					p: 4,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: '10px',
				}}
			>
				<Typography
					id='modal-modal-title'
					variant='h6'
					component='h2'
				>
					Text in a modal
				</Typography>

				<Input
					inputRef={inputRef}
					autoFocus
					fullWidth
					type='text'
					placeholder='Event title'
					value={title}
					onChange={onChangeTitle}
				/>

				<Button
					onClick={handleAddEvent}
					type='button'
					variant='contained'
				>
					Add
				</Button>
			</Box>
		</Modal>
	)
}

export default App
