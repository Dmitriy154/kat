// НАВИГАЦИЯ МЕЖДУ КАДРАМИ
const k_i = [k_0, k_1, k_2, k_3, k_4, k_5, k_6, k_7, k_8, k_9, k_10, k_11, modal_block] //все кадры

function init_stage(param = true) {             //эту функцию запускать при выпуске приложения, по умолчанию true, если false, обратные действия
	if (param) {
		for (let kadr of k_i) { 
			kadr.hidden = false 
			//отображаем на всю высоту экрана
			kadr.style.display = 'block'; 
			kadr.style.height = 'calc(100vh)';      // вся высота экрана без хедера
			kadr.style.overflowY = 'auto';         // если контента больше — скролл
			kadr.style.padding = '0';              // убираем padding из .container p-1
			kadr.style.boxSizing = 'border-box';   // чтобы padding не увеличивал размер 
		}
		for (let k of k_i) { //скрываем все кадры, кроме необходимого
			k.hidden = true
		}
		k_0.hidden = false
	} else {

		for (let kadr of k_i) { 
			kadr.hidden = false;
			kadr.style.display = 'block';
			kadr.style.height = '';           // сброс высоты
			kadr.style.overflowY = '';        // сброс overflow
			kadr.style.padding = '';          // сброс padding
			kadr.style.boxSizing = '';        // сброс box-sizing
		}
	}
}


//простая функция отображения кадра + доп. параметры : num - id кадра (k_1) ! Не строка
let gmDataLoading = false;  // флаг загрузки данных
let gmDataLoaded = false;   // флаг успешной загрузки данных

function goto (k_id) {
	
	init_kadr(k_id) //инит запускаем после очистки!??? а если нужно сохранить данные

	//устанавливаем имя текущего вещества
	let gm = k_id.querySelector('span.name_current_gm')
	if (current_gm !== undefined && gm) gm.textContent = current_gm[0] 

	if (k_id == k_2) {
		// Если данные уже загружены, просто активируем кнопку
		if (gmDataLoaded) {
			btn_k2_next.disabled = false;
			btn_k2_next.innerHTML = 'Далее &gt;';
		} 
		// Если идет загрузка, кнопка остается заблокированной с сообщением
		else if (gmDataLoading) {
			btn_k2_next.disabled = true;
			btn_k2_next.innerHTML = 'Загрузка данных...';
		}
		// Если загрузка еще не началась, запускаем её
		else {
			btn_k2_next.disabled = true;
			btn_k2_next.innerHTML = 'Загрузка...';
			gmDataLoading = true;

			loadGmData().then(() => {
				gmDataLoading = false;
				gmDataLoaded = true;
				btn_k2_next.disabled = false;
				btn_k2_next.innerHTML = 'Далее &gt;';
				// Уведомляем пользователя, что данные загружены
				console.log('Данные загружены, кнопка "Далее" активирована');
			}).catch(err => {
				console.error('Ошибка загрузки GM:', err);
				gmDataLoading = false;
				btn_k2_next.disabled = false;
				btn_k2_next.innerHTML = 'Далее &gt;';
				alert('Ошибка загрузки данных, вы можете продолжить расчет без справочных данных. Сообщиете администратору об ошибке, спасибо!');
			});
		}
	}

	// Обработка перехода к кадру 3
	if (k_id == k_3) {
		// Проверяем, идет ли еще загрузка данных
		if (gmDataLoading) {
			alert('Данные еще загружаются. Пожалуйста, подождите немного и нажмите кнопку "Далее" снова.');
			// Возвращаемся обратно на кадр 2
			goto(k_2);
			return;
		}
		
		// Если данные не загружены и не грузятся, пробуем загрузить
		if (!gmDataLoaded) {
			btn_k2_next.disabled = true;
			btn_k2_next.innerHTML = 'Загрузка...';
			gmDataLoading = true;

			loadGmData().then(() => {
				gmDataLoading = false;
				gmDataLoaded = true;
				// После загрузки переходим к кадру 3
				create_select_GM_3();
			}).catch(err => {
				console.error('Ошибка загрузки данных для кадра 3:', err);
				gmDataLoading = false;
				alert('Ошибка загрузки справочных данных. Попробуйте перезагрузить страницу.');
				goto(k_2);
				return;
			});
			return;
		}

		// Очищаем текущее вещество
		current_gm = null
		create_select_GM_3();
	}

	if (k_id == k_4) {
		//при повторном входе выставляем снова как требуется
		block_4_1.hidden = block_4_2.hidden = block_4_3.hidden = true    //скрываем блоки разых аварийных вариантов
		clear_inputs_kadr(k_4) 		//доп. очистка
	}

	if (k_id == k_5) {
		block_5_0_1.hidden = block_5_0_2.hidden = false //отображаем блок исходных данных

		let blocks_i = [block_5_1,block_5_2,block_5_3,block_5_4,block_5_5,block_5_6]

		//скрываем блоки, которые отображаются при выделении соответствующих checkbox
		blocks_i.forEach(block => {
			block.hidden = true   
		})
	 
		btn_5_calc.parentNode.hidden = true //скрываем кнопки расчет и назад  
		block_5_result.hidden = true // скрываем блок с результатами
		clear_inputs_kadr(k_5) 		//доп. очистка
	}

	if (k_id == k_6) {
		clear_inputs_kadr(k_6) 		//доп. очистка
	}

	if (k_id == k_8) {
		console.log('переход к кадру 8')
	}


	for (let k of k_i) { //скрываем все кадры, кроме необходимого
		k.hidden = true
	}
	
    k_id.hidden = false
    current_kadr = k_id
    // Опционально: прокрутка
    window.scrollTo(0, 0);
}

function new_rachet() {
	//полное обновление select_VV это DOM строка поиска, нужно ее обнулить??

}



