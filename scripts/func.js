let _mobile = ( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) ?  true : false  //если смартфон
if (window.innerWidth < 400) _mobile = true //для узких экранов


function cr (...args) {
    //проверка, если первый параметр node то он является роидтелем, если строка - то создается тег без родителя 
    //Затем класс и тексконтент, например создам select cr('select', '', '') с родителем cr(stage, 'select', 'class', 'textContent')
    if (typeof args[0] === 'string') {
        let elem = document.createElement(args[0]);
        if (args[1]) elem.className = args[1];
        if (args[2]) elem.textContent = args[2];
        return elem;
    } else {
        let elem = document.createElement(args[1]);
        if (args[2]) elem.className = args[2];   
        if (args[3]) elem.textContent = args[3];
        args[0].append(elem);
        return elem;       
    }
}

//изменение ширины подсказки динамически для функции showTooltip
function adjustAspectRatio(element) {
    const maxWidth = 320; // Максимальная ширина блока
    const currentWidth = element.offsetWidth; // Текущая ширина блока
    const currentHeight = element.offsetHeight; // Текущая высота блока

    // Проверяем соотношение высоты к ширине
    if (currentHeight / currentWidth > 2) {
        // Если соотношение превышает 2
        if (currentWidth < maxWidth) {
            // Если ширина меньше максимальной
            // Увеличиваем ширину до максимальной или до значения, при котором соотношение станет 2
            const newWidth = Math.min(maxWidth, currentHeight / 1.5);
            element.style.width = newWidth + 'px';
        }
    }
}

function showTooltip(event, that) {
    let d = that.querySelector('div');  // d - это div с текстом-подсказкой
    d.hidden = false; 
    adjustAspectRatio(d)

    // Позиции блока подсказки
    let top = that.getBoundingClientRect().top - d.offsetHeight - 10; // устанавливаем позицию выше блока
    let left = that.getBoundingClientRect().left - (that.getBoundingClientRect().left / document.documentElement.clientWidth) * d.offsetWidth;

    // Проверка, помещается ли подсказка на экране сверху
    if (top < 0) {
        top = that.getBoundingClientRect().bottom + 10; // если не помещается, ставим ниже блока
    }

    // Проверка, помещается ли подсказка внизу экрана
    if (top + d.offsetHeight > window.innerHeight) {
        top = window.innerHeight - d.offsetHeight - 10; // подгоняем, если выходит за пределы
    }

    // Проверка на выход за пределы по горизонтали
    if (left < 10) {
        left = 10; // если выходит за левый край
    } else if (left + d.offsetWidth > window.innerWidth) {
        left = window.innerWidth - d.offsetWidth - 10; // если выходит за правый край
    }

    // Установка стилей
    d.style.top = top + 'px'; 
    d.style.left = left + 'px';
}


//проверить заполнение в elem всех input (кроме radio и checkbox и скрытых input, а также если есть класс rec). 
//Можно вместо elem передать массив inputs, кот. нужно проверить
//alarm - доп. параметр строка с предупреждением, если какой-либо input пуст
function check_inputs_in_elem(elem, alarm) {
    let allInputs
    
    if (elem instanceof Array) {
        allInputs = elem //передаем массив проверяемых inputs
    } else {
        allInputs = elem.querySelectorAll('input'); // Находим все input элементы
    }

    // Фильтруем элементы, исключая radio, checkbox, скрытые input и disabled
    let filteredInputs = Array.from(allInputs).filter(function(input) {
        var parent = input.parentElement;
        while (parent) {
            if (parent.tagName.toLowerCase() === 'div' && window.getComputedStyle(parent).display === 'none') {
                return false; // скрываемые div - пропускаем input
            }
            parent = parent.parentElement;
        }

        if (input.classList.contains('rec')) return false
        return input.type !== 'radio' && input.type !== 'checkbox' && input.type !== 'hidden' && !input.disabled
    })

    let emptyInputs = []; // Массив для хранения пустых инпутов

    // Проверяем, что все отфильтрованные input заполнены
    for (let inp of filteredInputs) {
        if (inp.value.trim() === '') {
            emptyInputs.push(inp); // Добавляем пустой input в массив
        }
    }

    // Если есть пустые инпуты, выводим предупреждение
    if (emptyInputs.length > 0) {
        if (alarm) {
            alert(alarm); // Вызываем alert только если alarm передан
        }
        emptyInputs.forEach(inp => animateInput(inp, 'red', 2000)) // Анимация некорректного значения
        return false; // Возвращаем false, если есть пустые поля
    }

    return true; // Все инпуты заполнены
}


