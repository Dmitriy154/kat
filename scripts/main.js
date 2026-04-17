//создаваемые элементы DOM необходимо помечать классом cr_elem, потом удалять при сохранении или экспорте
let body_modal              //в данную переменную копируем содержимое модульного окна, используем для проверки заполения input
let temp = null             //временная переменная для отдельной закрытой операции (после назначения значения, очищать переменную)
let current_gm              //текущее вещество (массив), ссылка на соответствующее вещество в arr_GM_vz или arr_GM
let current_kadr = k_0      //текущий кадр
let data_modal_w_u          // данные таблицы А.1 (коэфф-т при скорости воздуха)

// ДЛЯ ТЕСТА
test_kadr = k_5

// Функция-обработчик для события "keydown" (для сочетания клавиш Ctrl + пробел   -   тестирование)
function handleCtrlTKeypress(event) {
    let field_name_gm = current_kadr.querySelector('p > span.current_gm') //поле с названием рассчитываемого вещества
	// Проверяем, были ли нажаты клавиши Ctrl и T
	if (event.ctrlKey && event.key === ' ') {
	  // Выполняем необходимые действия
	  console.log('Нажато тестирование...');
	  // Дополнительные действия, например:
	  let test_gm = ["толуол","2361","c7h8","2,24","92,14","866,9","40936","40,94","вещество","лвж","7","1,27","","634","6,0507","1328,171","217,713","-26,7 до 110,6"]
      current_gm = test_gm
      current_kadr = test_kadr //для ГЖ
      //modal_block.hidden = false //???
      if (field_name_gm) field_name_gm.textContent = current_gm[0]
      goto(test_kadr) //ТЕСТ
      init_kadr(test_kadr) //для заполнения span и input данными справки
	}

    if (event.ctrlKey && event.altKey) {
        console.log('режим разработки....')
        //обратный процесс инициализациии!!!!!
        let names = stage.querySelectorAll('span.current_gm')
        names.forEach (_text => {
            _text.textContent = '...'
        })

        if (field_name_gm) field_name_gm.textContent = '...'
        
        let inputs = current_kadr.querySelectorAll('input.init')
        
        for (let inp of inputs) {  //обратный откат к пустым значениям для input.init текущего кадра (тестового одного)
            inp.value = ''
        }
        current_gm = null
        
        init_stage(false); //все кадры видимы, сброс стилей подгона под размер

        let hiddenDivs = stage.querySelectorAll('div[hidden].row, div[hidden][class^="col-"]') //скрытые строки и колонки делаем видимыми
        hiddenDivs.forEach(div => {
            if (!div.classList.contains('no_hide')) { // не отображаем только div с классом 'no_hide' , например для чеков аварийная вентиляция
                div.hidden = false;
            }
        })
    }
  }
  
// Добавляем обработчик на событие keydown
document.addEventListener('keydown', handleCtrlTKeypress);


//init_stage(); //оставляем видимым только первый кадр , растягиваем его

document.addEventListener('DOMContentLoaded', () => {
    init_stage();
});

//подключаем стили
let style = cr('style')
style.type = 'text/css'

style.innerHTML = `
    .mobi_text { font-size: 1em; }
    @media (max-width: 767.98px) { 
    .mobi_text { font-size: 0.7em; }
    }
`
document.head.appendChild(style)

//внимание! если передаем массив, значит в нем уже вещества из БД, если одно в-во, то или пользовательское или из БД
function add_gm_in_table(arr) {
    let arr_add_gm =[] //массив добавляемых взрывоопасных веществ
    let user_gm = false
    empty_row.hidden = true //скрываем первую пустую строку

    arr.forEach(name => {
        // Проверяем, есть ли вещество в GM
        if (!GM.some(innerArray => innerArray[0] === name)) {   //вещества нет в GM
            console.log('добавляем пользовательский материал ' + arr[0])
            let new_row = t_row.cloneNode(true)
            row_title_for_VV.append(new_row)
            new_row.querySelector('div.name').textContent = arr[0]
            new_row.querySelector('div.data').innerHTML =`
                <select onchange="this.gm[9] = this.value" class="form-select form-select-sm">
                    <option value="0">Выбрать тип ГМ</option>
                    <option value="гг">ГГ</option>
                    <option value="лвж">ЛВЖ</option>
                    <option value="гж">ГЖ</option>
                    <option value="гп">ГП</option>
                </select>
            `

            let inp_massa = new_row.querySelector('input[type="number"]')
            inp_massa.classList.add('massa')

            let btn = new_row.querySelector('button')
            btn.addEventListener('click', btn_table_gm_click)
            
            if (!arr_GM_vz.some(item => item[0] === name)) { //добавляем пользовательское вещество в массив arr_GM_vz не дублируя его
                let add_arr = [name]
                
                add_arr.inp_massa = inp_massa
                add_arr.btn_1 = btn
                arr_GM_vz.push(add_arr)
                
                new_row.querySelector('select').gm = add_arr //привязываем к селект ссылку на вещество и аттрибут onchange="this.gm[9] = this.value" 
            }

        } else {    //вещество есть в GM
            if (arr_GM_vz.some(innerArray => innerArray[0] === name)) { //вещество есть в arr_GM_vz
                //пропускаем
            } else {                                                    //вещества нет в arr_GM_vz
                const compressed = GM.find(innerArray => innerArray[0] === name);
                if (compressed) {
                    const full = decompressSubstance(compressed); // ← раскодируем!
                    arr_add_gm.push(full);
                    arr_GM_vz.push(full);
                }
            } 
        }
    })
    add_row_in_table(arr_add_gm)  //добавляем строку в таблицу, обходя массив
} 

