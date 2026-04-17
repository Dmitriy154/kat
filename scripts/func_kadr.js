//  КАДР 2. расчет площади и объема помещения
function k_2_calc_v () {    //кнопка "Расчитать" - расчитываем объем и свободный объем помещения
    calc(pom_S, 'pom_l*pom_w' )
    calc(pom_V, 'pom_l*pom_w*pom_h')
    calc(pom_svV, 'pom_V*pom_svV_pr/100')
    saveInputs([pom_l, pom_w, pom_h, pom_svV_pr], [pom_S, pom_V, pom_svV]) //после вып. расчета, если скорректировать параметр, то очистятся все поля
}


//  КАДР 3.
//вызывается при нажатии на крестик для удаления строки, следит, чтобы не была удалена последняя (первая) строка

let select_VV, head_table, empty_row, t_row; //элементы поиска и таблицы 3-го кадра (создаю тут, чтобы был доступ)

function create_select_GM_3() {
    if (select_VV) return; //чтобы не создавать повторно
    
    // Проверяем, загружены ли данные
    if (!EXPLOSIVE_NAMES) {
        console.warn('Данные EXPLOSIVE_NAMES еще не загружены');
        return;
    }
    
    // Проверяем существование DOM элементов
    const parent = document.getElementById('parent_select_sprVV');
    const rowTitle = document.getElementById('row_title_for_VV');
    
    if (!parent || !rowTitle) {
        console.error('DOM элементы для кадра 3 не найдены');
        return;
    }
    
    select_VV = create_select_search(EXPLOSIVE_NAMES, parent.clientWidth);
    parent.append(select_VV)

    //находим пустую строку
    head_table = rowTitle.querySelectorAll('div.col-md-9')[0]  //первая строка таблицы с названиями столбцов

    empty_row = rowTitle.querySelectorAll('div.col-md-9')[1]
    t_row = empty_row.cloneNode(true)

    //кнопка добавить выбранные или пользовательские ГМ
    let btn_add_gm = select_VV.querySelector('button')


    btn_add_gm.onclick = ()=> {
        let div_sel = select_VV.querySelector('div.mark_element')
        
        let arr = [] //массив имен выбранных веществ 
        if(div_sel.children.length) { 			//если есть выбранные элементы
            
            for(let d of div_sel.children) {
                arr.push(d.children[1].textContent)
            }

        } else {                                
            //добавляем пользовательские ГМ
            let _inp = select_VV.querySelector('input.search_input')
            if (_inp.value == '') return 
            arr[0] = _inp.value
        }

        add_gm_in_table(arr) //добавляем в массив 

        select_VV.querySelector('span.btn_clear').click() //иммитируем клик по крестику (очистить)

        //очищаем div_sel путем скликивания выбранных материалов: клик по крестику и скликивание. Очистка массива с конца массива
        for (var i = div_sel.children.length - 1; i >= 0; i--) {
            div_sel.children[i].querySelector('input').click()
        }
    }
}


function del_row_in_table_gm(row){
    if (row_title_for_VV.querySelectorAll('div.col-md-9')[3] == undefined){ // осталась последняя (или первая строка), которую нельзя удалять
        k3_btn_clear_table.click()
    } else {  
        let name = row.querySelector('.name').textContent;      //находим имя гор. материала в удаляемой строке
        arr_GM_vz = arr_GM_vz.filter(gm => gm[0] !== name);     //удаляем из массива 
        row.remove()
    }
}

//КАДР 4_1 и 4_2 расчет плотности газа или пара при расчетной температуре
// calc(k4_as1_m_res, '0.01*av_gg_1_p*av_gg_1_v*av_gg_1_ro', data.vent_kf) или  calc(pom_svV, 'pom_V*pom_svV_pr/100') или ! calc(av_gj_5_ng,`${result}+0*av_gj_5_u`)

function mc_4_ro (ro, M) {
    ro.value = calc_value(`${M.value}/(22.413*(1+0.00367*${data.room_Tr}))`);
}

//КАДР 4_3 функия расчет в модальном окне силы зарядного тока

//нажимаю на кнопку рассчитать для вызова модального окна с расчетом для расчета тока зарядки для 2-х ступенч. режима
function mc_4_3_cr_modal (button) {
    createModal ('Расчет силы зарядного тока при двухступенчатом режиме заряда АКБ', modal_4_3_i)
    temp = button.parentElement.parentElement.querySelector('input') //инпут со значением силы зарядного тока, не используем id, т.к. может быть несколько АКБ
    
}

//расчет силы тока в модальном окне
function mc_4_3_i2 (button) {
    calc(av_gg_4_i_res, 'av_gg_4_c*av_gg_4_kr*(av_gg_4_kp-1)/av_gg_4_tb')
    temp.value = av_gg_4_i_res.value
    temp = null
}