// Принимает массив имен взрывоопасных веществ
function create_select_search(explosiveNames, _width) {
    let height_div_search = '300px';

    let div_select_search = cr('div', 'row m-0 mb-1 pt-1 cr_elem');
    let div_input = cr(div_select_search, 'div', 'input-group px-0');

    if (!_mobile) {
        div_input.innerHTML = `
        <span class="input-group-text">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>
        </span>`;
    }

    let _inp = cr(div_input, 'input', 'form-control search_input');
    _inp.current_state = 'clear';
    _inp.placeholder = 'наименование вещества';

    // === Вспомогательная функция: Обновление видимости контейнера ===
    // ✅ ГЛАВНОЕ ИСПРАВЛЕНИЕ: Скрывает весь блок, если нет выбранных И нет поиска
    function updateContainerVisibility() {
        const hasSelected = div_sel.children.length > 0;
        const hasSearch = !div_change.hidden && div_change.children.length > 0;
        
        if (!hasSelected && !hasSearch) {
            div_search_col.hidden = true;
        } else {
            div_search_col.hidden = false;
        }
    }

    // === Вспомогательная функция: Скрыть подсказки ===
    function hideSuggestions() {
        div_change.hidden = true;
        updateContainerVisibility(); // ✅ Проверяем, нужно ли скрывать контейнер
        
        if (div_sel.children.length === 0) {
            _inp.change_icon_btn('clear');
        } else {
            _inp.change_icon_btn('hide');
        }
    }

    // Единожды привязываем обработчик
    function handleKeyDown(event) {
        if (event.key === 'Enter' && _inp.value.trim().length >= 2) {
            btn_add_VM.click();
            hideSuggestions(); // ✅ Скрываем подсказки после Enter
        }
    }

    _inp.addEventListener('focus', () => {
        _inp.addEventListener('keydown', handleKeyDown);
    });

    _inp.addEventListener('blur', () => {
        _inp.removeEventListener('keydown', handleKeyDown);
        // ✅ Скрываем подсказки при потере фокуса (с задержкой для кликов)
        setTimeout(() => {
            hideSuggestions();
        }, 150);
    });

    let _btn_inp = cr(div_input, 'span', 'fs-4 input-group-text px-2 btn_clear');
    _btn_inp.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
    </svg>`;

    let btn_add_VM = cr(div_input, 'button', 'btn btn-secondary btn-sm px-3', 'Добавить');
    if (_mobile) btn_add_VM.textContent = ' + ';

    // ✅ Обработчик кнопки «Добавить» — скрываем подсказки после добавления
    btn_add_VM.onclick = (e) => {
        // 🔄 Здесь ваша существующая логика добавления вещества
        
        hideSuggestions(); // ✅ Скрываем подсказки после клика по кнопке
    };

    let div_search = cr(div_select_search, 'div', 'row input-group ms-1 ps-1 pe-5 select');
    let div_search_col = cr(div_search, 'div', 'col-12 ps-0 pe-0 ms-3 mb-2 rounded-1 bg-body border');

    let div_sel = cr(div_search_col, 'div', 'ps-2 pb-1 border-bottom bg-secondary-subtle mark_element');
    div_sel.hidden = true;
    div_sel.style = "max-height: 3.1em; overflow: auto;";

    let div_change = cr(div_search_col, 'div', 'ps-2 pb-1 mb-1');
    div_change.style = `max-height: ${height_div_search}; overflow: auto;`;

    div_search_col.hidden = true;
    div_search_col.classList.remove('col-12');
    div_search_col.style.position = 'absolute';
    div_search_col.style.zIndex = 4;
    if (_width) div_search_col.style.width = _width * 0.9 + 'px';

    // === Создание списка поиска ===
    const nameToDivMap = new Map(); // для быстрого восстановления

    for (let i = 0; i < explosiveNames.length; i++) {
        const name = explosiveNames[i];
        if (!name || !name.trim()) continue;

        let _div = cr(div_change, 'div', 'form-check');
        let inp = cr(_div, 'input', 'form-check-input');
        inp.type = "checkbox";
        inp.dataset.name = name;
        let _label = cr(_div, 'label', 'form-check-label', name);

        nameToDivMap.set(name, _div);
    }

    // === Кнопка очистки/сворачивания ===
    _btn_inp.onclick = (e) => {
        if (_inp.current_state == 'clear') {
            _inp.value = '';
            _inp.dispatchEvent(new Event('input', { bubbles: true }));
            if (div_sel.children.length) {
                if (!div_sel.hidden) {
                    _inp.change_icon_btn('hide');
                } else {
                    _inp.change_icon_btn('show');
                }
            }
        } else if (_inp.current_state == 'hide') {
            div_sel.hidden = div_search_col.hidden = true;
            _inp.change_icon_btn('show');
        } else if (_inp.current_state == 'show') {
            div_sel.hidden = div_search_col.hidden = false;
            _inp.change_icon_btn('hide');
        }
    };

    // === Выбор вещества ===
    div_change.onclick = (e) => {
        let targetDiv = e.target.closest('div.form-check');
        if (!targetDiv) return;

        const name = targetDiv.querySelector('input').dataset.name;

        // Рекурсивная функция ожидания GM
        function waitForGm(attempts = 0) {
            if (attempts > 10) {
                alert('❌ Не удалось загрузить справочник. Попробуйте обновить страницу.');
                return;
            }

            if (!GM || !Array.isArray(GM)) {
                setTimeout(() => waitForGm(attempts + 1), 300);
                return;
            }

            // GM готов — продолжаем
            const compressed = GM.find(item => item[0] === name);
            if (!compressed) {
                console.warn('Вещество не найдено в GM:', name);
                return;
            }
            const full = decompressSubstance(compressed);

            let _div = targetDiv.cloneNode(true);
            div_sel.append(_div);

            // ✅ Надежно находим input и снимаем галочку в исходном элементе
            const originalInput = targetDiv.querySelector('input');
            if (originalInput) {
                originalInput.checked = false;
            }

            targetDiv.hidden = true;

            _div.classList.add('form-check-inline');
            const selectedInput = _div.querySelector('input');
            selectedInput.checked = true;
            selectedInput.dataset.fullData = JSON.stringify(full);

            div_sel.hidden = false;
            
            // ✅ После выбора скрываем подсказки и обновляем контейнер
            hideSuggestions();
        }

        waitForGm();
    };

    // === Возврат выбранного вещества ===
    div_sel.onclick = (e) => {
        let targetDiv = e.target.closest('div.form-check');
        if (!targetDiv) return;

        let targetName = targetDiv.querySelector('label').textContent.trim();
        targetDiv.remove();

        // Быстрое восстановление через Map
        const originalDiv = nameToDivMap.get(targetName);
        if (originalDiv) {
            originalDiv.hidden = false;
            // ✅ Сбрасываем галочку при возврате в список
            const inp = originalDiv.querySelector('input');
            if (inp) inp.checked = false;
        }

        if (div_sel.children.length === 0) {
            div_sel.hidden = true;
            _inp.change_icon_btn('clear');
            // ✅ Если нет выбранных и нет поиска — скрываем контейнер
            if (_inp.value.length < 1 || div_change.hidden) {
                div_search_col.hidden = true;
            }
        }
        
        updateContainerVisibility(); // ✅ Проверяем видимость
    };

    // === Поиск и сортировка ===
    let lastQuery = '';

    _inp.oninput = (e) => {
        let query = e.target.value.trim();

        if (query === '') {
            _inp.change_icon_btn('clear');
            _btn_inp.click();
            return;
        }

        if (query.length < 2) {
            div_change.hidden = true;
            // ✅ Используем новую функцию вместо прямого скрытия
            updateContainerVisibility();
            return;
        }

        // Не пересчитываем, если запрос не изменился
        if (query === lastQuery) return;
        lastQuery = query;

        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedQuery, 'i');

        // Собираем совпадения и сразу сортируем
        const matches = [];
        for (let div of div_change.children) {
            const label = div.querySelector('label').textContent.trim();
            if (regex.test(label)) {
                matches.push({ div, text: label.toLowerCase() });
            }
            div.hidden = true;
        }

        if (matches.length > 0) {
            // Сортируем один раз
            matches.sort((a, b) => {
                const q = query.toLowerCase();
                if (a.text === q) return -1;
                if (b.text === q) return 1;
                if (a.text.startsWith(q) && !b.text.startsWith(q)) return -1;
                if (b.text.startsWith(q) && !a.text.startsWith(q)) return 1;
                return a.text.length - b.text.length;
            });

            // Добавляем в DOM в правильном порядке
            for (const { div } of matches) {
                div_change.appendChild(div);
                div.hidden = false;
            }

            div_change.hidden = false;
            div_search_col.hidden = false;
        } else {
            div_change.hidden = true;
            // ✅ Если нет совпадений — скрываем контейнер (если нет выбранных)
            updateContainerVisibility();
        }
    };

    // === Кнопка переключения ===
    _inp.change_icon_btn = function(state) {
        const icons = {
            clear: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>`,
            hide: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-up-square" viewBox="0 0 16 16"><path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/><path d="M3.544 10.705A.5.5 0 0 0 4 11h8a.5.5 0 0 0 .374-.832l-4-4.5a.5.5 0 0 0-.748 0l-4 4.5a.5.5 0 0 0-.082.537z"/></svg>`,
            show: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-down-square" viewBox="0 0 16 16"><path d="M3.626 6.832A.5.5 0 0 1 4 6h8a.5.5 0 0 1 .374.832l-4 4.5a.5.5 0 0 1-.748 0l-4-4.5z"/><path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2z"/></svg>`
        };
        _btn_inp.innerHTML = icons[state] || icons.clear;
        this.current_state = state;
    };

    return div_select_search;
} // create_select_search


/*создание модульного окна
id - id модульного окна, необходима для вызывающего элемента
title и body - строка или тег мод. окна */


//если вместо body поставить element то работаем с элементом, чтобы был доступ к id внутри элемента
function createModal(title, body) {
    // Создание модального фона
    const modalEl = document.createElement('div');
    modalEl.classList.add('modal', 'fade', 'd-block');
    modalEl.setAttribute('role', 'dialog');
    modalEl.setAttribute('aria-modal', 'true');
    modalEl.style.display = 'block';

    // Диалоговое окно
    const modalDialog = document.createElement('div');
    modalDialog.classList.add('modal-dialog', 'modal-dialog-centered', 'modal-lg');

    // Содержимое 
    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');

    // Шапка
    const modalHeader = document.createElement('div');
    modalHeader.classList.add('modal-header');

    const modalTitle = document.createElement('h5');
    modalTitle.classList.add('modal-title');
    modalTitle.textContent = title;

    const closeButton = document.createElement('button');
    closeButton.classList.add('btn-close');
    closeButton.setAttribute('data-bs-dismiss', 'modal');
    closeButton.setAttribute('aria-label', 'Close');

    // Тело
    const modalBody = document.createElement('div');
    modalBody.classList.add('modal-body');

    // Сохраняем ссылку на исходный элемент (если он был)
    let originalElement = null;

    if (body == null) {
        // body === undefined, null, 0, false, '' — игнорируем
        modalBody.innerHTML = '';
    } else if (typeof body === 'string') {
        modalBody.innerHTML = body;
    } else if (body instanceof HTMLElement) {
        // Переносим содержимое из существующего DOM-элемента
        originalElement = body; // запоминаем для восстановления
        modalBody.innerHTML = body.innerHTML;
        body.innerHTML = ''; // очищаем исходник
    } else {
        // Неожиданный тип — безопасно преобразуем в строку
        modalBody.innerHTML = String(body);
    }

    // Сборка
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeButton);
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalDialog.appendChild(modalContent);
    modalEl.appendChild(modalDialog);
    document.body.appendChild(modalEl);

    // Инициализация Bootstrap Modal
    const modalInstance = new bootstrap.Modal(modalEl);
    modalInstance.show();

    // Обработка закрытия
    modalEl.addEventListener('hidden.bs.modal', () => {
        // Восстанавливаем содержимое, только если был передан DOM-элемент
        if (originalElement) {
            originalElement.innerHTML = modalBody.innerHTML;
        }
        modalEl.remove();
    });

    return modalBody;
}





//функция инейной интерполяции, значение val из массы object const data = {0: 0.018, 0.25: 0.026, ...}
function interpolate(val, object) {
    // Преобразуйте ключи объекта в числовые значения, отсортированы по возрастанию
    const keys = Object.keys(object).map(parseFloat).sort((a, b) => a - b);

    // Найдите два ближайших значения высоты в объекте
    let i = 0;
    while (i < keys.length - 1 && keys[i] < val) {
      i++;
    }
  
    // Выполните линейную интерполяцию
    if (i === 0) {
      return object[keys[0]];
    } else if (i === keys.length - 1) {
      return object[keys[keys.length - 1]];
    } else {
      const x1 = keys[i - 1];
      const y1 = object[x1];
      const x2 = keys[i];
      const y2 = object[x2];
      const slope = (y2 - y1) / (x2 - x1);
      const intercept = y1 - slope * x1;
      return slope * val + intercept;
    }
}




//modal w - функции для двойной интерполяции значения n на основе данных в объекте data (таблица A.1 ТКП) //https://sopromat.xyz/calculators?name=bilinearinterpolation
function modal_w_findN(velocity, temperature, _data) {
    // === ПОИСК ГРАНИЦ СКОРОСТИ ===
    let lowerVelocity, upperVelocity;
    let lowerIndex, upperIndex;
    
    for (let i = 0; i < _data.length - 1; i++) {
        if (_data[i].velocity <= velocity && _data[i + 1].velocity >= velocity) { // ИСПРАВЛЕНО: >= вместо >
            lowerVelocity = _data[i].velocity;
            upperVelocity = _data[i + 1].velocity;
            lowerIndex = i;
            upperIndex = i + 1;
            break;
        }
    }
    
    if (lowerVelocity === undefined || upperVelocity === undefined) {
        console.error('Не удалось найти ближайшие значения скорости:', velocity);
        return null;
    }
    
    // === ПОИСК ГРАНИЦ ТЕМПЕРАТУРЫ ===
    let lowerTemp, upperTemp;
    let lowerTempIndex, upperTempIndex;
    
    for (let i = 0; i < _data[0].temp.length - 1; i++) {
        if (_data[0].temp[i] <= temperature && _data[0].temp[i + 1] >= temperature) { // ИСПРАВЛЕНО: >= вместо >
            lowerTemp = _data[0].temp[i];
            upperTemp = _data[0].temp[i + 1];
            lowerTempIndex = i;
            upperTempIndex = i + 1;
            break;
        }
    }
    
    if (lowerTemp === undefined || upperTemp === undefined) {
        console.error('Не удалось найти ближайшие значения температуры:', temperature);
        return null;
    }
    
    // === РАСЧЁТ КОЭФФИЦИЕНТОВ ИНТЕРПОЛЯЦИИ ===
    const velocityRatio = (velocity - lowerVelocity) / (upperVelocity - lowerVelocity);
    const tempRatio = (temperature - lowerTemp) / (upperTemp - lowerTemp);
    
    // === ПОЛУЧЕНИЕ ЗНАЧЕНИЙ n ===
    const n11 = _data[lowerIndex].n[lowerTempIndex];
    const n12 = _data[lowerIndex].n[upperTempIndex];
    const n21 = _data[upperIndex].n[lowerTempIndex];
    const n22 = _data[upperIndex].n[upperTempIndex];
    
    // === ДВОЙНАЯ ИНТЕРПОЛЯЦИЯ ===
    let n = n11 * (1 - velocityRatio) * (1 - tempRatio) +
            n12 * (1 - velocityRatio) * tempRatio +
            n21 * velocityRatio * (1 - tempRatio) +
            n22 * velocityRatio * tempRatio;
    
    return +n.toFixed(1);
}


//при инициализаци (переходе к кадру goto(k_1)) кадра подставляются из БД или data необходимые данные (см. инфо)
//например data-num="4"  (молярная масса) или data-obj="room_Tr" (подставляется температура)
function init_kadr(k_id) {
    if (current_gm == undefined) return //если не назначено текущее вещество, то отбой

	//для inputs и span где можно проставить данные из БД
	let elem = k_id

    if (elem.querySelector('.current_gm')) {  //span.current_gm  - имя вещества
        elem.querySelector('.current_gm').textContent = current_gm[0]
    }

	let inputs = elem.querySelectorAll('input.init')

    for (let inp of inputs) {
		let num = +inp.dataset.num

        inp.checked = false
        
		if (inp.dataset.num && current_gm[num] !== undefined) {
			if (inp.type == 'number' || inp.type == 'number') {
                if (inp.type == 'number') inp.value = Number(current_gm[num].replace(",", "."));
                if (inp.type == 'text') inp.value = current_gm[num];
                
                inp.classList.add('text-success')

                // Функция обработчика события
                const changeHandler = () => {
                    // Убираем класс зеленого шрифта
                    inp.classList.remove('text-success');

                    // Убираем обработчик события
                    inp.removeEventListener('change', changeHandler);
                };

                // Добавляем обработчик события для отслеживания изменений
                inp.addEventListener('change', changeHandler);
                
			} else {
				inp.value = current_gm[num]
			}
		}

		if (inp.dataset.obj) {
			inp.value = data[inp.dataset.obj]
		}
	}
}

//функция очистки в кадре всех инпут кроме .init - при повторном расчете например массы, чтобы не работать с данными от предыдущих веществ
function clear_inputs_kadr(k_id){

    // Очищаем text и number inputs, кроме тех, что имеют класс .init
    k_id.querySelectorAll('input[type="text"]:not(.init), input[type="number"]:not(.init)').forEach(inp => {
        inp.value = '';
    });
    
    // Снимаем галочки с checkbox и radio
    k_id.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(chk => {
        chk.checked = false;
    });
}

//функция принимает инпут и преобразует его значение в число, если есть второй параметр, то округлит его до данного кол-ва знаков
function _n(input, i) {
    // Проверяем, заполнено ли поле
    if (input.value == '') {
        animate_input_empty(input); // Подсветить
        return;
    }

    // Преобразуем значение input в число
    let value = Number(input.value.replace(",", "."));

    // Проверяем, является ли value числом
    if (!isNaN(value)) {
        // Если i задан, округляем до указанного количества знаков после запятой
        if (i !== undefined) return parseFloat(value.toFixed(i));

        // Возвращаем значение без округления
        return value;
    } else {
        return null; // Или другое значение по умолчанию
    }
}

//преобразуем input в число (внимание! не округляя его, как остальные функции) и возвращает рез-т
function __n(input) {
    return parseFloat(input.value)
}

//функция анализирует полученное значение, если это число то округляет его до i (по умолчанию 2)
function _nf(val, i) {
    // Преобразуем val в строку, если это необходимо (чтобы корректно работал REPLACE попытка использовать методы строк приведет к ошибкам)
    val = val.toString();

    // Заменяем запятую на точку только если запятая присутствует
    if (val.includes(',')) {
        val = val.replace(',', '.');
    }

    // Преобразуем val в число
    val = Number(val);

    // Проверяем, является ли val числом
    if (!isNaN(val)) {
        // Устанавливаем количество знаков после запятой
        const decimalPlaces = (i !== undefined) ? i : 2;
        // Округляем и возвращаем как число
        return parseFloat(val.toFixed(decimalPlaces));
    } else {
        // Возвращаем null или пустую строку, если val некорректен
        return null; // или return '';
    }  
}


function animateInput(inputElement, color, duration) {
    const rgbaColor = color === 'red' ? 'rgba(255, 0, 0, 0.1)' : 'rgba(0, 0, 255, 0.05)'; // Прозрачный цвет фона

    inputElement.style.transition = `border-color ${duration}ms, color ${duration}ms, background-color ${duration}ms`;
    inputElement.style.borderColor = color;
    inputElement.style.color = color;
    inputElement.style.backgroundColor = rgbaColor; // Задаем прозрачный цвет фона

    setTimeout(() => {
        inputElement.style.borderColor = '';
        inputElement.style.color = '';
        inputElement.style.backgroundColor = ''; // Возвращаем исходный цвет фона
    }, duration);
}


//функция из expression выделяет значения input, выполняет мат. операции в expressin, если есть kf - умножает результат на него и присваивает inp
//kf используется если помимо input необходимо использовать переменные
//calc(k4_as1_m_res, '0.01*av_gg_1_p*av_gg_1_v*av_gg_1_ro', data.vent_kf)
function calc(inp, expression, kf = 1) {
    // 1. Проверяем: если выражение — чистое число, сразу используем его
    const pureNumber = parseFloat(expression.trim());
    if (!isNaN(pureNumber) && /^\s*-?\d+(\.\d+)?\s*$/.test(expression)) {
        const result = formatNumber(pureNumber * kf);
        inp.value = result;
        animateInput(inp, 'blue', 600);
        return;
    }

    // 2. Ищем переменные (только если есть буквы)
    const inputs = expression.match(/[a-zA-Z]\w*/g);
    const values = {};
    const inputs_arr = [];
    let hasError = false;

    if (inputs) {
        for (const inputId of inputs) {
            const inputElement = document.getElementById(inputId);
            
            // Если инпут не найден — подставляем 0 автоматически
            if (!inputElement) {
                console.warn(`Input #${inputId} not found, using 0`);
                values[inputId] = 0;
                continue;
            }

            inputs_arr.push(inputElement);
            const value = parseFloat(inputElement.value.trim());

            if (isNaN(value)) {
                animateInput(inputElement, 'red', 1000);
                values[inputId] = 0; // Вместо прерывания — используем 0
                hasError = true;
            } else {
                values[inputId] = value;
            }
        }

        saveInputs(inputs_arr, inp);
    }

    // 3. Подставляем значения в выражение
    let evalExpression = expression;
    for (const [key, val] of Object.entries(values)) {
        evalExpression = evalExpression.replace(new RegExp(`\\b${key}\\b`, 'g'), val);
    }

    // 4. Вычисляем результат
    try {
        // Защита от деления на ноль в строке
        if (/\/\s*0(\D|$)/.test(evalExpression)) {
            throw new Error('Division by zero');
        }

        let result = eval(evalExpression);
        if (typeof result !== 'number' || isNaN(result)) {
            throw new Error('Invalid calculation result');
        }

        result = formatNumber(result * kf);
        inp.value = result;
        animateInput(inp, 'blue', 600);
    } catch (error) {
        console.error('Calculation error:', error.message);
        inp.value = null;
        if (!hasError) animateInput(inp, 'red', 1000);
    }
}