//дополнение функции add_gm_in_table
function add_row_in_table (arr) {

    arr.forEach(gm => {
        let new_row = t_row.cloneNode(true)
        row_title_for_VV.append(new_row)
        new_row.querySelector('div.name').textContent = gm[0]

        let inp_massa = new_row.querySelector('input[type="number"]')
        inp_massa.classList.add('massa')

        let div_data = new_row.querySelector('div.data')
        div_data.textContent = gm[9] 
        if (gm[8] !== '') div_data.textContent += ' (' + gm[8] + ')'
        if (!isNaN(gm[1]) && gm[1] !== '0') {
            div_data.textContent += ', индивидуальное вещество'
        }
        if (gm[1] == 's' || gm[2].includes('*')) {
            div_data.textContent += ', смесь'
        }
        if (div_data.textContent != '') div_data.innerHTML = '<small>' + div_data.textContent +'</small>'
        
        //ссылка на input в таблице с массой
        gm.inp_massa = inp_massa
        
        //поиск ссылки в основном массиве arr_GM_vz
        gm_arr = arr_GM_vz.find(subArray1 => 
            subArray1.length >= gm.length && 
            gm.every((value, index) => value === subArray1[index])
        );
        
        let btn = new_row.querySelector('button')
        btn.addEventListener('click', btn_table_gm_click)
        
        gm_arr.inp_massa = inp_massa
        gm_arr.btn_1 = btn
    })
}


//функция нажатия кнопки РАСЧЕТ в строках таблицы 3 кадра
function btn_table_gm_click() {
    current_gm = arr_GM_vz.find(subArray => subArray.btn_1 === this) 
    
    if (current_gm[9]) {      
        if (current_gm[9] == "гг") current_kadr = k_4
        if (current_gm[9] == "гж" || current_gm[9] == "лвж") current_kadr = k_5
        if (current_gm[9] == "гп") current_kadr = k_6

    } else { 
        //пользовательское вещество
        alert('Укажите тип вашего вещества (2 колонка)')
        return
    }

    goto(current_kadr) //делаем очистку от предыдущих веществ
    //задаем имя рассматриваемому веществу
    current_kadr.querySelector('p > span.text-decoration-underline').textContent = current_gm[0]
    window.scrollTo(0, 0) //прокрутка в начало
    
}




k3_btn_clear_table.onclick = ()=> {
    //удаляем все видимые строки + отображаем ранее скрытую строку
    row_title_for_VV.innerHTML= ''
    
    row_title_for_VV.append(head_table)
    row_title_for_VV.append(empty_row)
    head_table.hidden = empty_row.hidden = false
    arr_GM_vz.length = 0 //очищаем массив выбранных взрывоопасных материалов и все ссылки на него
}


// k4  РАСЧЕТ ГГ -------------------------------------------------------------------------------------------------------------


// K4. выбор аварийной ситуации (из 3-х radio)
btn_change_avaria_gg.onclick = ()=> {
    let radios = document.querySelectorAll('input[name="rad_vv_gg_avaria"]');
    
    radios.forEach((radio) => {
        if (radio.checked) {
            document.getElementById(radio.value).hidden = false
        } else {
            document.getElementById(radio.value).hidden = true
        }
    })
    block_4_0.hidden = true
}


//  K4_1 аварийная ситуация 1 - аппарат  : реализовано в кнопке
div_btn_next_k4_as1.hidden = true //скрываем кнопку далее

