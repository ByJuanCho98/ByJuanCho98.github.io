const book = [
    'The book of Genesis',
    'The book of Exodus',
    'The book of Leviticus',
]

const troubled = [
"John 16:33. In the world you will have tribulation. But take heart; I have overcome the world.",
"Isaiah 41:10. So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.",
"Philippians 4:6–7. Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.",
"Psalm 34:4–5, 8. I sought the LORD, and He answered me and delivered me from all my fears. Those who look to Him are radiant, and their faces shall never be ashamed. Oh, taste and see that the LORD is good! Blessed is the man who takes refuge in Him!",
"Romans 8:28. And we know that for those who love God all things work together for good, for those who are called according to His purpose.",
"Joshua 1:9. Have I not commanded you? Be strong and courageous. Do not be frightened, and do not be dismayed, for the LORD your God is with you wherever you go.",
"Matthew 6:31–34. So do not worry, saying, 'What shall we eat?' or 'What shall we drink?' or What shall we wear?' For the pagans run after all these things, and your heavenly Father knows that you need them. But seek first His kingdom and His righteousness, and all these things will be given to you as well. Therefore do not worry about tomorrow, for tomorrow will worry about itself. Each day has enough trouble of its own.",
"Proverbs 3:5–6. Trust in the LORD with all your heart, and do not lean on your own understanding. In all your ways acknowledge Him, and He will make straight your paths.",
"Romans 15:13. May the God of hope fill you with all joy and peace as you trust in Him, so that you may overflow with hope by the power of the Holy Spirit.",
"2 Chronicles 7:14. If my people who are called by My name humble themselves, and pray and seek My face and turn from their wicked ways, then I will hear from heaven and will forgive their sin and heal their land.",
"Philippians 2:3–4. Do nothing from selfish ambition or conceit, but in humility count others more significant than yourselves. Let each of you look not only to his own interests, but also to the interests of others.",
"Isaiah 41:13. For I, the LORD your God, hold your right hand; it is I who say to you, 'Fear not, I am the one who helps you.'",
"1 Peter 5:6–7. Humble yourselves, therefore, under the mighty hand of God so that at the proper time He may exalt you, casting all your anxieties on Him, because He cares for you.",
"Psalm 94:18–19. When I thought, My foot slips, Your steadfast love, O LORD, helped me up. When the cares of my heart are many, Your consolations cheer my soul.",
"Revelation 21:4. He will wipe away every tear from their eyes, and death shall be no more, neither shall there be mourning, nor crying, nor pain anymore, for the former things have passed away. And He who was seated on the throne said, Behold, I am making all things new.",
]

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
//? elige si leer cap o versicle
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


//? STT. VERIFICAR PASAJE
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

    verificarPasaje(transcriptLower)
    // leerVoz(transcriptLower);
  };

  recognition.start();
})
const removeAccents = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
} 


//? ALGORITMO PARA RECUPERAR LAS PALABRAS. llama a findbook
function verificarPasaje(textoParaLeer){
  ol.remove();
  ol.innerHTML = '';
  versiclesNumberCont = 1;
  capitulo = '';

  fetch("./assets/books.json").then(function(resp){
    return resp.json();
  }).then(function(translation){

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
  
      findBook(translation[0]['YLT'], bookWordWithNoAccents, chapterWordNumber)
      console.log(translation[0]['YLT'])
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
  
      findBook(translation[0]['YLT'], bookWordWithNoAccents, chapterWordNumber)
    }
  })
}




//? llama a la api 
function findBook(books, book="1", chapter=1){

  translationInput = "YLT"

  let bookInputString = book.toString();
  let inputBookCapitalized = capitalize(bookInputString)
  let objetoConElLibro = books.find(books => books.name == inputBookCapitalized)
  //console.log(objetoConElLibro)

  if (objetoConElLibro && chapter) {

    bookInputChapters = objetoConElLibro.chapters;
    book = objetoConElLibro.bookid;

    if (chapter > bookInputChapters) {
      console.log(chapter)
      chapter = 01
    }else{
      chapter = chapter;
    }
  }else{
    chapter = 01
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

    /* if (textoParaLeer.includes('book')) {
        const finalText = book[Math.floor(Math.random() * 3)];
        textoParaLeer = finalText;

        output.innerHTML = finalText;
    }

    if (textoParaLeer.includes('troubled') || textoParaLeer.includes('sad') || textoParaLeer.includes('not') || textoParaLeer.includes('advice')) {
        const finalText = troubled[Math.floor(Math.random() * 15)];
        textoParaLeer = finalText;

        output.innerHTML = finalText;
    } */

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
    })