//кадр 5_W - расчет W для определения площади испарения, а также времени испарения


//расчет насыщенного давления пара
function mc_4_P_cr_modal () {
    body_modal = createModal ('Расчет давления насыщенного пара', modal_4_p)
    init_kadr(body_modal) //чтобы в модальном окне отобразить данные из справочника
    
    //если температурный предел не отобразился , то скрываем строку modal_4_w_row_t_int
    if (modal_4_w_row_t_int.querySelector('input').value == '') modal_4_w_row_t_int.hidden = true;
}


//включение выключение вентиляции кадр 5. учитывается аварийная и(или) принудительная вент. для определения скорости возд. потока, но не K для массы
function modal_w_change_vent(bool) {
    block_5_0_vent.hidden = bool
    if (bool) {             //отсутствует вентиляция
        av_gj_5_ng.value = 1
    } else {                //имеется вентиляция
        av_gj_5_ng.value = ''
    }
    av_gj_5_W.value = ''
}


//чек-бок вкл. выкл. бортов
function modal_w_change_bort(bool) {
    block_5_0_bort.hidden = bool
    if (bool) {                 //нет бортов, убираем площадь
        k5_data_s_bort.value = ''
    } 
    av_gj_5_W.value = ''
}


// расчитать коэффициент ng от скорости и температуры, сохраняем в data.vent_u. Срабатвает к кадре block_5_data когда нажимаю кнопку расчитать скорость возд. потока
function mc_4_w_calc_ng() {
    let t = +data.room_Tr
    t = (t >= 37) ? 37 : (t <= 10) ? 10 : t // диапазон от 10 до 37

    if (av_gj_5_u.value == '') {
        animateInput(av_gj_5_u, 'red', 1000);
        return
    }

    let u = +av_gj_5_u.value
    u = (u >= 1) ? 1 : (u <= 0) ? 0 : u // диапазон от 0 до 1
    
    let result = modal_w_findN(u, t, data_modal_w_u)
    result = formatNumber(result)
    calc(av_gj_5_ng, `${result}`) 

    data.vent_u = u
}


//расчет интенсивности испарения
function k5_calc_w () {
    if (av_gj_5_ng.value == '') av_gj_5_ng.value = 1
    calc(av_gj_5_W, `0.000001 * av_gj_5_ng * av_gj_5_M**(0.5) * av_gj_5_P`)
}


//КАДР 6_пыли
function mc_6_mav_calc(){ //кн. "Расчитать" - определяем массу пыли поступившей в помещение при аварии Mав
    if (av_gp_6_t.value == '') av_gp_6_t.value = 0
    calc(av_gp_6_mav, '(av_gp_6_m_ap + av_gp_6_q * av_gp_6_t) * av_gp_6_kp')
    calc(av_gp_6_mp, '0.05*av_gp_6_mav')
    av_gp_6_result.value = ''
}

function modal_6_calc() {
    calc(av_gp_mod_mp, 'modal_6_k_g / modal_6_k_u * (modal_6_m1 + modal_6_m2)')
    av_gp_6_mp.value = av_gp_mod_mp.value
}

function modal_6_v_calc(){
    calc(av_gp_6_V_av_modal, '1.05 * modal_6_h_inp * modal_6_h_inp * modal_6_h_inp ')
    av_gp_6_V_av.value = av_gp_6_V_av_modal.value
    av_gp_6_mav_2.value = '' //очищаем поле массы, если сохранилось старое значение
}


//КАДР 7-наполнение таблицы с веществами с известными массами для дальнейшей проверки
//наполняем таблицу с учетом массива arr_GM_vz после нажатия кнопки ДАЛЕЕ в 3 кадре
function create_table_k7 () {
    //сохраняем массы веществ из таблицы ( из условия, что вещества в массиве сохранены в таком же порядке)
    let inputs_m = row_title_for_VV.querySelectorAll('input.massa') //ссылка в массиве на input в строке
    
    inputs_m.forEach((inp,i,arr) => {
        arr_GM_vz[i].massa = inp.value //добавляем для каждого выбранного в кадре 3 вещества свойства massa
    })

    let empty_row_m = row_table_gm_massa.querySelectorAll('div.col-md-10')[1] // строка шаблон
    
    let t_row_m = empty_row_m.cloneNode(true) // клонированная строка таблицы,
    empty_row_m.hidden = true //скрываем первую пустую строку

    arr_GM_vz.forEach(gm => {
        let new_row = t_row_m.cloneNode(true)
        row_table_gm_massa.append(new_row) //добавляем строки в таблицу в кадре 7
        new_row.querySelector('div.name').textContent = gm[0]
        new_row.querySelector('div.massa').textContent = gm.massa
    });

    //переходим в кадр 7
    goto(k_7)
}

