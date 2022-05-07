const texto = document.querySelector('.texto')
const btnLeerTexto = document.querySelector('.btn-leer')

btnLeerTexto.addEventListener('click', ()=>{
    
    const locutor = new SpeechSynthesisUtterance()

    // locutor.lang = 'en-GB'
    // locutor.lang = 'es-MX'
    locutor.lang = 'en-EN'
    // locutor.lang = 'es-MX'


    const voz = window.speechSynthesis
    locutor.text = texto.value
    voz.speak(locutor)
})

const voiceschanged = () => {
    console.log(`Voices #: ${speechSynthesis.getVoices().length}`)
    speechSynthesis.getVoices().forEach(voice => {
      console.log(voice.name, voice.lang)
    })
  }
  speechSynthesis.onvoiceschanged = voiceschanged