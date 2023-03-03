import { Modal, Box, Typography, Input, Button, InputLabel } from '@mui/material'
import {
	Dispatch,
	SetStateAction,
	ReactNode,
	useRef,
	useState,
	FormEventHandler,
	useEffect,
	ChangeEventHandler,
} from 'react'
import { SlotInfo } from 'react-big-calendar'
import { MyEvent } from 'types/events'

export interface EventModalProps {
	isOpen: boolean
	onClose: () => void
	slotInfo?: SlotInfo | null
	event?: MyEvent | null
	setEvents: Dispatch<SetStateAction<MyEvent[]>>
	addEvent: (o: { slotInfo?: SlotInfo | null; title: ReactNode; textColor: string }) => void
}

export const EventModal = ({
	isOpen,
	onClose,
	slotInfo,
	addEvent,
	event,
	setEvents,
}: EventModalProps) => {
	console.log({
		slotInfo,
		event,
	})
	const inputRef = useRef<HTMLInputElement | null>(null)
	const [title, setTitle] = useState<ReactNode>(event?.title ?? '')
	const [textColor, setTextColor] = useState(event?.textColor ?? '#ffffff')

	const onChangeTitle = (e: any) => {
		setTitle(e.target.value.trim())
	}

	const handleTextColorChange: ChangeEventHandler<HTMLInputElement> = (e) => {
		setTextColor(e.target.value)
	}

	const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault()
		if (!title) return

		if (event) {
			setEvents((events) => {
				return events.map((e) => {
					if (e.id === event.id) {
						return {
							...e,
							title,
							textColor,
						}
					}
					return e
				})
			})

			return onClose()
		}

		addEvent({ slotInfo, title, textColor })
		onClose()
	}

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
				component='form'
				onSubmit={onSubmit}
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
					{event ? 'Edit event' : 'Add event'}
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

				<InputLabel
					sx={{
						alignSelf: 'flex-start',
						display: 'flex',
						alignItems: 'center',
						gap: '10px',
						':focus-within': {
							outline: '1px solid blue',
						},
					}}
				>
					<Input
						disableUnderline
						type='color'
						value={textColor}
						onChange={handleTextColorChange}
						inputProps={{
							sx: {
								appearance: 'none',
								width: 30,
								height: 30,
								borderRadius: '100%',
								overflow: 'hidden',
								p: 0,
								'&::-webkit-color-swatch': {
									borderRadius: '100%',
								},
							},
						}}
					/>
					<Typography>Text color: {textColor}</Typography>
				</InputLabel>

				<Box
					display='flex'
					justifyContent='flex-end'
					gap='10px'
					width='100%'
				>
					<Button
						type='submit'
						variant='contained'
					>
						{event ? 'Edit' : 'Add'}
					</Button>
					<Button
						onClick={onClose}
						type='button'
						variant='outlined'
					>
						Cancel
					</Button>
				</Box>
			</Box>
		</Modal>
	)
}
