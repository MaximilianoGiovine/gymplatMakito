export function calculateCurrentDayNumber(startDateString: string): number {
    if (!startDateString) return 1;

    // Supabase returns 'YYYY-MM-DD'. Parse explicitly to avoid UTC-to-Local timezone shifting
    // which occurs when doing `new Date("YYYY-MM-DD")`
    const [year, month, day] = startDateString.split('-').map(Number);

    // Local midnight of start date
    const startObj = new Date(year, month - 1, day, 0, 0, 0, 0);

    // Local midnight of EXACTLY today
    const now = new Date();
    const todayObj = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    const diffTime = todayObj.getTime() - startObj.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Day strictly advances when local midnight passes. Day 1 is diff 0.
    return diffDays + 1;
}

export function getDisplayDateForDay(startDateString: string, dayNumber: number): string {
    if (!startDateString) return '';

    const [year, month, day] = startDateString.split('-').map(Number);
    // Add (dayNumber - 1) days to the start date
    const dateObj = new Date(year, month - 1, day + (dayNumber - 1), 0, 0, 0, 0);

    return dateObj.toLocaleDateString('es-ES', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
}
