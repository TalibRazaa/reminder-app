// RemindMe App - Main JavaScript File
// Handles all interactive functionality across the application

// Global state management
let reminders = [];
let currentDate = new Date();
let selectedDate = null;
let currentCategory = 'all';
let currentTheme = 'light';

// Sample data initialization
const sampleReminders = [
    {
        id: 1,
        title: "Team Meeting",
        description: "Weekly team sync to discuss project progress",
        date: "2025-11-11",
        time: "10:00",
        category: "work",
        priority: "high",
        completed: false,
        created: new Date('2025-11-10')
    },
    {
        id: 2,
        title: "Doctor Appointment",
        description: "Annual health checkup",
        date: "2025-11-12",
        time: "14:30",
        category: "health",
        priority: "medium",
        completed: false,
        created: new Date('2025-11-09')
    },
    {
        id: 3,
        title: "Grocery Shopping",
        description: "Weekly grocery run - milk, bread, vegetables",
        date: "2025-11-11",
        time: "18:00",
        category: "shopping",
        priority: "low",
        completed: true,
        created: new Date('2025-11-08')
    },
    {
        id: 4,
        title: "Project Deadline",
        description: "Submit final deliverables for client",
        date: "2025-11-15",
        time: "17:00",
        category: "work",
        priority: "high",
        completed: false,
                        created: new Date('2025-11-07')
    },
    {
        id: 5,
        title: "Gym Workout",
        description: "Leg day routine - squats, lunges, calf raises",
        date: "2025-11-13",
        time: "07:00",
        category: "health",
        priority: "medium",
        completed: false,
        created: new Date('2025-11-06')
    },
    {
        id: 6,
        title: "Family Dinner",
        description: "Weekly family get-together at mom's place",
        date: "2025-11-14",
        time: "19:00",
        category: "personal",
        priority: "medium",
        completed: false,
        created: new Date('2025-11-05')
    }
];

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Load data from localStorage or use sample data
    loadReminders();
    loadTheme();
    
    // Initialize page-specific functionality
    const currentPage = window.location.pathname.split('/').pop();
    
    switch(currentPage) {
        case 'index.html':
        case '':
            initializeDashboard();
            break;
        case 'calendar.html':
            initializeCalendar();
            break;
        case 'settings.html':
            initializeSettings();
            break;
    }
    
    // Initialize common functionality
    initializeCommonFeatures();
}