//расчет дополнительных параметров для каждого взрывоопасного вещества. вызывается нажатием кнопки расчитать для каждого ГМ из табл. кадра 7
function calc_dop_par(row){
    
    let name = row.querySelector('div.name').textContent    //наименование вещества 
    
    current_gm = arr_GM_vz.find(item => item[0] === name) 
    current_gm.row_res = row        //ссылка на row, чтобы затем ввести итоговое значение изб. давления

    goto(k_8) // внимание: вначале назначаем current_gm, а потом запускаем goto (с init), чтобы ссылаться и вставлять данные из БД!

    let id = current_gm[1] //переработать
    let type = current_gm[9]

    let v = ''      // вид вещества

    if (id === '0') {           //  в формуле недопустимые элементы, по формуле 2 (как для смеси)
        v = '0'                 
    } else if (id === 's') {    // смесь (бензин ....)
        v = 's'                 
    } else if (id === 'sd') {   // смесь с долями (эмали ...)
        v= 'sd'                                 
    } else if (/^\d+$/.test(id) && parseInt(id) > 0) {  // индивидуальное вещество , по формуле 1
        v = 'i'                 
    } else {
        v = 'p'
    }

    //скрываем все блоки для открытия необходимых, кроме кнопок далее и назад
    let blocks = [block_k8_radio, block_k8_M, block_k8_p, block_k8_ct, block_k8_h, block_k8_tv, block_k8_f, block_k8_z]
    blocks.forEach(block => block.hidden = true)


    if (type == 'гп') {         // для пыли
            // отображаем f и H_tp,
            block_k8_h.hidden = false
            block_k8_f.hidden = false
    } else {                    // для ГГ, ЛВЖ, ГЖ   блок с выбором инд. вещества
        if (type == 'лвж') {
            //отображаем темп-ру вспышки для ЛВЖ (для отнесения к кат А или Б)
            block_k8_tv.hidden = false  
        }


        if (v == 'i') {
            btn_k8_change('i')        //отображаем список для индивидуального вещества
        } else if(v == '0' || v == 's'){
            btn_k8_change('o')        //отображаем список как для остаьных веществ (пыли, технич. жидкости ...)
        } else if (v == 'sd') {      
            // отдельная история !!!!!. Смеси, отдельный кадр?
        } else if (v == 'p' || v == 't') {   //остальные вещества (пользовательские или только с H)
            block_k8_radio.hidden = false   //отображаем вопрос с выбором инд. или смесь для пользовательского в-ва
        }
    }


}



//выбирем индивидуальное вещество или смесь для вещества из БД (!) или после выполненного выбора между смесью и инд. веществом
function btn_k8_change (k) {

    if (k == 'i') {       //для индивидуальных веществ отображаем  P_max, M, Cст
        block_k8_p.hidden = false       // P_max (13)
        block_k8_M.hidden = false       // M (4)
        block_k8_ct.hidden = false       // Cст (3)

    } else if (k == 's') {            //для смесевых композиций
        //переходим к кадру 9
        goto(k_9)
        console.log(current_gm)

    } else if (k == 'o') { //для технических жидкостей и пылей
        block_k8_h.hidden = false       // H
    }

    block_k8_radio.hidden = true 
    block_k8_z.hidden = false 

}


//кнопка Далее для кадра 8 или действя после выбора инд. или смеси для пользов.вещества и с теплотой сгорания
function btn_next_k8() {
    if (block_k8_radio.hidden) { // кнопка далее после ввода всех данных
        // переход и заполение в кадре 7: избыточное давление взрыва

        //сохранение промежуточных данных для инициализации (!) табл. в кадре 7 по давлению....

        goto(k_7)
    } else {    //нажатие при видимом окне выбора индивидуального в-ва или смеси, промежуточная кнопка Далее
        if (k8_ind_vvo.checked) btn_k8_change('i')
        if (k8_vvo_smes.checked) btn_k8_change('s')
        if (k8_vvo_other.checked) btn_k8_change('o')
    }
}



function formula_1(arr){


}


function formula_2(arr){
    //формула 5 ТКП
    let m = current_gm.massa
    let H_t = _nf(current_gm[7]) * 1000000
    let V_sv = data.room_V_sv
    let Z = current_gm.z
    console.log(Z)
    
    let p = (m * H_t * 101 * Z) / (V_sv * data.g_vozd * 1010 * data.room_T0 * 3)
    return _nf(p)
}

//определение стехиометрического коэффициента
function modal_8_calc() {

}
