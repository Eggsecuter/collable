// days are dates at midnight utc, the same as on the server
export const toDay = (date: Date) => date.toISOString().split('T')[0];

export const formatDay = (day: string) => new Date(day).toLocaleDateString(undefined, {
	weekday: 'short',
	day: 'numeric',
	month: 'long',
	year: 'numeric',
	timeZone: 'UTC'
});