//просто возвращает результат, в exression вставляет идентификаторы input
//let v1 = calc_value('av_gj_5_2_q * av_gj_5_2_T') //объем подачи
function calc_value(expression) {
    // Находим все идентификаторы в выражении
    const inputs = expression.match(/[a-zA-Z]\w*/g);
    const values = {};
    let allValid = true; // Флаг для проверки валидности всех инпутов

    if (inputs != null) { // Если инпут есть в строке
        for (const inputId of inputs) {
            const inputElement = document.getElementById(inputId);
            if (!inputElement) {
                console.error(`Input with id ${inputId} not found`);
                allValid = false; // Устанавливаем флаг в false, если элемент не найден
                continue; // Переходим к следующему идентификатору
            }

            const value = parseFloat(inputElement.value);
            if (isNaN(value) || inputElement.value.trim() === '') {
                console.warn(`Value for ${inputId} is invalid:`, inputElement.value);
                allValid = false; // Если значение некорректное
                animateInput(inputElement, 'red', 1000); // Анимация некорректного значения
            } else {
                values[inputId] = value; // Сохраняем корректное значение
            }
        }
    }

    if (!allValid) {
        console.error("Not all input values are valid.");
        return null; // Если есть некорректные значения, возвращаем null
    }

    // Заменяем id на их значения в выражении
    let evalExpression = expression;

    for (const [key, val] of Object.entries(values)) {
        evalExpression = evalExpression.replace(new RegExp(`\\b${key}\\b`, 'g'), val);
    }

    try {
        // Проверка на деление на ноль
        if (evalExpression.includes('/0')) {
            throw new Error('Division by zero is not allowed');
        }

        // Вычисляем результат
        let result = eval(evalExpression);
        return formatNumber(result); // Возвращаем отформатированный результат
    } catch (error) {
        console.error(`Error evaluating expression: ${error.message}`);
        return null; // Возвращаем null при ошибке
    }
}


