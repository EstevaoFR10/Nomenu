// item default book
const book_def = {
    "id": "",
    "autor": "",
    "titulo": "",
    "edicao": "",
    "ano": "",
    "genero": "",
    "qtde_paginas": "",
    "foto": "",
    "local": "",
    "emprestado": false
}

const generos = {
    1: "Veganismo",
    2: "Sem glúten",
    3: "Intolerância ao leite",
    4: "Intolerância a lactose",
}

function get_book_obj(id, autor, titulo, edicao, ano, genero, qtde_paginas, foto, local, emprestado) {
    let book = {};
    Object.assign(book, book_def);
    book.id = id;
    book.autor = autor;
    book.titulo = titulo;
    book.edicao = edicao;
    book.ano = ano;
    book.genero = genero;
    book.qtde_paginas = qtde_paginas;
    book.foto = foto;
    book.local = local;
    book.emprestado = emprestado;
    return book;
}

// declara um conjunto inicial de contatos
var db_biblioteca_default = {
    "data": [
        get_book_obj(1, "Vegan food", "31 3333 4444", 9, 2005, 1, 191, "", "Belo Horizonte", false),
        get_book_obj(2, "Delícias do leite", "31 3434-5555", 1, 2007, 3, 147, "", "Betim", true),
    ]
}

// Carrega os dados do Local storage ou os dados iniciais padrão
var db = JSON.parse(localStorage.getItem('database_biblioteca'));
if (!db) {
    db = db_biblioteca_default;
};

// validation form
function validate_form() {
    let book = get_book_form()
    if (!book.titulo || !book.autor || !book.edicao || !book.genero || (!book.foto && !book.id))
        return false;
    return true;
}

function clear_form() {
    let fields = new Array('id', 'autor', 'titulo', 'edicao', 'ano', 'genero', 'qtde_paginas', 'foto', 'local');
    for (let i = 0; i < fields.length; i++)
        $("#f_" + fields[i]).val('');
    $("#f_emprestado").prop('checked', false);
    $('#msg_frm').hide();
};

function set_form_by_obj(book) {
    let fields = new Array('id', 'autor', 'titulo', 'edicao', 'ano', 'qtde_paginas', 'local');
    for (let i = 0; i < fields.length; i++)
        $("#f_" + fields[i]).val(book[fields[i]]);
    $("#f_emprestado").prop('checked', book.emprestado == 1 ? true : false);
    $("select#f_genero option").each(function() {
        this.selected = (this.value == book.genero);
    })
}

function get_book_form() {
    // Obtem os valores dos campos do formulário
    let id = $("#f_id").val();
    let autor = $("#f_autor").val();
    let titulo = $("#f_titulo").val();
    let edicao = $("#f_edicao").val();
    let ano = $("#f_ano").val();
    let genero = $("#f_genero").val();
    let qtde_paginas = $("#f_qtde_paginas").val();
    let foto = $("#f_foto").val();
    let local = $("#f_local").val();
    let emprestado = $("#f_emprestado").prop('checked') ? 1 : 0;
    return get_book_obj(id, autor, titulo, edicao, ano, genero, qtde_paginas, foto, local, emprestado);
}

function insert() {
    let book = get_book_form();
    set_url_img_ls(document.getElementById('f_foto'), book);
    let id = 1;
    if (db.data.length > 0)
        id = parseInt(db.data[db.data.length - 1].id) + 1;
    book.id = id;
    db.data.push(book);
    display_msg(1, "Livro inserido com sucesso");
    window.setTimeout(save_and_update_db, 500);
}

function update(id) {
    let idx = find_by_id(id);
    let book = get_book_form();
    if (book.foto)
        set_url_img_ls(document.getElementById('f_foto'), book);
    else
        book.foto = db.data[idx].foto;
    db.data[idx] = book;
    display_msg(1, "Livro atualizado com sucesso");
    window.setTimeout(save_and_update_db, 500);
}

function save_and_update_db() {
    localStorage.setItem('database_biblioteca', JSON.stringify(db));
    $('#md_window').modal('hide');
    clear_form();
    load_database();
}

function find_by_id(id) {
    for (let i = 0; i < db.data.length; i++)
        if (db.data[i].id == id)
            return i;
    return null;
}

function load_book_for_update(id) {
    let idx = find_by_id(id);
    book = db.data[idx];
    set_modal_inp_file(book.foto);
    set_form_by_obj(book);
    $('#md_window').modal('show');
}

function remove(id) {
    let idx = find_by_id(id);
    db.data.splice(idx, 1);
    save_and_update_db();
    display_msg(1, "Livro removido com sucesso", 'list');
}

function clear_db() {
    localStorage.removeItem('database_biblioteca');
    window.location.reload();
}

// Save file to localstorage
function set_url_img_ls(f_file, book) {
    let url = '';
    const fr = new FileReader();
    fr.readAsDataURL(f_file.files[0]);
    fr.addEventListener('load', () => {
        url = fr.result;
        book.foto = url;
    })
}

