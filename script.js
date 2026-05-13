// script.js — генератор расписания с игровыми механиками
(function() {
    // ---------- DOM элементы ----------
    const form = document.getElementById('scheduleForm');
    const resultArea = document.getElementById('resultArea');
    const tableBody = document.getElementById('scheduleTableBody');
    const copyBtn = document.getElementById('copyBtn');

    // ---------- База игровых шаблонов (без AI, но динамично) ----------
    const gameTemplates = {
        quest: [
            '🎲 Квест: «Найди сокровище», решая задания по теме «{topic}»',
            '🗺️ Приключение: спаси деревню, правильно выполняя упражнения по «{topic}»',
            '🔍 Исследование: расшифруй древнюю рукопись через задачи на «{topic}»',
            '🏰 Испытание: пройди лабиринт, отвечая на вопросы по теме «{topic}»'
        ],
        competition: [
            '🏆 Соревнование: раздели класс на команды, кто быстрее решит примеры по «{topic}»',
            '⚡ Турнир: таблица лидеров за правильные ответы по теме «{topic}»',
            '🏅 Эстафета: каждая команда получает вопрос, победитель определяется за 5 раундов',
            '🎯 Битва капитанов: дуэль на скорость по материалу «{topic}»'
        ],
        roleplay: [
            '🎭 Ролевая игра: ученики — детективы, раскрывающие дело через {topic}',
            '🏪 Магазин: продавец и покупатели применяют {topic} для расчётов и диалогов',
            '⏳ Путешествие во времени: каждое задание переносит учеников в эпоху, связанную с {topic}',
            '🕵️‍♂️ Агенты: спецзадание, где нужно применить все знания по «{topic}»'
        ],
        board: [
            '🎲 Настолка: брось кубик и выполни задание по «{topic}»',
            '🃏 Карточная игра: сопоставь термин и определение на тему {topic}',
            '🧩 Своя игра: выбери категорию и стоимость вопроса по {topic}',
            '🔮 Лото: закрой все поля правильными ответами по теме «{topic}»'
        ]
    };

    // Вспомогательная функция: случайный элемент массива
    function randomItem(arr) {
        if (!arr.length) return 'Игровая активность по теме';
        return arr[Math.floor(Math.random() * arr.length)];
    }

    // Генерация игрового описания (подставляет тему в шаблон)
    function generateGameDescription(style, topic) {
        const templates = gameTemplates[style] || gameTemplates.quest;
        let template = randomItem(templates);
        return template.replace(/\{topic\}/g, topic);
    }

    // Генерация расписания на основе данных формы
    function generateSchedule() {
        // 1. Получаем список тем
        let topicsRaw = document.getElementById('topics').value.trim();
        if (!topicsRaw) {
            alert('Введите хотя бы одну тему / предмет.');
            return null;
        }
        let topics = topicsRaw.split(',').map(t => t.trim()).filter(t => t !== '');
        if (topics.length === 0) return null;

        // 2. Количество занятий в неделю
        let lessonsCount = parseInt(document.getElementById('lessonsCount').value, 10);
        if (isNaN(lessonsCount) || lessonsCount < 1) lessonsCount = 1;

        // 3. Длительность занятия
        let duration = parseInt(document.getElementById('duration').value, 10);
        if (isNaN(duration) || duration < 15) duration = 45;

        // 4. Выбранные дни недели
        let checkboxes = document.querySelectorAll('.day-checkbox:checked');
        let selectedDays = Array.from(checkboxes).map(cb => cb.value);
        if (selectedDays.length === 0) {
            alert('Выберите хотя бы один день недели.');
            return null;
        }

        // 5. Игровой стиль
        let gameStyle = document.getElementById('gameStyle').value;

        // 6. Стартовое время (фиксируем 15:00, можно будет вынести в форму позже)
        let startHour = 15;
        let startMinute = 0;

        let schedule = [];
        let topicIndex = 0;

        for (let i = 0; i < lessonsCount; i++) {
            let day = selectedDays[i % selectedDays.length];
            let topic = topics[topicIndex % topics.length];
            topicIndex++;

            // Вычисляем время (сдвиг по минутам на каждое занятие)
            let totalMinutesOffset = i * duration;
            let hour = startHour + Math.floor((startMinute + totalMinutesOffset) / 60);
            let minute = (startMinute + totalMinutesOffset) % 60;
            let timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

            let gameDesc = generateGameDescription(gameStyle, topic);

            schedule.push({
                day: day,
                time: timeStr,
                topic: topic,
                game: gameDesc
            });
        }
        return schedule;
    }

    // Отрисовать таблицу расписания
    function renderSchedule(schedule) {
        if (!schedule || schedule.length === 0) return;
        tableBody.innerHTML = '';
        for (let item of schedule) {
            const row = tableBody.insertRow();
            // Ячейка День
            row.insertCell(0).innerHTML = `<span class="font-medium">${item.day}</span>`;
            // Ячейка Время
            row.insertCell(1).innerHTML = item.time;
            // Ячейка Тема
            row.insertCell(2).innerHTML = item.topic;
            // Ячейка Игровой приём (с классом для стилизации)
            row.insertCell(3).innerHTML = `<span class="text-blue-700 text-sm italic bg-blue-50 px-2 py-0.5 rounded-md inline-block">${item.game}</span>`;
        }
        resultArea.classList.remove('hidden');
        // Прокрутка к результатам
        resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Копирование расписания в виде текста (таблица с табами)
    function copyScheduleAsText() {
        const rows = tableBody.querySelectorAll('tr');
        if (!rows.length) {
            alert('Нет данных для копирования.');
            return;
        }
        let textRows = ['День\tВремя\tТема\tИгровой приём'];
        for (let row of rows) {
            const cells = row.querySelectorAll('td');
            if (cells.length === 4) {
                const day = cells[0].innerText.trim();
                const time = cells[1].innerText.trim();
                const topic = cells[2].innerText.trim();
                const game = cells[3].innerText.trim();
                textRows.push(`${day}\t${time}\t${topic}\t${game}`);
            }
        }
        const finalText = textRows.join('\n');
        navigator.clipboard.writeText(finalText).then(() => {
            alert('✅ Расписание скопировано в буфер обмена (таблица с табами).\nВставьте в Excel, Google Docs или любой текстовый редактор.');
        }).catch(() => {
            alert('❌ Не удалось скопировать.');
        });
    }

    // ---------- Обработчики событий ----------
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const schedule = generateSchedule();
            if (schedule) renderSchedule(schedule);
        });
    }

    if (copyBtn) {
        copyBtn.addEventListener('click', copyScheduleAsText);
    }

    // ---------- Установка дней по умолчанию (ПН, СР, ПТ) ----------
    const defaultDays = ['ПН', 'СР', 'ПТ'];
    const checkboxes = document.querySelectorAll('.day-checkbox');
    checkboxes.forEach(cb => {
        if (defaultDays.includes(cb.value)) {
            cb.checked = true;
        }
    });
})();
