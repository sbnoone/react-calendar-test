export interface PublicHolidayDto {
	date: string
	localName: string | null
	name: string | null
	countryCode: string | null
	fixed: boolean
	global: boolean
	counties: string[] | null
	launchYear: number | null
	types: PublicHolidayType[] | null
}

enum PublicHolidayTypeEnum {
	Public = 'Public',
	Bank = 'Bank',
	School = 'School',
	Authorities = 'Authorities',
	Optional = 'Optional',
	Observance = 'Observance',
}

type PublicHolidayType = `${PublicHolidayTypeEnum}`
