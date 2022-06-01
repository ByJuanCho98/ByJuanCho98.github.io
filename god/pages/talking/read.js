const action = document.querySelector('.advice');
//const output = document.querySelector('#app');
const stop = document.querySelector('.stop');

//output.insertAdjacentHTML("beforeend", '<div>hhelo</div>') //? lo mejor de la vida

const API_URL = 'https://bolls.life/get-text';

//const HTMLResponse = document.querySelector('#app');
let ol = document.createElement('ol');

var Bible = {}
let versiclesNumberCont = 1;

let inputVersion = document.querySelector('.version')
let inputBook = document.querySelector('.book')
let inputChapter = document.querySelector('.chapter')

let inputVerse = document.querySelector('.verse')

//const btnLeerTexto = document.querySelector('.btn-leer')
const btnEntrar = document.querySelector('.btn-entrar')

const adviceText = document.querySelector('#advice-text')

let capitulo = '';

let languageInput = document.getElementById('languageInput');
let translationInput = document.getElementById('translationInput');
let bookInput = document.getElementById('bookInput');
let chapterInput = document.getElementById('chapterInput');

EasySpeech.init()

const passaje = document.querySelector('.passaje')


/* btnEntrar.addEventListener('click', ()=>{

  ol.remove();
  ol.innerHTML = '';
  versiclesNumberCont = 1;
  capitulo = '';

  let translationInput = document.querySelector('.version').value;
  let bookInput = document.querySelector('.book').value;
  let chapterInput = document.querySelector('.chapter').value;
})
//? CHOOSE BETWEEN CHAPTER OR VERSE
//btnLeerTexto.addEventListener('click', ()=>{

  let emp = inputVerse.value
  let textoParaLeer = '';

  if (emp == '') { //* leer capitulo
    textoParaLeer  = capitulo
  }else{ //* leer versiculo
    textoParaLeer = Bible[inputVerse.value]
  }
  leerVoz(textoParaLeer);
}); */


var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var recognition = new SpeechRecognition();