//красивое форматирование в зависимости от разряда числа, определяет степень округления
function formatNumber(value) {
    value = parseFloat(value)

    // Проверка на ноль
    if (value === 0) {
        return 0;
    }

    if (value > 1000000 || value < 0.0001) {
        // Научный формат для чисел больше 1,000,000 или меньше 0.0001
        return value.toExponential(2);
    } else if (value >= 10000) {
        // Округление до 0 знаков после запятой для значений от 1 до 1,000,000
        return parseFloat(value.toFixed(0));
    } else if (value >= 1000) {
        // Округление до 1 знаков после запятой для значений от 1 до 1,000,000
        return parseFloat(value.toFixed(1));
    } else if (value >= 100) {
        // Округление до 2 знаков после запятой для значений от 1 до 1,000,000
        return parseFloat(value.toFixed(2));
    } else if (value >= 1) {
        // Округление до 3 знаков после запятой для значений от 1 до 1,000,000
        return parseFloat(value.toFixed(3));
    } else if (value >= 0.1) {
        // Округление до 3 знаков после запятой для значений от 0.1 до 1
        return parseFloat(value.toFixed(3));
    } else if (value >= 0.01) {
        // Округление до 5 знаков после запятой для значений от 0.001 до 0.1
        return parseFloat(value.toFixed(4));
    } else if (value >= 0.001) {
        // Округление до 5 знаков после запятой для значений от 0.001 до 0.1
        return parseFloat(value.toFixed(5));
    } else {
        // Научный формат для чисел меньше 0.0001
        return value.toExponential(2);
    }
}

