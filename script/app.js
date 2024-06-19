document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('dateForm').addEventListener('submit', function (e) {
        e.preventDefault();
        
        const startDateInput = document.getElementById('start_date').value;
        const endDateInput = document.getElementById('end_date').value;

        if (startDateInput && endDateInput) {
            const startDate = new Date(startDateInput);
            const endDate = new Date(endDateInput);

            const weekends = getWeekends(startDate, endDate);
            displayWeekends(weekends);
        }
    });
});

function getWeekends(startDate, endDate) {
    const weekends = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const day = currentDate.getDay();
        if (day === 6 || day === 0) { // 6: Saturday, 0: Sunday
            weekends.push(new Date(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return weekends;
}

function displayWeekends(weekends) {
    const weekendList = document.getElementById('weekendList');
    weekendList.innerHTML = '';

    weekends.forEach(weekend => {
        const listItem = document.createElement('li');
        listItem.textContent = weekend.toDateString();
        weekendList.appendChild(listItem);
    });
}