btn_calk_k4_as1.onclick = ()=> {
    calc(k4_as1_m_res, '0.01*av_gg_1_p*av_gg_1_v*av_gg_1_ro', data.vent_kf)
    div_btn_next_k4_as1.hidden = false //отображаем кнопку далее
    current_gm.massa = k4_as1_m_res.value
    current_gm.inp_massa.value = current_gm.massa
    current_gm[4] = av_gg_1_M.value; /////////////////////


}

//  K4_2 аварийная ситуация 1 - аппарат + трубопровод  ***************************
div_btn_next_k4_as2.hidden = true //скрываем кнопку далее

// K4_2 добавление трубопровода
row_4_2_btn_add_truba.previousSibling.querySelector('button.btn-close').hidden = false //чтобы при сохранении крестик снова отображался
let row_truba = row_4_2_btn_add_truba.previousSibling.cloneNode(true)
let btn_close1 = row_4_2_btn_add_truba.previousSibling.querySelector('button.btn-close') 
btn_close1.hidden = true //скрываем крестик у первой строки

btn_4_2_add_truba.onclick = ()=> {
    if (!btn_close1.hidden) btn_close1.hidden = true //скрываем крестик у первой строки
    let new_row = row_truba.cloneNode(true)
    row_4_2_btn_add_truba.before(new_row)
}

// к_4_2 расчет массы 
btn_calk_k4_as2.onclick = ()=> {
    //находим объем в трубопроводах
    let v2t = 0

    for (let r of block_4_2.querySelectorAll('div.trub')) {
        let Lrr = 1
        let arr = r.querySelectorAll('input')
        for (let i = 0; i < arr.length; i++) {
            if (i==0) Lrr *= arr[i].value
            if (i==1) {
                let r = arr[i].value/2000  //переводим в радиум в м
                Lrr *= r*r
            }
        }
        v2t += Lrr
    }
    
    let formula = `(0.01*av_gg_2_p*av_gg_2_v + (av_gg_2_q*av_gg_2_t_av + 0.01*3.1416*av_gg_2_p_2*${v2t}))*av_gg_2_ro`
    
    let k = parseFloat(1/(data.vent_kr * av_gg_2_t_av.value + 1))
    calc(k4_as2_m_res,formula, k)

    div_btn_next_k4_as2.hidden = false //отображаем кнопку далее
    current_gm.massa = k4_as2_m_res.value
    current_gm.inp_massa.value = current_gm.massa
}


//  K4_3 аварийная ситуация 1 - зарядка АКБ     ************************************
div_btn_next_k4_as3.hidden = true //скрываем кнопку далее

//добавить аккумулятор
btn_4_3_add_akb.onclick = ()=> {
    let sample_div = form_akb.cloneNode(true)
    sample_div.id = ''
    
    //удаляем подсказки
    let div_help_arr = sample_div.querySelectorAll('div.d-inline-block')

    //очищаем поля для новых аккумуляторов
    let inputs = sample_div.querySelectorAll('input[type="number"]') //используем только input type=number
    inputs[0].value = ''
    inputs[2].value = ''

    for(let d of div_help_arr) {
        d.remove()
    }

    row_4_3_btn_add_akb.before(sample_div)  //вставляем перед кнопками
}

btn_4_3_del_akb.onclick = ()=> {
    let samle_div_del = row_4_3_btn_add_akb.previousElementSibling
    if (samle_div_del.id == 'form_akb' ) return
    samle_div_del.remove()
}

// K4_3 расчет массы
btn_calk_k4_as3.onclick = ()=> {
    let sum = 0
    let kf = 1.036 * 1e-8 * (+av_gg_4_3_T.value)
    
    for (let form_block of block_4_3.querySelectorAll('div.akb')){
        let inputs = form_block.querySelectorAll('input[type="number"]') //используем только input type=number
        let _sum = inputs[0].value*(1 - inputs[1].value)*inputs[2].value
        sum += _sum
    }
    let k = parseFloat(1/(data.vent_kr * 3600 + 1))
    calc(k4_as3_m_res, `${kf}*${sum}`, k)  //тут
    
    div_btn_next_k4_as3.hidden = false //отображаем кнопку далее
    current_gm.massa = k4_as3_m_res.value
    current_gm.inp_massa.value = current_gm.massa
}



// k5  РАСЧЕТ паров ЛВЖ и ГЖ ----------------------------------------------------------------------------------------

