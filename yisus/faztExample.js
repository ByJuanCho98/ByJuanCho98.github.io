const input = document.querySelector('#input');
const bibleText = document.querySelector('#app');

const API_URL = 'https://bolls.life/get-text';

let inputVersion = document.querySelector('.version')
let inputBook = document.querySelector('.book')
let inputChapter = document.querySelector('.chapter')

let inputVerse = document.querySelector('.verse')

const btnLeerTexto = document.querySelector('.btn-leer')
const btnEntrar = document.querySelector('.btn-entrar')

let data = []
let capitulo = '';
let idioma = '';

window.addEventListener('DOMContentLoaded', async() => {
    bibleText.innerHTML = 'Loading...'
})


/* async function TranslationConverter(){
    let response = await fetch('./bible_database/translations.json') //RV1960
    return data = await response.json();
    //console.log(data)
}

async function BookConverter(){
    let response = await fetch('./bible_database/books.json') //RV1960
    return data = await response.json();
    //console.log(data)
} */



async function LoadData(){
    console.log(`${API_URL}/${inputVersion.value}/${book}/${inputChapter.value}/`)
    let response = await fetch(`${API_URL}/${inputVersion.value}/${book}/${inputChapter.value}/`) //RV1960
    return data = await response.json();
}

input.addEventListener('keyup', event => {
    const newData = data.filter(bible => `${bible.text.toLowerCase()}`.includes(input.value.toLowerCase()))
    RenderData(newData)
})

const createBible = data => data.map(bible => `<ol>${bible.verse}. ${bible.text}</ol>`).join(' ')

var Bible = {}
let versiclesNumberCont = 1;

function RenderData(data){
    Bible = {}
    capitulo = {}
    versiclesNumberCont = 1;

    const itemsString = createBible(data)
    bibleText.innerHTML = itemsString

    data.forEach((bible) => {
        Bible[versiclesNumberCont] = `${bible.text} `,
        versiclesNumberCont++;
    });

    for (let b  in Bible){
        capitulo = capitulo + Bible[b]
    }
}



let book

btnEntrar.addEventListener('click', async()=>{
    if (inputBook.value == 'Genesis') {
        book = 1
    } 
    else if(inputBook.value == 'Proverbs'){
        book = 20
    }
    let data = await LoadData();
    RenderData(data);
})

btnLeerTexto.addEventListener('click', async()=>{

    idioma = SeleccionarIdioma();

    let emp = inputVerse.value

    if (emp == '') { //* leer capitulo
        leerVoz(capitulo, idioma);
    }else{ //* leer versiculo
        console.log(Bible[inputVerse.value])
        leerVoz(Bible[inputVerse.value], idioma);
    }
})

function SeleccionarIdioma(){
    if (inputVersion.value == 'RV1960') {
        idioma = "es"
    } else {
        idioma = "en"
    }
    return idioma;
}

function leerVoz(textoParaLeer, idioma){
    const locutor = new SpeechSynthesisUtterance()
    
    if (idioma == 'es') {
        locutor.lang = 'es-MX'
    } else {
        // locutor.lang = 'en-GB'
        locutor.lang = 'en-EN'
    }


    locutor.pitch = 1;
    locutor.rate = 0.8;

    const voz = window.speechSynthesis
    locutor.text = textoParaLeer
    voz.speak(locutor)
}