//^ STT. CALLS ALGORITHMS. lang
action.addEventListener('click', ()=>{


  //* language recognition
  recognition.lang = "en"

  recognition.onstart = function() {
    //action.innerHTML = "<small>listening</small>";
    passaje.innerHTML = 'Listening....';
    ttsPause();
  };
  
  recognition.onspeechend = function() {
    //action.innerHTML = "<small>Advice</small>";
    recognition.stop();
  }

  recognition.addEventListener('soundend', function(event) {
    //action.classList.remove('on')
  });

  //* LOGIC ----------------------------------------------------------------------
  recognition.onresult = function(event) {
    let transcript = event.results[0][0].transcript;
    let transcriptLower = transcript.toLowerCase() 
    let transcriptLower2 = transcriptLower + ' '
    let replaced;

    //* ONE bug resolved
    if (transcriptLower2.search("one") != -1){
      let oneIndex = transcriptLower2.indexOf("one")
      let operationOneStart = oneIndex - 1;
      let operationOneEnd = oneIndex + 3;
      if (transcriptLower2[operationOneStart] === ' ' && transcriptLower2[operationOneEnd] === ' ' ) {
        replaced = transcriptLower.replaceAll("first", "1st").replaceAll("second", "2nd").replaceAll("third", "3rd").replaceAll("one", "1")
      }else{
        replaced = transcriptLower.replaceAll("first", "1st").replaceAll("second", "2nd").replaceAll("third", "3rd")
      }
    }else{
      replaced = transcriptLower.replaceAll("first", "1st").replaceAll("second", "2nd").replaceAll("third", "3rd")
    }
 
    //* tts methods
    if (transcriptLower2.includes("stop")) {
      console.log("pausing")
      ttsPause();
    }
    if (transcriptLower2.includes("cancel") || transcriptLower2.includes("exit")) {
      console.log("canceling")
      ttsCancel();
    }
    if (transcriptLower2.includes("play")) {
      console.log("Continuing")
      ttsPlay();
    }

    console.log("la transcripcion es: " + replaced);

    ol.remove();
    ol.innerHTML = '';
    versiclesNumberCont = 1;
    capitulo = '';

    //? PHRASES ALGORITHM
    fetch("./assets/books.json").then(function(resp){
      return resp.json();
    }).then(function(translation){ 

      //* PASSAJES
      if (replaced.includes("book") || replaced.includes("libro")) {
        verificarPasaje(replaced, translation)
      }
      
      //* ADVICES
      else if (replaced.includes('advice')){
        verificarAdvice(advice)
      }
      
      else if (replaced.includes('faith')){
        verificarAdvice(faith)
      }

      else if (replaced.includes('family')){
        verificarAdvice(family)
      }

      else if (replaced.includes('forgiveness')){
        verificarAdvice(forgiveness)
      }

      else if (replaced.includes('hope')){
        verificarAdvice(hope)
      }

      else if (replaced.includes('money')){
        verificarAdvice(money)
      }

      //^ GREETINGS
      else if (replaced.includes('hi') || replaced.includes('hello') || replaced.includes('good morning') || replaced.includes('hey') || replaced.includes("how's it going") || replaced.includes("what's up")){
        verificarAdvice(hi)
      }

      //^ DATE
      else if (replaced.includes('date')){
        let values = getDateAndTime('date');
        verificarTime(values)
      }

      //^ TIME
      else if (replaced.includes('time')){
        let values = getDateAndTime('time');
        verificarTime(values)
      }

      

      else{
        if (transcriptLower2.includes("stop")) {
          passaje.innerHTML = "Say play to resume "
        }else if (transcriptLower2.includes("play")) {
          passaje.innerHTML = "Say exit to abort"
        }else if(transcriptLower2.includes("exit") || transcriptLower2.includes("cancel")){
          passaje.innerHTML = "Indications";
        }
        
        else{
          passaje.innerHTML = "I can't help you."
          action.classList.remove('on')
          //leerVoz(unrecognizedMessage)
        }
        //output.innerHTML = '<strong>I didn\'t get it, this is what you said</strong>: ' + transcript + '<br><br>';
      }
    })
  };

  recognition.start();
})
const removeAccents = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
} 


//^ SCULPTURES ALGORITHM. CALLS findbook
function verificarPasaje(textoParaLeer, translation){

  //* Spanish
  if (textoParaLeer.includes("libro")) {

    //* sacar index book
    let de, initBook, cap, initCapitulo = 0
    de = textoParaLeer.indexOf("de");
    initBook = de + 3;
    cap = textoParaLeer.indexOf("capitulo");
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

    passaje.innerHTML = 'Libro: ' + bookWord + '. Capítulo: ' + chapterWordNumber + '.';
    findBook(translation[0]['NIV'], bookWordWithNoAccents, chapterWordNumber)
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

    passaje.innerHTML = `Book:  ${bookWord}. Chapter:  ${chapterWordNumber}.`;
    findBook(translation[0]['NIV'], bookWordWithNoAccents, chapterWordNumber)
  }
  //output.innerHTML = '<strong>Translation</strong>: ' + textoParaLeer + '<br><br>';
}
//^ ADVICE ALGORITHM. CALLS LEER VOZ.
function verificarAdvice(dictionary){
  const finalText = dictionary[Math.floor(Math.random() * dictionary.length)];
  leerVoz(finalText)
}
//^ TIME ALGORITHM. CALLS LEER VOZ.
function verificarTime(values){
  const finalText = values[Math.floor(Math.random() * values.length)];
  leerVoz(finalText)
}