//Она принимает либо один элемент input, либо массив элементов input в качестве первого параметра, и аналогично для второго параметра. 
//Функция будет навешивать слушатель на изменения в каждом из инпутов первого параметра и очищать инпуты второго параметра при каждом изменении.
//saveInputs(inputs_arr, inp); т.е. inp очищается пока вводятся данные (событие input) в инпуты inputs_arr
function saveInputs(inputsToWatch, inputsToClear) {
    // Приводим к массиву, если передан один элемент
    if (!(inputsToWatch instanceof Array)) {
        inputsToWatch = [inputsToWatch];
    }
    if (!(inputsToClear instanceof Array)) {
        inputsToClear = [inputsToClear];
    }

    // Функция для очистки инпутов
    function clearInputs() {
        inputsToClear.forEach(input => {
            if (input instanceof HTMLInputElement) {
                input.value = ''; // Очищаем значение инпута
            }
        });
    }

    // Навешиваем слушатели на инпуты для отслеживания изменений
    inputsToWatch.forEach(input => {
        if (input instanceof HTMLInputElement) {
            input.addEventListener('input', clearInputs);
        }
    });
}

// Функция для поиска дублирующихся id с указанием пути
function findDuplicateIdsWithPaths() {
    const elements = document.querySelectorAll('*'); // Получаем все элементы на странице
    const idCount = {}; // Объект для хранения количества каждого id

    // Проходим по всем элементам и считаем количество вхождений id
    elements.forEach((element) => {
        const id = element.id;
        if (id) { // Проверяем, существует ли id
            // Создаем путь к элементу
            const path = getElementPath(element);
            idCount[id] = idCount[id] || []; // Инициализируем массив для хранения путей
            idCount[id].push(path); // Добавляем путь к массиву
        }
    });

    // Находим дубликаты
    const duplicates = Object.entries(idCount).filter(([id, paths]) => paths.length > 1);

    // Выводим дубликаты в консоль
    if (duplicates.length > 0) {
        console.log('Найдены дублирующиеся id:');
        duplicates.forEach(([id, paths]) => {
            console.log(`ID: "${id}" встречается ${paths.length} раз(а).`);
            paths.forEach(path => console.log(`  Путь: ${path}`));
        });
    } else {
        console.log('Дублирующиеся id не найдены.');
    }
}

