const action = document.querySelector('.advice');
const output = document.querySelector('#app');
const stop = document.querySelector('.stop');

//output.insertAdjacentHTML("beforeend", '<div>hhelo</div>') //? lo mejor de la vida

const API_URL = 'https://bolls.life/get-text';

const HTMLResponse = document.querySelector('#app');
let ol = document.createElement('ol');


var Bible = {}
let versiclesNumberCont = 1;

let inputVersion = document.querySelector('.version')
let inputBook = document.querySelector('.book')
let inputChapter = document.querySelector('.chapter')

let inputVerse = document.querySelector('.verse')

const btnLeerTexto = document.querySelector('.btn-leer')
const btnEntrar = document.querySelector('.btn-entrar')

const adviceText = document.querySelector('#advice-text')

let capitulo = '';

let languageInput = document.getElementById('languageInput');
let translationInput = document.getElementById('translationInput');
let bookInput = document.getElementById('bookInput');
let chapterInput = document.getElementById('chapterInput');

btnEntrar.addEventListener('click', ()=>{

  ol.remove();
  ol.innerHTML = '';
  versiclesNumberCont = 1;
  capitulo = '';

  //let languageInput = document.querySelector('.version').innerHTML;
  let translationInput = document.querySelector('.version').value;
  let bookInput = document.querySelector('.book').value;
  let chapterInput = document.querySelector('.chapter').value;

  //console.log(translationInput, bookInput, chapterInput)

})
//? CHOOSE BETWEEN CHAPTER OR VERSE
btnLeerTexto.addEventListener('click', ()=>{

  let emp = inputVerse.value
  let textoParaLeer = '';

  if (emp == '') { //* leer capitulo
    textoParaLeer  = capitulo
  }else{ //* leer versiculo
    textoParaLeer = Bible[inputVerse.value]
  }
  //leerVoz(capitulo); //leer capitulo
  //leerVoz(Bible[30]); //leer versiculo

  leerVoz(textoParaLeer);
});


//? STT. VERIFICAR PASAJE. RESETEA APP. lang
action.addEventListener('click', ()=>{
  var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
  var recognition = new SpeechRecognition();

  //* language recognition
  recognition.lang = "en"

  recognition.onstart = function() {
      action.innerHTML = "<small>listening</small>";
  };
  
  recognition.onspeechend = function() {
      action.innerHTML = "<small>Advice</small>";
      recognition.stop();
  }

  recognition.onresult = function(event) {
    var transcript = event.results[0][0].transcript;
    output.innerHTML = "<b>Text:</b> " + transcript;
    output.classList.remove("hide");

    let transcriptLower = transcript.toLowerCase() 

    console.log("la transcripcion es: " + transcriptLower);

    ol.remove();
    ol.innerHTML = '';
    output.innerHTML = '';
    versiclesNumberCont = 1;
    capitulo = '';

    //? PHRASES ALGORITHM
    fetch("./assets/books.json").then(function(resp){
      return resp.json();
    }).then(function(translation){ 

      if (transcriptLower.includes("book") || transcriptLower.includes("libro")) {
        verificarPasaje(transcriptLower, translation)
      }
      
      else if (transcriptLower.includes('advice')){
        verificarAdvice(advice)
      }
      
      else if (transcriptLower.includes('faith')){
        verificarAdvice(faith)
      }

      else if (transcriptLower.includes('family')){
        verificarAdvice(family)
      }

      else if (transcriptLower.includes('forgiveness')){
        verificarAdvice(forgiveness)
      }

      else if (transcriptLower.includes('hope')){
        verificarAdvice(hope)
      }

      else if (transcriptLower.includes('money')){
        verificarAdvice(money)
      }

      else{
        output.innerHTML = '<strong>I didn\'t get it, this is what you said</strong>: ' + transcript + '<br><br>';
      }
    })
  };

  recognition.start();
})
const removeAccents = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
} 