function loadReminders() {
    const savedReminders = localStorage.getItem('remindMeReminders');
    if (savedReminders) {
        reminders = JSON.parse(savedReminders).map(reminder => ({
            ...reminder,
            created: new Date(reminder.created)
        }));
    } else {
        reminders = sampleReminders;
        saveReminders();
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem('remindMeTheme');
    currentTheme = savedTheme || 'light';
    applyTheme(currentTheme);
}

function saveTheme() {
    localStorage.setItem('remindMeTheme', currentTheme);
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update theme toggle icon
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('svg path');
        if (theme === 'dark') {
            icon.setAttribute('d', 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z');
        } else {
            icon.setAttribute('d', 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z');
        }
    }
}

function saveReminders() {
    localStorage.setItem('remindMeReminders', JSON.stringify(reminders));
}

// Dashboard functionality
function initializeDashboard() {
    updateStats();
    initializeCategoryCarousel();
    renderReminders();
    initializeProductivityChart();
    renderUpcomingReminders();
    
    // Set today's date as default for reminder form
    const today = new Date();
    const dateInput = document.getElementById('reminderDate');
    if (dateInput) {
        dateInput.value = today.toISOString().split('T')[0];
    }
}

function updateStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayReminders = reminders.filter(r => r.date === today);
    const completedToday = todayReminders.filter(r => r.completed).length;
    const pendingToday = todayReminders.filter(r => !r.completed).length;
    const upcomingWeek = getUpcomingReminders(7).length;
    
    // Animate stats update
    animateNumber('totalReminders', reminders.length);
    animateNumber('completedToday', completedToday);
    animateNumber('pendingToday', pendingToday);
    animateNumber('upcomingWeek', upcomingWeek);
}

function animateNumber(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    anime({
        targets: { value: 0 },
        value: targetValue,
        duration: 1000,
        easing: 'easeOutQuart',
        update: function(anim) {
            element.textContent = Math.round(anim.animatables[0].target.value);
        }
    });
}

function initializeCategoryCarousel() {
    const carousel = document.getElementById('category-carousel');
    if (!carousel) return;
    
    new Splide(carousel, {
        type: 'slide',
        perPage: 5,
        perMove: 1,
        gap: '1rem',
        pagination: false,
        arrows: false,
        breakpoints: {
            768: { perPage: 3 },
            480: { perPage: 2 }
        }
    }).mount();
    
    // Add category filter functionality
    document.querySelectorAll('.category-filter').forEach(filter => {
        filter.addEventListener('click', function() {
            document.querySelectorAll('.category-filter').forEach(f => f.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.category;
            renderReminders();
        });
    });
}

function renderReminders() {
    const grid = document.getElementById('remindersGrid');
    if (!grid) return;
    
    const today = new Date().toISOString().split('T')[0];
    let todayReminders = reminders.filter(r => r.date === today);
    
    if (currentCategory !== 'all') {
        todayReminders = todayReminders.filter(r => r.category === currentCategory);
    }
    
    grid.innerHTML = '';
    
    todayReminders.forEach((reminder, index) => {
        const card = createReminderCard(reminder);
        grid.appendChild(card);
        
        // Animate card entrance
        anime({
            targets: card,
            opacity: [0, 1],
            translateY: [20, 0],
            delay: index * 100,
            duration: 600,
            easing: 'easeOutQuart'
        });
    });
    
    if (todayReminders.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h3 class="text-lg font-medium text-gray-600 mb-2">All caught up!</h3>
                <p class="text-gray-500">No reminders for today in this category.</p>
            </div>
        `;
    }
}

function createReminderCard(reminder) {
    const card = document.createElement('div');
    card.className = `reminder-card glass-card rounded-xl p-6 priority-${reminder.priority} ${reminder.completed ? 'opacity-60' : ''}`;
    
    const categoryIcons = {
        work: '💼',
        personal: '🏠',
        health: '🏃',
        shopping: '🛒'
    };
    
    const priorityColors = {
        high: 'bg-red-100 text-red-800',
        medium: 'bg-yellow-100 text-yellow-800',
        low: 'bg-green-100 text-green-800'
    };
    
    card.innerHTML = `
        <div class="flex items-start justify-between mb-4">
            <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center text-white text-lg">
                    ${categoryIcons[reminder.category] || '📋'}
                </div>
                <div>
                    <h3 class="font-semibold text-gray-800 ${reminder.completed ? 'line-through' : ''}">${reminder.title}</h3>
                    <p class="text-sm text-gray-600">${reminder.time}</p>
                </div>
            </div>
            <div class="flex items-center space-x-2">
                <span class="px-2 py-1 text-xs font-medium rounded-full ${priorityColors[reminder.priority]}">
                    ${reminder.priority}
                </span>
                <button onclick="toggleReminder(${reminder.id})" class="text-gray-400 hover:text-green-600">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${reminder.completed ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' : 'M5 13l4 4L19 7'}"></path>
                    </svg>
                </button>
            </div>
        </div>
        ${reminder.description ? `<p class="text-gray-600 text-sm mb-4 ${reminder.completed ? 'line-through' : ''}">${reminder.description}</p>` : ''}
        <div class="flex items-center justify-between text-xs text-gray-500">
            <span>${reminder.category.charAt(0).toUpperCase() + reminder.category.slice(1)}</span>
            <button onclick="deleteReminder(${reminder.id})" class="text-red-400 hover:text-red-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
            </button>
        </div>
    `;
    
    return card;
}

function toggleReminder(id) {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
        reminder.completed = !reminder.completed;
        saveReminders();
        renderReminders();
        updateStats();
        
        // Celebration animation for completion
        if (reminder.completed) {
            createCelebrationEffect();
        }
    }
}

function deleteReminder(id) {
    if (confirm('Are you sure you want to delete this reminder?')) {
        reminders = reminders.filter(r => r.id !== id);
        saveReminders();
        renderReminders();
        updateStats();
    }
}

function initializeProductivityChart() {
    const chartElement = document.getElementById('productivityChart');
    if (!chartElement) return;
    
    const chart = echarts.init(chartElement);
    
    // Generate sample data for the past week
    const dates = [];
    const completed = [];
    const total = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dates.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        
        const dayReminders = reminders.filter(r => r.date === dateStr);
        completed.push(dayReminders.filter(r => r.completed).length);
        total.push(dayReminders.length);
    }
    
    // Determine if dark theme is active
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#d1d5db' : '#6b7280';
    const axisColor = isDark ? '#374151' : '#e5e7eb';
    const gridColor = isDark ? '#4b5563' : '#f3f4f6';
    
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            }
        },
        legend: {
            data: ['Completed', 'Total'],
            textStyle: {
                color: textColor
            }
        },
        xAxis: {
            type: 'category',
            data: dates,
            axisLine: {
                lineStyle: {
                    color: axisColor
                }
            },
            axisLabel: {
                color: textColor
            }
        },
        yAxis: {
            type: 'value',
            axisLine: {
                lineStyle: {
                    color: axisColor
                }
            },
            axisLabel: {
                color: textColor
            },
            splitLine: {
                lineStyle: {
                    color: gridColor
                }
            }
        },
        series: [
            {
                name: 'Completed',
                type: 'bar',
                data: completed,
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: isDark ? '#a8b899' : '#8B9A7A' },
                        { offset: 1, color: isDark ? '#f0b8a8' : '#E8A598' }
                    ])
                },
                barWidth: '40%'
            },
            {
                name: 'Total',
                type: 'line',
                data: total,
                itemStyle: {
                    color: isDark ? '#9ca3af' : '#6b7280'
                },
                lineStyle: {
                    color: isDark ? '#9ca3af' : '#6b7280',
                    width: 2
                }
            }
        ]
    };
    
    chart.setOption(option);
    
    // Animate chart entrance
    anime({
        targets: chartElement,
        opacity: [0, 1],
        duration: 1000,
        easing: 'easeOutQuart'
    });
}

function renderUpcomingReminders() {
    const container = document.getElementById('upcomingReminders');
    if (!container) return;
    
    const upcoming = getUpcomingReminders(7);
    
    if (upcoming.length === 0) {
        container.innerHTML = `
            <div class="text-center py-6 text-gray-500">
                <p>No upcoming reminders this week</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    upcoming.forEach((reminder, index) => {
        const item = document.createElement('div');
        item.className = 'reminder-item flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-gray-200';
        
        const date = new Date(reminder.date);
        const isToday = date.toDateString() === new Date().toDateString();
        const dateStr = isToday ? 'Today' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        item.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="w-2 h-2 rounded-full ${reminder.priority === 'high' ? 'bg-red-400' : reminder.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'}"></div>
                <div>
                    <div class="font-medium text-gray-800">${reminder.title}</div>
                    <div class="text-sm text-gray-600">${dateStr} at ${reminder.time}</div>
                </div>
            </div>
            <div class="text-xs text-gray-500 capitalize">${reminder.category}</div>
        `;
        
        container.appendChild(item);
        
        // Animate item entrance
        anime({
            targets: item,
            opacity: [0, 1],
            translateX: [-20, 0],
            delay: index * 50,
            duration: 400,
            easing: 'easeOutQuart'
        });
    });
}

function getUpcomingReminders(days) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    
    return reminders
        .filter(r => {
            const reminderDate = new Date(r.date);
            return reminderDate >= today && reminderDate <= futureDate && !r.completed;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);
}

// Calendar functionality
function initializeCalendar() {
    updateCalendarHeader();
    renderCalendar();
    
    // Set today's date as default for reminder form
    const today = new Date();
    const dateInput = document.getElementById('reminderDate');
    if (dateInput) {
        dateInput.value = today.toISOString().split('T')[0];
    }
}

function updateCalendarHeader() {
    const header = document.getElementById('currentMonth');
    if (header) {
        header.textContent = currentDate.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
        });
    }
}

function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
        const cellDate = new Date(startDate);
        cellDate.setDate(startDate.getDate() + i);
        
        const cell = document.createElement('div');
        cell.className = 'calendar-cell p-2 text-center cursor-pointer';
        
        const isCurrentMonth = cellDate.getMonth() === month;
        const isToday = cellDate.toDateString() === today.toDateString();
        const dateStr = cellDate.toISOString().split('T')[0];
        const dayReminders = reminders.filter(r => r.date === dateStr);
        
        if (!isCurrentMonth) {
            cell.classList.add('text-gray-300');
        }
        
        if (isToday) {
            cell.classList.add('today');
        }
        
        if (dayReminders.length > 0) {
            cell.classList.add('has-reminders');
        }
        
        cell.innerHTML = `
            <div class="text-sm font-medium mb-1">${cellDate.getDate()}</div>
            <div class="flex justify-center space-x-1">
                ${dayReminders.slice(0, 3).map(r => 
                    `<div class="reminder-dot ${r.priority}"></div>`
                ).join('')}
                ${dayReminders.length > 3 ? '<div class="text-xs text-gray-500">+' + (dayReminders.length - 3) + '</div>' : ''}
            </div>
        `;
        
        cell.addEventListener('click', () => selectDate(cellDate, dayReminders));
        grid.appendChild(cell);
        
        // Animate cell entrance
        anime({
            targets: cell,
            opacity: [0, 1],
            scale: [0.8, 1],
            delay: i * 10,
            duration: 300,
            easing: 'easeOutQuart'
        });
    }
}

function selectDate(date, dayReminders) {
    selectedDate = date;
    
    // Update selected date display
    const selectedDateElement = document.getElementById('selectedDate');
    const selectedDateFullElement = document.getElementById('selectedDateFull');
    
    if (selectedDateElement) {
        selectedDateElement.textContent = date.toLocaleDateString('en-US', { 
            weekday: 'long',
            month: 'long', 
            day: 'numeric' 
        });
    }
    
    if (selectedDateFullElement) {
        selectedDateFullElement.textContent = date.toLocaleDateString('en-US', { 
            year: 'numeric',
            month: 'long', 
            day: 'numeric' 
        });
    }
    
    // Update calendar cell selection
    document.querySelectorAll('.calendar-cell').forEach(cell => {
        cell.classList.remove('selected');
    });
    
    event.target.closest('.calendar-cell').classList.add('selected');
    
    // Render date reminders
    renderDateReminders(dayReminders);
    
    // Update reminder form date
    const dateInput = document.getElementById('reminderDate');
    if (dateInput) {
        dateInput.value = date.toISOString().split('T')[0];
    }
}

function renderDateReminders(dayReminders) {
    const container = document.getElementById('dateReminders');
    if (!container) return;
    
    if (dayReminders.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <p class="text-sm">No reminders for this date</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    dayReminders.forEach((reminder, index) => {
        const item = document.createElement('div');
        item.className = 'reminder-item p-3 rounded-lg border border-gray-100';
        
        const priorityColors = {
            high: 'bg-red-100 text-red-800',
            medium: 'bg-yellow-100 text-yellow-800',
            low: 'bg-green-100 text-green-800'
        };
        
        item.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <div class="font-medium text-gray-800 text-sm">${reminder.title}</div>
                    <div class="text-xs text-gray-600">${reminder.time}</div>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="px-2 py-1 text-xs font-medium rounded-full ${priorityColors[reminder.priority]}">
                        ${reminder.priority}
                    </span>
                    <input type="checkbox" ${reminder.completed ? 'checked' : ''} 
                           onchange="toggleReminder(${reminder.id})"
                           class="rounded text-green-600 focus:ring-green-500">
                </div>
            </div>
        `;
        
        container.appendChild(item);
        
        // Animate item entrance
        anime({
            targets: item,
            opacity: [0, 1],
            translateY: [10, 0],
            delay: index * 50,
            duration: 300,
            easing: 'easeOutQuart'
        });
    });
}

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendarHeader();
    renderCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendarHeader();
    renderCalendar();
}

function goToToday() {
    currentDate = new Date();
    updateCalendarHeader();
    renderCalendar();
    
    // Select today if on calendar page
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const todayReminders = reminders.filter(r => r.date === todayStr);
    selectDate(today, todayReminders);
}

// Settings functionality
function initializeSettings() {
    // Initialize theme options
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Initialize color pickers
    document.querySelectorAll('.color-picker').forEach(picker => {
        picker.addEventListener('click', function() {
            document.querySelectorAll('.color-picker').forEach(p => p.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
}

function saveSettings() {
    // Animate save button
    const button = event.target;
    const originalText = button.textContent;
    
    button.textContent = 'Saving...';
    button.disabled = true;
    
    // Simulate save operation
    setTimeout(() => {
        button.textContent = 'Saved!';
        button.classList.remove('from-green-500', 'to-green-600', 'hover:from-green-600', 'hover:to-green-700');
        button.classList.add('from-green-600', 'to-green-700');
        
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
            button.classList.remove('from-green-600', 'to-green-700');
            button.classList.add('from-green-500', 'to-green-600', 'hover:from-green-600', 'hover:to-green-700');
        }, 2000);
    }, 1000);
    
    // Show success notification
    showNotification('Settings saved successfully!', 'success');
}

function openCategoryModal() {
    const modal = document.getElementById('categoryModal');
    if (modal) {
        modal.classList.remove('hidden');
        
        // Animate modal entrance
        const content = modal.querySelector('.glass-card');
        anime({
            targets: content,
            scale: [0.8, 1],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutQuart'
        });
    }
}

function closeCategoryModal() {
    const modal = document.getElementById('categoryModal');
    if (modal) {
        const content = modal.querySelector('.glass-card');
        anime({
            targets: content,
            scale: [1, 0.8],
            opacity: [1, 0],
            duration: 200,
            easing: 'easeInQuart',
            complete: () => {
                modal.classList.add('hidden');
            }
        });
    }
}

// Common functionality
function initializeCommonFeatures() {
    // Initialize search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    // Initialize theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Initialize reminder form
    const reminderForm = document.getElementById('reminderForm');
    if (reminderForm) {
        reminderForm.addEventListener('submit', handleReminderSubmit);
    }
    
    // Initialize scroll animations
    initializeScrollAnimations();
}

function handleSearch(event) {
    const query = event.target.value.toLowerCase();
    
    if (query === '') {
        renderReminders();
        return;
    }
    
    const filteredReminders = reminders.filter(reminder => 
        reminder.title.toLowerCase().includes(query) ||
        reminder.description.toLowerCase().includes(query) ||
        reminder.category.toLowerCase().includes(query)
    );
    
    // Render filtered reminders (for dashboard)
    const grid = document.getElementById('remindersGrid');
    if (grid) {
        grid.innerHTML = '';
        filteredReminders.forEach(reminder => {
            const card = createReminderCard(reminder);
            grid.appendChild(card);
        });
    }
}

function openReminderModal() {
    const modal = document.getElementById('reminderModal');
    if (modal) {
        modal.classList.remove('hidden');
        
        // Animate modal entrance
        const content = document.getElementById('modalContent');
        anime({
            targets: content,
            scale: [0.8, 1],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutQuart'
        });
        
        // Set focus to title input
        setTimeout(() => {
            const titleInput = document.getElementById('reminderTitle');
            if (titleInput) titleInput.focus();
        }, 300);
    }
}

function closeReminderModal() {
    const modal = document.getElementById('reminderModal');
    if (modal) {
        const content = document.getElementById('modalContent');
        anime({
            targets: content,
            scale: [1, 0.8],
            opacity: [1, 0],
            duration: 200,
            easing: 'easeInQuart',
            complete: () => {
                modal.classList.add('hidden');
                resetReminderForm();
            }
        });
    }
}

function resetReminderForm() {
    const form = document.getElementById('reminderForm');
    if (form) {
        form.reset();
        // Set today's date as default
        const dateInput = document.getElementById('reminderDate');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
    }
}

function handleReminderSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const reminder = {
        id: Date.now(),
        title: document.getElementById('reminderTitle').value,
        description: document.getElementById('reminderDescription').value,
        date: document.getElementById('reminderDate').value,
        time: document.getElementById('reminderTime').value,
        category: document.getElementById('reminderCategory').value,
        priority: document.querySelector('input[name="priority"]:checked').value,
        completed: false,
        created: new Date()
    };
    
    reminders.push(reminder);
    saveReminders();
    
    // Update UI based on current page
    const currentPage = window.location.pathname.split('/').pop();
    
    switch(currentPage) {
        case 'index.html':
        case '':
            renderReminders();
            updateStats();
            renderUpcomingReminders();
            break;
        case 'calendar.html':
            renderCalendar();
            if (selectedDate && selectedDate.toISOString().split('T')[0] === reminder.date) {
                const dayReminders = reminders.filter(r => r.date === reminder.date);
                renderDateReminders(dayReminders);
            }
            break;
    }
    
    closeReminderModal();
    showNotification('Reminder added successfully!', 'success');
    
    // Animate floating action button
    const fab = document.querySelector('.floating-btn');
    if (fab) {
        anime({
            targets: fab,
            scale: [1, 1.2, 1],
            duration: 300,
            easing: 'easeOutQuart'
        });
    }
}

function scrollToReminders() {
    const section = document.getElementById('reminders-section');
    if (section) {
        section.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function initializeScrollAnimations() {
    // Add scroll-triggered animations for elements
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                anime({
                    targets: entry.target,
                    opacity: [0, 1],
                    translateY: [20, 0],
                    duration: 600,
                    easing: 'easeOutQuart'
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements for scroll animations
    document.querySelectorAll('.glass-card, .reminder-card').forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
}

function createCelebrationEffect() {
    // Create celebration particles
    const colors = ['#8B9A7A', '#E8A598', '#F7F5F3', '#4A4A4A'];
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 8px;
            height: 8px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            top: 50%;
            left: 50%;
        `;
        
        document.body.appendChild(particle);
        
        anime({
            targets: particle,
            translateX: (Math.random() - 0.5) * 400,
            translateY: (Math.random() - 0.5) * 400,
            scale: [1, 0],
            opacity: [1, 0],
            duration: 1000,
            easing: 'easeOutQuart',
            complete: () => {
                document.body.removeChild(particle);
            }
        });
    }
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(currentTheme);
    saveTheme();
    
    // Update chart colors if on dashboard
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'index.html' || currentPage === '') {
        setTimeout(() => {
            initializeProductivityChart();
        }, 300);
    }
    
    showNotification(
        `Switched to ${currentTheme} theme`, 
        'success'
    );
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 z-50 px-6 py-4 rounded-lg shadow-lg text-white ${
        type === 'success' ? 'bg-gradient-to-r from-green-500 to-green-600' : 
        type === 'error' ? 'bg-gradient-to-r from-red-500 to-red-600' : 
        'bg-gradient-to-r from-blue-500 to-blue-600'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    anime({
        targets: notification,
        translateX: [300, 0],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuart'
    });
    
    setTimeout(() => {
        anime({
            targets: notification,
            translateX: [0, 300],
            opacity: [1, 0],
            duration: 300,
            easing: 'easeInQuart',
            complete: () => {
                document.body.removeChild(notification);
            }
        });
    }, 3000);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + N: New reminder
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        openReminderModal();
    }
    
    // Escape: Close modals
    if (event.key === 'Escape') {
        const reminderModal = document.getElementById('reminderModal');
        const categoryModal = document.getElementById('categoryModal');
        
        if (reminderModal && !reminderModal.classList.contains('hidden')) {
            closeReminderModal();
        }
        
        if (categoryModal && !categoryModal.classList.contains('hidden')) {
            closeCategoryModal();
        }
    }
});

// Export functions for global access
window.openReminderModal = openReminderModal;
window.closeReminderModal = closeReminderModal;
window.toggleReminder = toggleReminder;
window.deleteReminder = deleteReminder;
window.scrollToReminders = scrollToReminders;
window.previousMonth = previousMonth;
window.nextMonth = nextMonth;
window.goToToday = goToToday;
window.saveSettings = saveSettings;
window.openCategoryModal = openCategoryModal;
window.closeCategoryModal = closeCategoryModal;