//^ calls the api 
function findBook(books, book="1", chapter=1){

  translationInput = "NIV"

  let bookInputString = book.toString();
  let inputBookCapitalized = capitalize(bookInputString)
  let objetoConElLibro = books.find(books => books.name == inputBookCapitalized)

  if (objetoConElLibro && chapter) {

    let bookInputChapters = objetoConElLibro.chapters;
    book = objetoConElLibro.bookid;

    if (chapter <= bookInputChapters) {
      chapter = chapter;
      llamarApi(translationInput, book, chapter);

    }else{
      let overBooksNumber;
      if (bookInputChapters === '1') {
        overBooksNumber = `The book of ${bookInputString} has ${bookInputChapters} chapter. You asked for the chapter number ${chapter}` 
        passaje.innerHTML = `The book of ${bookInputString} has ${bookInputChapters} chapter`
      }else{
        overBooksNumber = `The book of ${bookInputString} has ${bookInputChapters} chapters. You asked for the chapter number ${chapter}.` //why you do that?. you fucking retard!` 
        passaje.innerHTML = `The book of ${bookInputString} has ${bookInputChapters} chapters`
      }
      leerVoz(overBooksNumber)//! Este libro no tiene tantos capitulos
    }

  
  }else{
    let unrecognizedMessage = "I didn't get it, please repeat"
    passaje.innerHTML = 'Indications'
    leerVoz(unrecognizedMessage) //! no te entendi.
  }

  
}
function capitalize(sentence){
  return sentence && sentence[0].toUpperCase() + sentence.slice(1);
}


//^ fetch API. CALLS LEER VOZ.
function llamarApi(translationInput, bookInput, chapterInput){
  //console.log(`${API_URL}/${translationInput}/${bookInput}/${chapterInput}/`) //inputVersion.value........inputBook.value.....inputChapter.value
  versiclesNumberCont = 1;
  capitulo = '';
  Bible = {};

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
  
    //HTMLResponse.appendChild(ol);
  
    
    for (let b  in Bible){
        capitulo = capitulo + Bible[b]
    }
  
    UltimoVersiculo(versiclesNumberCont - 1);
    
    leerVoz(capitulo);
    //* debub chapter
    //console.log('cap is:  '+capitulo)
  });
}
function UltimoVersiculo(versicle){
    //console.log(`Last Versicle ${versicle}`); //: ${Bible[versicle]}
}


//^ TTS
////btnLeerTexto.addEventListener('click', async event => {
async function leerVoz(textoParaLeer){

/* 
    btnLeerTexto.disabled = true

    const allInputs = Object.values(inputs)

  
    output.addEventListener('click', async event => {
      output.disabled = true
       allInputs.forEach(input => {
        input.disabled = true
      }) 
  
      const { pitch, rate, voice, volume } = getValues()
      const text = inputs.text.value 
*/

  //* voces
  //console.log(speechSynthesis.getVoices()) //8 vs 3 vs 2 woman
  try {
    console.log(textoParaLeer);
      action.classList.add('on')
      /* await EasySpeech.speak({ text: textoParaLeer, pitch: 1, rate, voice, volume }) */
      await EasySpeech.speak({ 
          text: textoParaLeer, 
          pitch: 1, 
          rate: 1, 
          voice: speechSynthesis.getVoices()[1], 
          volume: 1 })
          
  } catch (e) {
      console.log(e.message)
  } finally {
      //btnLeerTexto.disabled = false
      /* allInputs.forEach(input => {
        input.disabled = false;
      }) */
      //console.log("done")
      action.classList.remove('on')
      passaje.innerHTML = 'Indications';
  }
  //})
}


//^ MANAGE MESSAGES VOICE
function ttsPause(){
  speechSynthesis.pause()
}
function ttsPlay(){
  speechSynthesis.resume()
  action.classList.add('on')
}
function ttsCancel(){
  speechSynthesis.cancel()
  passaje.innerHTML = 'Indications';
  action.classList.remove('on')
}

stop.addEventListener('click', ()=>{
  EasySpeech.cancel();
  versiclesNumberCont = 1;
  capitulo = '';
  Bible = {};
  action.classList.remove('on')
  recognition.stop();
  passaje.innerHTML = 'Indications';
})

const btnStyling = document.querySelector(".btn-styling")
btnStyling.addEventListener('click', ()=>{
  action.classList.add('on')
})