// k5 _ скрываем блоки . ИНИЦИАЛИЗАЦИЯ
let checks_k_5 = div_checks_k_5.querySelectorAll('input[type="checkbox"]') //выбор аварийных ситуаций
let blocks_i = [block_5_1,block_5_2,block_5_3,block_5_4,block_5_5,block_5_6]

//скрываем блоки, которые отображаются при выделении соответствующих checkbox
blocks_i.forEach(block => {
    block.hidden = true   
})

btn_5_calc.parentNode.hidden = true //скрываем кнопки расчет и назад  
block_5_result.hidden = true // скрываем блок с результатами

// k_5 - отображение необходимых блоков в зависимости от выбранных check при нажатии кнопки "ДАЛЕЕ "
btn_change_avaria_gj.onclick = ()=> {
    
    // проверка на заполнение блока block_dat
    if (!check_inputs_in_elem(block_5_data)) {
        alert('Заполните все поля и продолжите расчет!');
        return;           
    }

    //проверка выбора хотя бы одного check аварии
    let isChecked = Array.from(checks_k_5).some(checkbox => checkbox.checked) //проверка массива
    if (!isChecked) {
        alert('Сделайте выбор аварийной ситуации');
        return;   
    }

    //отображаем блоки согласно выделенным check
    checks_k_5.forEach(inp => {
        let targetDiv = document.getElementById(inp.dataset.target)
        targetDiv.hidden = !inp.checked          
    })

    //сохраняем введенные данные T_isp (время испарения), u_M (молярная масса, если нет или отличается от БД) и u_P_n (давл. насыщенных паров)
    current_gm[4] = av_gj_5_M.value //сохраняем молярную массу (или пересохраняем)
    current_gm[19] = av_gj_5_P.value //сохраняем в новую ячейку массива (всего 18)


    block_5_0_1.hidden = block_5_0_2.hidden =  true //скрываем блок исходных данных
    btn_5_calc.parentNode.hidden = false //отобржаем кнопки расчета и назад
}


//  K5_2 аварийная ситуация 1 - трубопроводы  ***************************

// K5_2 добавление трубопровода
row_5_2_btn_add_truba.previousElementSibling.querySelector('button.btn-close').hidden = false //чтобы при сохранении крестик снова отображался
let row_truba_5_2 = row_5_2_btn_add_truba.previousElementSibling.cloneNode(true)
let btn_close_5_2 = row_5_2_btn_add_truba.previousElementSibling.querySelector('button.btn-close') 
btn_close_5_2.hidden = true //скрываем крестик у первой строки

btn_5_2_add_truba.onclick = ()=> {
    if (!btn_close_5_2.hidden) btn_close_5_2.hidden = true //скрываем крестик у первой строки
    let new_row = row_truba_5_2.cloneNode(true)
    row_5_2_btn_add_truba.before(new_row)

    k_5_f_result.value = k_5_m_result.value = "" //самые последние формы площадь разлива жидкости и масса испарившейся жидкости
}


// K5_3 Добавление открытых поверхностей испарения
row_5_3_add_pov.previousElementSibling.querySelector('button.btn-close').hidden = false //чтобы при сохранении крестик снова отображался
let row_pov_5_3 = row_5_3_add_pov.previousElementSibling.cloneNode(true)
let btn_close_5_3 = row_5_3_add_pov.previousElementSibling.querySelector('button.btn-close') 
btn_close_5_3.hidden = true //скрываем крестик у первой строки

btn_5_3_add_pov.onclick = ()=> {
    if (!btn_close_5_3.hidden) btn_close_5_3.hidden = true //скрываем крестик у первой строки
    let new_row = row_pov_5_3.cloneNode(true)
    row_5_3_add_pov.before(new_row)
}

// K5_6 разгерметизация полимерной или картонной тары со стеклянными бутылками ЛВЖ!

//график для полимерной тары
const data_graf_polimer_tara = {
    0: 0.018, 0.25: 0.026, 0.5: 0.038, 0.75: 0.054, 1.0: 0.080, 1.25: 0.113, 1.5: 0.157, 1.75: 0.214,
    2.0: 0.285, 2.25: 0.371,2.5: 0.463,2.75: 0.559, 3.0: 0.648,3.25: 0.728,3.5: 0.795,3.75: 0.85,4.0: 0.9,5.0: 1};

//график для картонной тары
const data_graf_karton_tara = {
    0: 0.092,0.25: 0.154,0.5: 0.241,0.75: 0.355,1.0: 0.489,1.25: 0.621,1.5: 0.740,1.75: 0.833,
    2.0: 0.897,2.25: 0.939,3.0: 1};     