//Set modal title
function set_modal_title(id) {
    const title = document.getElementById('md_title')
    title.innerHTML = !id ? "Inserir Livro" : "Editar Livro";
}

function set_modal_inp_file(foto = null) {
    const ffoto = document.getElementById('f_foto')
    const lfoto = document.getElementById('lbl_foto')
    if (foto == null) {
        lfoto.innerHTML = 'Foto da capa<span class="text-info">*</span>';
        if (ffoto.classList.contains('d-none')) ffoto.classList.remove('d-none')
        lfoto.classList = 'form-label'
    } else {
        lfoto.innerHTML = 'Clique aqui para Alterar a foto';
        if (!ffoto.classList.contains('d-none')) ffoto.classList.add('d-none')
        lfoto.classList = 'btn btn-light btn-sm'
    }
}

function init() {
    load_generos();
    const md = document.getElementById('md_window');
    const btn_ins = document.getElementById('btn_add');
    const btn_cle = document.getElementById('btn_cleardb');
    const btn_sav = document.getElementById('btn_save');
    const btn_can = document.getElementById('btn_cancel');
    const inp_titulo = document.getElementById('f_titulo');
    const cb_gen = document.getElementById('s_genero');
    const cb_emp = document.getElementById('s_emprestado');
    const btn_unf = document.getElementById('btn_unfilter');
    const inp_sea = document.getElementById('s_titulo');
    //Define o titulo do modal (inserir ou editar)
    btn_ins.addEventListener('click', () => {
        set_modal_title();
        set_modal_inp_file();
    });
    //Seta o foco no primeiro campo do formulario
    md.addEventListener('shown.bs.modal', () => {
            inp_titulo.focus();
        })
        //Seta evento do botao salvar
    btn_sav.addEventListener('click', insert_or_update);
    btn_can.addEventListener('click', clear_form);
    btn_cle.addEventListener('click', clear_db);
    cb_gen.addEventListener('change', filtro);
    cb_emp.addEventListener('change', filtro);
    btn_unf.addEventListener('click', clear_filter);
    inp_sea.oninput = function() { filtro() };
}

function insert_or_update() {
    $('#msg_frm').hide();
    if (validate_form()) {
        const id = $("#f_id").val();
        if (!id) insert()
        else update(id)
    } else
        display_msg(0, "Dados inválidos.");
}

window.onload = () => {
    init();
    load_database();
}

function load_database(genero = null, emprestado = null, titulo = null) {
    let tbody = $('#table_body');
    tbody.empty();
    for (let i = 0; i < db.data.length; i++) {
        book = db.data[i];
        if ((genero && book.genero != genero) ||
            (emprestado && book.emprestado != emprestado) ||
            (titulo && !(book.titulo.toLocaleLowerCase().includes(titulo.toLocaleLowerCase())))
        )
            continue;
        if (!book.foto) book.foto = './img/no_img.jpg'
        tr = `<tr onclick="load_book_for_update(${book.id})">
            <td scope="row"><img alt="foto do Restaurante ${book.autor}" src="${book.foto}" width="50" height="70"/></td>
            <td class="align-middle">${book.id}</td>
            <td class="align-middle">${book.autor}</td>
            <td class="align-middle">${book.titulo}</td>
            <td class="align-middle">${get_genero(book.genero)}</td>
            <td class="align-middle">${book.local}</td>
            <td class="align-middle"><button title="editar" type="button" onclick="load_book_for_update(${book.id})" class="btn btn-outline-secondary btn-sm"><i class="bi bi-pencil-square"></i></button>
                                     <button title="remover" type="button" onclick="remove(${book.id})" class="btn btn-outline-danger btn-sm"><i class="bi bi-trash"></i></button>
            </td>
        </tr>`
        $(tbody).append(tr);
    }
}

function display_msg(status, msg, where = 'frm') {
    let dmsg = document.getElementById('msg_' + where);
    if (status > 0)
        dmsg.classList = 'alert alert-success';
    else {
        dmsg.classList = 'alert alert-danger';
        msg += ' Campos com <span class="text-info">*</span> são obrigatórios';
    }
    dmsg.innerHTML = msg;
    $(dmsg).show();
}

function auto_remove_alert(elid) {
    window.setTimeout(function() {
        $('#' + elid).fadeTo(500, 0).slideUp(500, function() {
            $(this).hide();
        });
    }, 3000);
}

function load_generos() {
    for (const [key, value] of Object.entries(generos)) {
        $('#f_genero').append(`<option value="${key}">${value}</option>`);
        $('#s_genero').append(`<option value="${key}">${value}</option>`);
    }
}

function get_genero(id) {
    for (const [key, value] of Object.entries(generos))
        if (id == key)
            return value
}

function filtro() {
    let gen = $('#s_genero').val();
    let emp = $('#s_emprestado').val();
    let tit = $('#s_titulo').val();
    load_database(gen, emp, tit)
}

function clear_filter() {
    $('#s_genero').val('')
    $('#s_emprestado').val('')
    $('#s_titulo').val('')
    load_database()
}