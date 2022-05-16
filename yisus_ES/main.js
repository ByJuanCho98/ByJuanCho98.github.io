/* global document EasySpeech */
document.body.onload = async () => {
    createLog()
    appendFeatures(EasySpeech.detect())
    const initialized = await init()
    await populateVoices(initialized)
    initInputs(initialized)
    await initSpeak(initialized)
    initEvents(initialized)
  }
  
  let logBody
  let filteredVoices
  
  const values = {
    voice: undefined,
    rate: undefined,
    //pitch: undefined,
    volume: undefined,
    text: undefined
  }
  
  const inputs = {
    volume: undefined,
    rate: undefined,
    //pitch: undefined,
    text: undefined,
    language: undefined,
    voice: undefined
  }
  
  function initInputs (initialized) {
    if (!initialized) return
  
    const volumeValue = document.querySelector('.volume-value')
    inputs.volume = document.querySelector('#volume-input')
    inputs.volume.disabled = false
    inputs.volume.addEventListener('change', e => {
      values.volume = e.target.value / 100
      volumeValue.removeChild(volumeValue.firstChild)
      volumeValue.appendChild(document.createTextNode(values.volume))
    })
  
    const rateValue = document.querySelector('.rate-value')
    inputs.rate = document.querySelector('#rate-input')
    inputs.rate.disabled = false
    inputs.rate.addEventListener('change', e => {
      values.rate = e.target.value / 10
      rateValue.removeChild(rateValue.firstChild)
      rateValue.appendChild(document.createTextNode(values.rate))
    })
  
    /* const pitchValue = document.querySelector('.pitch-value')
    inputs.pitch = document.querySelector('#pitch-input')
    inputs.pitch.disabled = false
    inputs.pitch.addEventListener('change', e => {
      values.pitch = e.target.value
      pitchValue.removeChild(pitchValue.firstChild)
      pitchValue.appendChild(document.createTextNode(values.pitch))
    }) */
  
    inputs.text = document.querySelector('#text-input')
    inputs.text.disabled = false
  }
  
  function getValues () {
    return { ...values }
  }
  
  function createLog () {
    logBody = document.querySelector('.log-body')
    EasySpeech.debug(debug)
  }
  
  function debug (arg) {
    logBody.appendChild(textNode(arg))
  }
  
  async function init () {
    const header = document.querySelector('.init-status-header')
    const body = document.querySelector('.init-status-body')
    header.classList.add('bg-info')
  
    let success
    let message
    try {
      success = await EasySpeech.init()
      message = 'Successfully intialized 🎉'
    } catch (e) {
      success = false
      message = e.message
    } finally {
      const bg = success
        ? 'bg-success'
        : 'bg-danger'
  
      header.classList.remove('bg-info')
      header.classList.add(bg)
      body.appendChild(textNode(message))
    }
  
    return success
  }
  
  async function populateVoices (initialized) {
    if (!initialized) return
  
    debug('find unique languages...')
    const voices = EasySpeech.voices()
    const languages = new Set()
  
    voices.forEach(voice => {
      languages.add(voice.lang.split(/[-_]/)[0])
    })
  
    debug(`found ${languages.size} languages`)
    debug('populate languages to select component')
  
    inputs.language = document.querySelector('#lang-select')
    Array.from(languages).sort().forEach(lang => {
      const option = textNode(lang, 'option')
      option.setAttribute('value', lang)
      inputs.language.appendChild(option)
    })
  
    debug('attach events, cleanup')
    inputs.voice = document.querySelector('#voice-select')
  
    inputs.language.addEventListener('change', e => {
      while (inputs.voice.firstChild) {
        inputs.voice.removeChild(inputs.voice.lastChild)
      }
      inputs.voice.appendChild(textNode('(Select voice)', 'option'))
  
      const value = e.target.value
  
      if (!value) {
        inputs.voice.classList.add('disabled')
        inputs.voice.disabled = true
        values.voice = null
        filteredVoices = null
        return
      }
  
      filteredVoices = voices
        .filter(voice => {
          return voice.lang.indexOf(`${value}-`) > -1 || voice.lang.indexOf(`${value}_`) > -1
        })
        .sort((a, b) => a.name.localeCompare(b.name))
  
      filteredVoices.forEach((voice, index) => {
        const service = voice.localService ? 'local' : 'remote'
        const isDefault = voice.default ? '[DEFAULT]' : ''
        const voiceName = `${isDefault}${voice.name} - ${voice.voiceURI} (${service})`
        const option = textNode(voiceName, 'option')
        option.setAttribute('value', index.toString(10))
        inputs.voice.appendChild(option)
      })
  
      inputs.voice.classList.remove('disabled')
      inputs.voice.removeAttribute('disabled')
    })
  
    inputs.voice.addEventListener('change', e => {
      const value = Number.parseInt(e.target.value, 10)
      if (value < 0 || value > filteredVoices.length - 1) {
        values.voice = undefined
        return
      }
  
      values.voice = (filteredVoices || [])[value]
    })
  
    inputs.language.classList.remove('disabled')
    inputs.language.removeAttribute('disabled')
  }
  
  function initSpeak (inititalized) {
    if (!inititalized) return
  
    const speakButton = document.querySelector('.speak-btn')
    const stopButton = document.querySelector('.stop-btn')
    const allInputs = Object.values(inputs)

    stopButton.addEventListener('click',  () => {
        EasySpeech.cancel();
    })
  
    speakButton.addEventListener('click', async event => {
      speakButton.disabled = true
      allInputs.forEach(input => {
        input.disabled = true
      })
  
      const { pitch, rate, voice, volume } = getValues()
      const text = inputs.text.value
  
      try {
        //await EasySpeech.speak({ text, pitch, rate, voice, volume })
        await EasySpeech.speak({ 
            text: 'psalm 3:1. the jesus is', 
            pitch: 1, 
            rate: rate, 
            voice, 
            volume: volume })
      } catch (e) {
        debug(e.message)
      } finally {
        speakButton.disabled = false
        allInputs.forEach(input => {
          input.disabled = false
        })
      }
    })
  }
  
  function appendFeatures (detected) {
    const featuresTarget = document.querySelector('.features')
    const features = {}
  
    Object.entries(detected).forEach(([key, value]) => {
      if (typeof value === 'object') {
        features[key] = value.toString()
      } else if (typeof value === 'function') {
        features[key] = value.name
      } else {
        features[key] = value
      }
    })
  
    const text = document.createTextNode(JSON.stringify(features, null, 2))
    featuresTarget.appendChild(text)
  }
  
  function initEvents (initialized) {
    if (!initialized) return
  
    const logEvent = e => debug(`event: ${e.type}`)
    EasySpeech.on({
      boundary: logEvent,
      start: logEvent,
      end: logEvent,
      error: logEvent
    })
  }
  
  // HELPERS
  
  const textNode = (text, parent = 'div') => {
    const entry = document.createElement(parent)
    entry.appendChild(document.createTextNode(text))
    return entry
  }


























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