av_gj_5_6_polimer.checked = true

// K5_6 расчет массы разлитой ЛВЖ
btn_5_6_calc_M.onclick = ()=> {
    if (check_inputs_in_elem([av_gj_5_6_V, av_gj_5_6_h, av_gj_5_6_g], "Заполните все необходимые поля (в т.ч. плотность жидкости)")) { //проверяем заполнение необходимых полей
        let data
        if (av_gj_5_6_polimer.checked)  {
            data = data_graf_polimer_tara
        }  else {
            data = data_graf_karton_tara
        }   
        let E = interpolate(av_gj_5_6_h.value, data)
        av_gj_5_6_E.value =  formatNumber(E)
        //av_gj_5_6_M.value = (E * av_gj_5_6_V.value * av_gj_5_6_g.value).toFixed(2)
        calc(av_gj_5_6_E, `${E}`)
        calc(av_gj_5_6_M, `${E}*av_gj_5_6_V*av_gj_5_6_g`)
    } else {
        av_gj_5_6_E.value = av_gj_5_6_M.value = ''
    }
} 


// K5_Fm - Определение массы жидкости, испаренной с поверхностей разлива

//значения коэффициента ng и u (таблица А.1 ТКП 474) для расчета интенсивности испарения
data_modal_w_u = [
    { velocity: 0.0, temp: [10, 15, 20, 30, 35, 37], n: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0] },
    { velocity: 0.1, temp: [10, 15, 20, 30, 35, 37], n: [3.0, 2.6, 2.4, 1.8, 1.6, 1.6] },
    { velocity: 0.2, temp: [10, 15, 20, 30, 35, 37], n: [4.6, 3.8, 3.5, 2.4, 2.3, 2.3] },
    { velocity: 0.3, temp: [10, 15, 20, 30, 35, 37], n: [5.3, 4.5, 4.1, 2.8, 2.6, 2.6] },
    { velocity: 0.4, temp: [10, 15, 20, 30, 35, 37], n: [6.0, 5.1, 4.7, 3.2, 2.9, 2.8] },
    { velocity: 0.5, temp: [10, 15, 20, 30, 35, 37], n: [6.6, 5.7, 5.4, 3.6, 3.2, 3.1] },
    { velocity: 0.6, temp: [10, 15, 20, 30, 35, 37], n: [7.3, 6.3, 5.9, 4.0, 3.5, 3.4] },
    { velocity: 0.7, temp: [10, 15, 20, 30, 35, 37], n: [7.9, 6.9, 6.4, 4.4, 3.8, 3.7] },
    { velocity: 0.8, temp: [10, 15, 20, 30, 35, 37], n: [8.6, 7.5, 6.8, 4.8, 4.1, 4.0] },
    { velocity: 0.9, temp: [10, 15, 20, 30, 35, 37], n: [9.3, 8.1, 7.3, 5.2, 4.4, 4.3] },
    { velocity: 1.0, temp: [10, 15, 20, 30, 35, 37], n: [10.0, 8.7, 7.7, 5.6, 4.6, 4.4] }
];


//k_5 кнопка "НАЗАД" возврат к исходным данным 4 кадра
btn_5_back_0.onclick = () => {
    block_5_0_1.hidden = block_5_0_2.hidden =  false //отображаем блок исходных данных
    
    //скрываем блоки по каждой аварии
    blocks_i.forEach(block => {
        block.hidden = true   
    })


    btn_5_calc.parentNode.hidden = true //скрываем кнопки расчета и назад
    block_5_result.hidden = true  // скрываем блок с результатами и очищаем результат
    k_5_f_result.value = ''
    k_5_m_result.value = ''

}