//? SCULPTURES ALGORITHM. CALLS findbook
function verificarPasaje(textoParaLeer, translation){

  //* Spanish
  if (textoParaLeer.includes("libro")) {

    //* sacar index book
    let de, initBook, cap, initCapitulo = 0
    de = textoParaLeer.indexOf("de");
    initBook = de + 3;
    cap = textoParaLeer.indexOf("capítulo");
    initCapitulo = cap-1

    //*slice book
    let bookWord = textoParaLeer.slice(initBook, initCapitulo)
    let bookWordWithNoAccents = removeAccents(bookWord)
    console.log(bookWordWithNoAccents)
    
    //*sacar index chapter
    let capituloEnd, end  = 0
    capituloEnd = cap + 9;
    end = textoParaLeer.length;
    
    //*slice chapter
    let chapterWord = textoParaLeer.slice(capituloEnd, end)
    let chapterWordNumber = parseInt(chapterWord)
    console.log(chapterWord)

    findBook(translation[0]['NIV'], bookWordWithNoAccents, chapterWordNumber)
    console.log(translation[0]['NIV'])
  }
    //* English
  if (textoParaLeer.includes("book")) {

    //* sacar index book
    let de, initBook, cap, initCapitulo = 0
    de = textoParaLeer.indexOf("of");
    initBook = de + 3;
    cap = textoParaLeer.indexOf("chapter");
    initCapitulo = cap-1

    //*slice book
    let bookWord = textoParaLeer.slice(initBook, initCapitulo)
    let bookWordWithNoAccents = removeAccents(bookWord)
    console.log(bookWordWithNoAccents)
    
    //*sacar index chapter
    let capituloEnd, end  = 0
    capituloEnd = cap + 8;
    end = textoParaLeer.length;
    
    //*slice chapter
    let chapterWord = textoParaLeer.slice(capituloEnd, end)
    let chapterWordNumber = parseInt(chapterWord)
    console.log(chapterWord)

    findBook(translation[0]['NIV'], bookWordWithNoAccents, chapterWordNumber)
  }
  output.innerHTML = '<strong>Translation</strong>: ' + textoParaLeer + '<br><br>';

}

//? ADVICE ALGORITHM. CALLS LEER VOZ.
function verificarAdvice(dicctionary){
  const finalText = dicctionary[Math.floor(Math.random() * dicctionary.length)];
  console.log(finalText)
  output.innerHTML = `<strong>Your advice is</strong>: ` + finalText ;
  leerVoz(finalText)
}



//? calls the api 
function findBook(books, book="1", chapter=1){

  translationInput = "NIV"

  let bookInputString = book.toString();
  let inputBookCapitalized = capitalize(bookInputString)
  let objetoConElLibro = books.find(books => books.name == inputBookCapitalized)
  //console.log(objetoConElLibro)

  if (objetoConElLibro && chapter) {

    let bookInputChapters = objetoConElLibro.chapters;
    book = objetoConElLibro.bookid;

    if (chapter > bookInputChapters) {
      console.log(chapter)
      chapter = 01
    }else{
      chapter = chapter; //! Este libro no tiene tantos capitulos
    }
  }else{
    chapter = 01 //! no te entendi.
    book = '01'
  }

  llamarApi(translationInput, book, chapter);
}
function capitalize(sentence){
  return sentence && sentence[0].toUpperCase() + sentence.slice(1);
}


//? fetch api
function llamarApi(translationInput, bookInput, chapterInput){
  //console.log(`${API_URL}/${translationInput}/${bookInput}/${chapterInput}/`) //inputVersion.value........inputBook.value.....inputChapter.value

  fetch(`${API_URL}/${translationInput}/${bookInput}/${chapterInput}/`) 
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
  
    
    for (let b  in Bible){
        capitulo = capitulo + Bible[b]
    }
  
    UltimoVersiculo(versiclesNumberCont - 1);
    
    leerVoz(capitulo);
  });
}
function UltimoVersiculo(versicle){
    //console.log(`Last Versicle ${versicle}`); //: ${Bible[versicle]}
}


//? TTS
//btnLeerTexto.addEventListener('click', async event => {
async function leerVoz(textoParaLeer){


    btnLeerTexto.disabled = true

    const allInputs = Object.values(inputs)

  
    //output.addEventListener('click', async event => {
      output.disabled = true
      allInputs.forEach(input => {
        input.disabled = true
      })
  
      const { pitch, rate, voice, volume } = getValues()
      const text = inputs.text.value
        
    try {
        await EasySpeech.speak({ text: textoParaLeer, pitch: 1, rate, voice, volume })
        /* await EasySpeech.speak({ 
            text: textoParaLeer, 
            pitch: 1, 
            rate: 1, 
            voice: speechSynthesis.getVoices()[2], 
            volume: 1 }) */
            
    } catch (e) {
        debug(e.message)
        console.log(e.message)
    } finally {
        btnLeerTexto.disabled = false
        allInputs.forEach(input => {
          input.disabled = false;
        })
    }
    //})
}
stop.addEventListener('click', ()=>{
  EasySpeech.cancel();
  //recognition.stop();
})