// Функция для получения пути к элементу
function getElementPath(element) {
    const path = [];
    while (element) {
        const selector = element.tagName.toLowerCase() + (element.id ? `#${element.id}` : '');
        path.unshift(selector); // Добавляем селектор в начало массива
        element = element.parentElement; // Переходим к родителю
    }
    return path.join(' > '); // Возвращаем путь в виде строки
}


/**
 * Раскодировать сжатый массив compressed и возвращаем полный массив (19 элементов, пустые как "")
 * до ["Ацетон", "1183", "C3H6O", "@3", "790.8", "@2", "лвж", "-18"];
 * const full = decompressSubstance(compressed);
 * после ["Ацетон", "1183", "C3H6O", "", "", "", "790.8", "", "", "лвж", "-18"]* 
 */
function decompressSubstance(compressed) {
    if (!Array.isArray(compressed)) return [];
    const result = [];
    for (const item of compressed) {
        if (typeof item === 'string' && item.startsWith('@')) {
            const count = parseInt(item.slice(1), 10);
            if (!isNaN(count) && count > 0) {
                for (let i = 0; i < count; i++) {
                    result.push('');
                }
                continue;
            }
        }
        result.push(item);
    }
    return result;
}


//функцию загрузки json из db запускаем при нажитии кнопки рассчитать во 2 кадре
async function loadGmData() {
    if (GM && EXPLOSIVE_NAMES) return;

    // Загружаем оба файла параллельно
    const [gmRes, namesRes] = await Promise.all([
        fetch('/scripts/gm.json'),
        fetch('/scripts/explosive_names.json')
    ]);

    GM = await gmRes.json();
    EXPLOSIVE_NAMES = await namesRes.json();
}

