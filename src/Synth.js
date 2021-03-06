import Oscilloscope from './Oscilloscope'
import { toFreq } from 'tonal'

let melody = [
  `C3`, `Eb3`, `G3`, `C4`, `Eb4`, `D4`, `C4`, `G4`,
  `F4`, `Eb4`, `D4`, `Bb3`, `D4`, `Eb4`, `C4`, `Bb2`,
]

let harmony = [
  `Eb4`, `Eb4`, `Bb4`, `Eb4`, `A4`, `G4`,
]

/* It's a me... mario! */

// let melody = [
//   `D2`, `D2`, null, `D2`, null, `D2`, `D2`, null,
//   `G2`, null, null, null, `G1`, null, null, null,
// ]
//
// let harmony = [
//   `E4`, `E4`, null, `E4`, null, `C4`, `E4`, null,
//   `G4`, null, null, null, `G3`, null, null, null,
// ]

/*---------------------*/

let Synth = () => {

  /*
   *  Your code here!
   */

  let ctx = new AudioContext()
  let masterGain = ctx.createGain()
  let biquadFilter = ctx.createBiquadFilter()
  let lfo = ctx.createOscillator()
  let lfoGain = ctx.createGain()

  lfo.connect(lfoGain)
  lfo.start()

  lfoGain.gain.value = 2000
  lfoGain.connect(biquadFilter.frequency)

  biquadFilter.gain.value = 35
  biquadFilter.connect(masterGain)

  masterGain.connect(ctx.destination)
  masterGain.connect(Oscilloscope(ctx))

  let o, o2, oGain, o2Gain, mod, modGain

  let playNote = (UI) => {
    o = ctx.createOscillator()
    o2 = ctx.createOscillator()

    oGain = ctx.createGain()
    o2Gain = ctx.createGain()

    mod = ctx.createOscillator()
    modGain = ctx.createGain()

    mod.connect(modGain)
    modGain.connect(o.frequency)
    modGain.connect(o2.frequency)

    o.frequency.value = melody[UI.step % melody.length] ? toFreq(melody[UI.step % melody.length]) : 0
    o2.frequency.value = harmony[UI.step % melody.length] ? toFreq(harmony[UI.step % harmony.length]) : 0

    o.type = UI.waveShapes.shape1
    o2.type = UI.waveShapes.shape2

    o.connect(oGain)
    o2.connect(o2Gain)

    oGain.gain.value = 0
    o2Gain.gain.value = 0

    oGain.gain.linearRampToValueAtTime(
      1,
      ctx.currentTime + (UI.sliders.slider1.value / 80)
    )

    o2Gain.gain.linearRampToValueAtTime(
      1,
      ctx.currentTime + (UI.sliders.slider1.value / 80)
    )

    oGain.connect(biquadFilter)
    o2Gain.connect(biquadFilter)

    mod.frequency.value = UI.knobs.knob2.value
    modGain.gain.value = UI.knobs.knob3.value

    mod.type = UI.waveShapes.shape2

    o.start()
    o2.start()

    mod.start()
  }

  let releaseNote = (time) => {
    if (oGain) {
      oGain.gain.linearRampToValueAtTime(
        0,
        ctx.currentTime + (time / 80)
      )
    }

    if (o2Gain) {
      o2Gain.gain.linearRampToValueAtTime(
        0,
        ctx.currentTime + (time / 80)
      )
    }
  }

  return {

    onUIChange(UI) {

      // Listen to UI changes!

      if (UI.activeKey) {
        playNote(UI)
      } else {
        releaseNote(UI.sliders.slider4.value)
      }

      masterGain.gain.value = UI.masterVolume
      lfo.type = UI.waveShapes.shape4
      lfo.frequency.value = UI.knobs.knob4.value / 100
      biquadFilter.type = UI.filterTypes.filter1

    },

    onSequencerEvent(UI) {
      if (UI.steps[UI.step]) {
        playNote(UI)
        releaseNote(UI.sliders.slider4.value)
      }
    },

  }
}

export default Synth
