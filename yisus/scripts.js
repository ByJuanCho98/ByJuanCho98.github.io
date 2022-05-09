const API_URL = 'https://bolls.life/get-text';

const HTMLResponse = document.querySelector('#app');
const ol = document.createElement('ol');


var Bible = {}
let versiclesNumberCont = 1;

let inputVersion = document.querySelector('.version')
let inputBook = document.querySelector('.book')
let inputChapter = document.querySelector('.chapter')

let inputVerse = document.querySelector('.verse')

const btnLeerTexto = document.querySelector('.btn-leer')
const btnEntrar = document.querySelector('.btn-entrar')

btnEntrar.addEventListener('click', ()=>{

    console.log(`${API_URL}/${inputVersion.value}/${inputBook.value}/${inputChapter.value}/`)

    fetch(`${API_URL}/${inputVersion.value}/${inputBook.value}/${inputChapter.value}/`) //RV1960
    .then((response) => response.json())
    .then((text) => {
        text.forEach((bible) => {
            let elem = document.createElement('li');
            elem.appendChild(
                document.createTextNode(`${bible.text}`), //${bible.verse}
                //console.log(bible),
                Bible[versiclesNumberCont] = `${bible.text} `,
                versiclesNumberCont++,
            );
            ol.appendChild(elem);
        });

        HTMLResponse.appendChild(ol);

        let capitulo = '';
        for (let b  in Bible){
            capitulo = capitulo + Bible[b]
        }

        UltimoVersiculo(versiclesNumberCont - 1);
   
    });
})

function VersicleOrChapter(){
    let emp = inputVerse.value
    console.log(emp)

    if (emp == '') { //* leer capitulo
        locutor.text = textoParaLeer
    }else{ //* leer versiculo
        console.log(Bible[inputVerse.value])
        console.log(Bible)
        locutor.text = Bible[inputVerse.value]
    }
    //leerVoz(capitulo); //leer capitulo
    leerVoz(Bible[30]); //leer versiculo
}


function UltimoVersiculo(versicle){
    console.log(`Last Versicle ${versicle}`); //: ${Bible[versicle]}
}

function leerVoz(textoParaLeer){
    btnLeerTexto.addEventListener('click', ()=>{
        const locutor = new SpeechSynthesisUtterance()
        // locutor.lang = 'en-GB'
        // locutor.lang = 'es-MX'
        locutor.lang = 'en-EN'
        // locutor.lang = 'es-MX'
        locutor.pitch = 1;
        locutor.rate = 0.8;

        const voz = window.speechSynthesis
        locutor.text = textoParaLeer
        voz.speak(locutor)
    })
}