// k_5 расчет массы паров жидкости
// анализ заполнения видимых форм блоков check_inputs_in_elem() и выбран хотя бы один check
btn_5_calc.onclick = ()=> {
    let fr = 0                   // общая площадь разлива
    let fr_a = 0                 //площадь разлива от аппарата
    let f_bort = +k5_data_s_bort.value   // площадь бортика
    let mr = 0                   // общая масса разлитой жидкости
    let mi = 0                   // общая масса испаренной жидкости
    let k = k5_data_check_rastvor.checked ? 0.5 : 1  //коэффициент растекания
    const W = +av_gj_5_W.value   //интенсивность испарения
    const T = 3600               //время испарения
    let _T = ''                  // фактическое время испарения по блокам выбираем максимальное (не должно ревысить 3600)
    let T_arr = []               // массив фактических времен испарения различных аварий, выбираем максимальное
    let g = +av_gj_5_6_g.value   //плотсность жидкости
    
    //Метод every перебирает каждый элемент массива blocks_i. Для каждого элемента массива он вызывает функцию check_inputs_in_elem, передавая текущий элемент в качестве аргумента
    let bool = blocks_i.every(check_inputs_in_elem)
    
    if (!bool) {
        alert('Заполните все поля и продолжите расчет!')
        return
    }

    if (!block_5_1.hidden) {
        let v_ap = __n(av_gj_5_1)                    //объем аппарата или един. емкости
        let _mr = v_ap * g                           //масса разлившейся жидкости : объем аппарата * плотность
        fr_a = 1000 * v_ap * k                       // площадь разлива

        if (f_bort) {
            if (fr_a > f_bort) fr_a = f_bort         //если площадь разлива больше площади обваловки
        }

        if (fr_a > data.room_square) fr_a = data.room_square  //площадь разлива не должна превышать площадь пола помещения

        fr += +fr_a.toFixed(3)

        let _mi =  formatNumber(W * fr_a * T)         //масса испарившейся жидкости
        if (_mi > _mr) {
        _mi = _mr                                   //масса испрений не может превышать общую массу
        T_arr.push(_mr / (W * fr_a))                   //добавляем в массив время испарения
        } else {
        _T = 3600
        }
        mi += _mi
    }

    if (!block_5_2.hidden) {
        let v1 = calc_value('av_gj_5_2_q * av_gj_5_2_T') //объем подачи
        
        let v2 = 0 //сумма l*r*r

        for (let r of block_5_2.querySelectorAll('div.trub')) {
            let arr = r.querySelectorAll('input')
            let l, rad = 0

            for (let i = 0; i < arr.length; i++) {
                if (i==0) l = +arr[0].value //а если не назначена ???
                if (i==1) {
                    rad = +arr[1].value/2000    //переводим в радиум в м
                }
            }
            v2 += Math.PI*rad*rad*l
        }

        let v = v1 + v2

        let _mr = +(v * g).toFixed(3)   //масса разлившейся жидкости : объем * плотность
        let _fr = 1000 * v * k          // площадь разлива
        
        if (f_bort) {
            if ((_fr + fr_a) < f_bort) {
                fr = _fr + fr_a
            } else {
                fr = f_bort
            }
        } else {
            fr = _fr + fr_a
        }
        
        if (fr > data.room_square) {                 //площадь разлива не должна превышать площадь пола помещения
        fr = data.room_square 
        _fr = data.room_square - fr_a
        }
        
        let _mi =  W * _fr * T

        if (_mi > _mr) {
        _mi = _mr                                   //масса испрений не может превышать общую массу
        T_arr.push(_mr / (W * fr_a))                //добавляем в массив время испарения
        } else {
        _T = 3600
        }

        mi += _mi
    }

    if (!block_5_3.hidden) {
        let mi_z = 0 //общая масса паров от всех зеркал
        for (let r of block_5_3.querySelectorAll('div.zerkalo')) {
            let arr = r.querySelectorAll('input')
            let _f, _v, _mi, _mg //площадь испарения емкости и объем жидкости, масса паров и масса жидикости
            for (let i = 0; i < arr.length; i++) {
                if (i==1) _f = +arr[i].value
                if (i==2) _v = +arr[i].value
            }
            //поиск массы паров из одной емкости
            _mi = W * _f * T
            _mg = +(g * _v)

            if (_mi > _mg) {
            _mi = _mg                                   //масса испрений не может превышать общую массу
            T_arr.push(_mg / (W * fr_a))               //добавляем в массив время испарения
            } else {
            _T = 3600
            }

            mi_z += _mi 
        }
        mi_z = formatNumber(mi_z)
        mi += mi_z
    }

    if (!block_5_4.hidden) {
        let _mg = +av_gj_5_4_m.value     //масса нанесенной жидкости
        let _f = +av_gj_5_4_s.value      //площадь нанесения
        let _mi = W * _f * T             //масса паров

        if (_mi > _mg) {
        _mi = _mg                                   //масса испрений не может превышать общую массу
        T_arr.push(_mg / (W * fr_a))                //добавляем в массив время испарения
        } else {
        _T = 3600
        }
        _mi = formatNumber(_mi)
        mi += _mi
    }

    if (!block_5_5.hidden) {
        let _mi = formatNumber(av_gj_5_5.value)
        mi += _mi
        _T = 3600
    } 

    if (!block_5_6.hidden) {
        if (!av_gj_5_6_M.value) btn_5_6_calc_M.click() //если ранее не была рассчитана масса в блоке, то расчитать
        
        let _mg = +av_gj_5_6_M.value    //масса разлитой жидкости
        let _v = _mg / g                //объем разлитой жидкости

        let _fr = 1000 * _v * k         // площадь разлива
        if (fr > 0) {
            alert('Предупреждение! Вы выбрали несколько вариантов аварий, которые не могут произойти одновременно.')
            return
        }

        if (f_bort) {
            if (_fr >= f_bort) {
                _fr = f_bort            //если площадь разлива больше площади обваловки
            } 
        }
        fr = _fr

        let _mi =  W * _fr * T
        
        if (_mi > _mg) {
        _mi = _mg                      
        T_arr.push(_mg / (W * fr_a))          //добавиться все равно один элемент массива
        } else {
        _T = 3600
        }

        _mi = formatNumber(_mi)
        mi += _mi 
    }

    if (_T !== 3600) {
    if(T_arr.length > 0) {
        _T = Math.max(...T_arr)        //максимальное время испарения
    } else {
        _T = 3600
    }
    } 

    _T = (_T > 3600) ? 3600: _T

    //запоминаем время испарения для текущего вещества
    current_gm.t_isp = _T

    let _K = 1/ (data.vent_kr * _T + 1)          //обратный коэффициент _K

    block_5_result.hidden = false                // отображаем блок с результатами      
    mi = mi * _K                                 // учитываем кратность
    row_5_res_f.hidden = (fr == 0)               //скрываем строку с площадью разлива, если такая площадь равна 0

    if (fr) {
        k_5_f_result.value = formatNumber(fr)   //общая площадь разлива жидкости в рез. пролива (аппарат, трубы, бутылки)
        animateInput(k_5_f_result, 'blue', 800);
    } else {
        animateInput(k_5_f_result, 'red', 900);
    }

    if (mi) {
        k_5_m_result.value = formatNumber(mi)   //общая масса испарившеся жидкости 
        animateInput(k_5_m_result, 'blue', 800);
        current_gm.massa = k_5_m_result.value
        current_gm.inp_massa.value = current_gm.massa
    } else {
        animateInput(k_5_m_result, 'red', 900);
    }

} // btn_5_calc - кнопка расчета паров жидкости