const action = document.querySelector('.record');
const output = document.querySelector('#app');
const stop = document.querySelector('.stop');


  action.addEventListener('click', ()=>{
    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
    var recognition = new SpeechRecognition();

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
      leerVoz(transcriptLower);
    };
  
    recognition.start();
  })


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

const adviceText = document.querySelector('#advice-text')

let capitulo = '';

btnEntrar.addEventListener('click', ()=>{

    //console.log(`${API_URL}/${inputVersion.value}/${inputBook.value}/${inputChapter.value}/`)

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

      
      for (let b  in Bible){
          capitulo = capitulo + Bible[b]
      }

      UltimoVersiculo(versiclesNumberCont - 1);
  
    });
})
function UltimoVersiculo(versicle){
    console.log(`Last Versicle ${versicle}`); //: ${Bible[versicle]}
}

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


//btnLeerTexto.addEventListener('click', async event => {
async function leerVoz(textoParaLeer){

    btnLeerTexto.disabled = true

    if (textoParaLeer.includes('book')) {
        const finalText = book[Math.floor(Math.random() * 3)];
        textoParaLeer = finalText;

        output.innerHTML = finalText;
    }

    if (textoParaLeer.includes('troubled') || textoParaLeer.includes('sad') || textoParaLeer.includes('not') || textoParaLeer.includes('advice')) {
        const finalText = troubled[Math.floor(Math.random() * 15)];
        textoParaLeer = finalText;

        output.innerHTML = finalText;
    }

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