// k_6 расчет массы пыли
//кнопка рассчитать аварийный объем для объема конуса при просыпании из поврежденной тары
btn_6_next_M.hidden = true //скрываем кнопку далее

btn_6_calc_v_av.onclick = ()=> {
    createModal ('Расчетный объем пылевоздушного облака, образованного при аварийной ситуации в объеме помещения, при высыпании горючей пыли из поврежденной тары с высоты', modal_6_h)
}

btn_6_calc_M.onclick = ()=> {

    
    let m1 = calc_value('av_gp_6_mav + av_gp_6_mp + 0*av_gp_6_h_sg') //учитываем теплоту сгорания, она пригодится для давления взрыва

    if (av_gp_6_mav_2.value.trim() !== '' && check_switch_k6_m2.checked) {
        let m2 = __n(av_gp_6_mav_2)
        av_gp_6_result.value = m1 > m2 ? m2 : m1
    } else {
        av_gp_6_result.value = m1
    }

    if (m1 !== '' && m1 !== null) {
        btn_6_next_M.hidden = false
        current_gm.massa = av_gp_6_result.value
        current_gm.inp_massa.value = current_gm.massa
        current_gm.z = av_gp_6_Z.value
        current_gm[7] = av_gp_6_h_sg.value
        current_gm.f = av_gp_6_F.value       //массовая доля частиц меньше критического размера

    } else {
        btn_6_next_M.hidden = true
    }


}


//k_7 Таблица выбранных взрывоопасных материалов с определенной массой









//k_8 РАСЧЕТ ДОПОЛНИТЕЛЬНЫХ ПАРАМЕТРОВ
//k_8 данные графика, полученные программой https://datathief.org

//делаем выбор на смеси (чтобы исчезло максимально давление взрыва)
k8_vvo_smes.checked = true

btn_k8_calc_ct.onclick = ()=> {
    let modal = createModal ('Определение стехиометрической концентрации ГГ или паров ЛВЖ, ГЖ', modal_8_ct)
    init_kadr(modal);
}


btn_k8_calc_z.onclick = ()=> {
createModal ('Определение коэффициента участия горючего во взрыве Z', modal_8_z)
}


const data_z_b2 = {
    0.4: 0, 0.4016: 0.0983, 0.4108: 0.1034, 0.4218: 0.1105, 0.431: 0.1156, 0.4402: 0.1219, 0.4512: 0.1272, 0.4604: 0.1323, 0.4714: 0.1381, 
    0.4806: 0.1452, 0.4917: 0.1509, 0.5009: 0.1554, 0.5101: 0.1606, 0.5211: 0.167, 0.5303: 0.1721, 0.5413: 0.1773, 0.5505: 0.1824, 
    0.5615: 0.1869, 0.5708: 0.1914, 0.58: 0.1959, 0.591: 0.2011, 0.6002: 0.2024, 0.6113: 0.2095, 0.6205: 0.2127, 0.6316: 0.2172, 
    0.6408: 0.2204, 0.65: 0.2243, 0.6611: 0.2288, 0.6703: 0.232, 0.6813: 0.2359, 0.6905: 0.2397, 0.7016: 0.2436, 0.7107: 0.2468, 
    0.7201: 0.2488, 0.7311: 0.252, 0.7404: 0.2539, 0.7513: 0.2578, 0.7607: 0.261, 0.7717: 0.2636, 0.781: 0.2662, 0.7902: 0.2688, 
    0.8013: 0.2713, 0.8105: 0.2739, 0.8216: 0.2759, 0.8308: 0.2778, 0.8401: 0.2798, 0.8511: 0.2823, 0.8604: 0.2837, 0.8715: 0.2875, 
    0.8807: 0.2882, 0.8918: 0.2901, 0.901: 0.2908, 0.9102: 0.2921, 0.9214: 0.294, 0.9306: 0.2953, 0.9417: 0.2973, 0.9508: 0.2986, 1: 0.3
}

//let E = interpolate(av_gj_5_6_h.value, data)



//k_9 ВВОД компонентов в составе смеси
/* 
let select_VV_komp = create_select_search(arr_name) //строка поиска компонента из массива БД

div_seach_vv_komp.append(select_VV_komp)

//находим пустую строку
let head_table_komp = row_title_for_VV_komp.querySelectorAll('div.col-md-9')[0]  //первая строка таблицы с названиями столбцов
let empty_row_komp = row_title_for_VV_komp.querySelectorAll('div.col-md-9')[1]

let t_row_komp = empty_row_komp.cloneNode(true)

//кнопка добавить выбранные или пользовательские компоненты
let btn_add_gm_komp = select_VV_komp.querySelector('button')

btn_add_gm_komp.onclick = ()=> {
    alert('нажата кнопка добавление компонента!')
    let div_sel = select_VV_komp.querySelector('div.mark_element')  //div с выбранными элементами
    
    let arr = [] //массив имен выбранных веществ
    if(div_sel.children.length) { 			//если есть выбранные элементы
        
        for(let d of div_sel.children) {
            arr.push(d.children[1].textContent)
        }

    } else {                                
        //добавляем пользовательские ГМ
        let _inp = select_VV_komp.querySelector('input.search_input')
        if (_inp.value == '') return 
        arr[0] = _inp.value
    }

    add_gm_in_table_komp(arr) //функция добавления добавленных веществ в таблицу

    select_VV_komp.querySelector('span.btn_clear').click() //иммитируем клик по крестику (очистить)

    //очищаем div_sel путем скликивания выбранных материалов: клик по крестику и скликивание. Очистка массива с конца массива
    for (var i = div_sel.children.length - 1; i >= 0; i--) {
        div_sel.children[i].querySelector('input').click()
    }
}


//передаем массив имен arr. функция формирует необходимые для добавления массив
function add_gm_in_table_komp(arr) {
    let arr_add_gm =[] //массив добавляемых взрывоопасных веществ
    let user_gm = false
    empty_row_komp.hidden = true //скрываем первую пустую строку


    //ДУМАТЬ ЗДЕСЬ по компонентам (ошибка не работает основной посик по ГМ в кадре 3)
    arr.forEach(name => {
        // Проверяем, есть ли вещество (имя) в GM
        if (!GM.some(innerArray => innerArray[0] === name)) {   //вещества нет в GM
            console.log('добавляем пользовательский материал (компонент)' + arr[0])
            let new_row = t_row_komp.cloneNode(true)
            row_title_for_VV_komp.append(new_row)
            
            new_row.querySelector('div.name').textContent = arr[0] //устанавливаем имя компонента

        } else {    //вещество есть в GM

        }
    })       
} 


//763
*/

 





