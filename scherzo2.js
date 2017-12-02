"use strict";

let Container = {
	view: (vnode) => {
		return m('.container', 
						 m(Header),
						 m(Layout, {scherzo: scherzo}),
						 m(Footer));
	}
};

let Header = {
	view: (vnode) => {
		return m('.header', 'Scherzo by naivesound | download | help');
	}
};

let Footer = {
	view: (vnode) => {
		return m('.footer', 'Made by ', m('a', 'Naivesound'));
	}
};

let Layout = {
	view: (vnode) => {
		return m('.layout.flex-col',
						 m('.title', m('h1', 'Scherzo')),
						 m('.layout-controls',
							 m(Sliders, {scherzo: scherzo}),
							 m(Buttons, {scherzo:scherzo})),
							 m(KeyboardLayout, {scherzo: scherzo}));
	}
};

let Sliders = {
	view: (vnode) => {
		let scherzo = vnode.attrs.scherzo;
		return m('.layout-sliders.flex-row.flex-wrap',
						 m(AdjustableSlider, {
							 label:'Master volume',
							 value: scherzo.cc(7)/127,
							 onvaluechange: (v) => scherzo.setCC(7, v*127),
						 }),
						 m(AdjustableSlider, {
							 label:'Click volume',
							 value: scherzo.cc(13)/127,
							 onvaluechange: (v) => scherzo.setCC(13, v*127),
						 }),
						 m(AdjustableSlider, {
							 label:'Looper volume',
							 value: scherzo.cc(12)/127,
							 onvaluechange: (v) => scherzo.setCC(12, v*127),
						 }),
						 m(AdjustableSlider, {
							 label:'Looper decay',
							 value: scherzo.cc(9)/127,
							 onvaluechange: (v) => scherzo.setCC(9, v*127),
						 }));
	}
};

let AdjustableSlider = {
	view: (vnode) => {
		let value = vnode.attrs.value || 0;
		let delta = 0.1;
		let onvaluechange = (v) => {
			if (vnode.attrs.onvaluechange) {
				v = Math.max(Math.min(v, 1), 0);
				vnode.attrs.onvaluechange(v);
			}
		};
		return m('.slider-wrapper.flex-row',
						 m('.label.to-upper', vnode.attrs.label),
						 m('.adjustable-slider.flex-row.flex-one',
							 m('.btn.flex-row', {onclick: () => onvaluechange(value-delta)}, IconMinus),
							 m(Slider, {value: value, onvaluechange: onvaluechange}),
							 m('.btn.flex-row', {onclick: () => onvaluechange(value+delta)}, IconPlus)));
	}
};

let Slider = {
  x: 0,
  width: 0,
  dots: [],
	inited: 0,
  oncreate: (vnode) => { setTimeout(m.redraw, 0); },
  onupdate: (vnode) => {
		if (!vnode.state.inited){
			Slider.updateSize(vnode);
			vnode.state.inited = 1;
		}
  },
	view: (vnode) => {
		let onprogresschange = vnode.attrs.onprogresschange || (()=>{});
		return m('.flex-row.flex-one', {
			onclick: e => onprogresschange((e.clientX - vnode.state.x) / vnode.state.width),
			style: {
				display: 'flex',
				flex: 1,
				justifyContent: 'space-around',
				alignItems: 'center',
				alignSelf: 'stretch',
			}
		}, Slider.updateDots(vnode));
	},
  updateSize(vnode) {
    vnode.state.x = vnode.dom.offsetLeft;
    vnode.state.width = vnode.dom.offsetWidth;
    vnode.state.dots = [];
    var n = vnode.state.width / 15;
    for (var i = 0; i < n; i++) {
      vnode.state.dots.push(m('.knob-progress-dot'));
    }
    Slider.updateDots(vnode);
  },
  updateDots(vnode) {
    vnode.state.dots.forEach((dot, i) => {
      dot.attrs.style = dot.attrs.style || {};
      dot.attrs.style.opacity = (i/vnode.state.dots.length < vnode.attrs.value ? 1: 0.2);
    });
    return vnode.state.dots;
  }
};

let Buttons = {
	view: (vnode) => {
		let scherzo = vnode.attrs.scherzo;
		let bpm = scherzo.bpm();
		return m('.layout-buttons.flex-row.flex-wrap.flex-one.to-upper',
						 m(InstrumentPicker),
						 m('.flex-row.flex-one',
							 m('.btn.btn-large.flex-col.flex-one', {
								 className: (scherzo.beatIndicator ? 'active' : ''),
							 }, m('.bpm', (bpm == 0 ? IconMetronome : bpm)), (bpm == 0 ? 'Tap' : 'BPM')),
							 m('.btn.btn-large.flex-col.flex-one', {
								 className: (scherzo.loopIndicator ? 'active' : ''),
							 }, IconLoop, 'Loop'),
							 m('.btn.btn-large.flex-col.flex-one', IconCancel, 'Cancel')));
	}
};

let InstrumentPicker = {
	view: (vnode) => {
		return m('.instrument-picker.flex-row.flex-one',
						 m('.label', 'Instr'),
						 m('.adjustable-slider.flex-row.flex-one',
							 m('.btn.flex-col', IconLeft),
							 m('.instrument-name.flex-col.flex-one.to-upper', 'Clavinova'),
							 m('.btn.flex-col', IconRight)));
	}
};

let KeyboardLayout = {
	view: (vnode) => {
		return m('.layout-keyboard.flex-row.flex-stretch',
						 m('.keyboard-side-bar.keyboard-side-bar-left',
							 m('.btn.octave-btn', {onclick: () => scherzo.changeOctave(+1)}, IconPlus),
							 m('.label', 'OCT'),
							 m('.btn.octave-btn', {onclick: () => scherzo.changeOctave(-1)}, IconMinus)),
						 m(Keyboard, {
							 activenotes: scherzo.activeNotes,
							 rootnote: scherzo.rootNote,
							 onpianokeydown: (k) => scherzo.noteOn(k, 127),
							 onpianokeyup: (k) => scherzo.noteOff(k),
						 }),
						 m('.keyboard-side-bar.keyboard-side-bar-right'));
	}
};

let Keyboard = {
	isBlack: (note) => {
		const pianoLayout = [ 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1];
		return pianoLayout[note % 12] == 0;
	},
	view: (vnode) => {
		const numWhite = [ 0, 1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 6, 7, 8, 8, 9, 9, 10, 11, 11, 12, 12, 13, 13, 14, 15];

		let rootNote = vnode.attrs.rootnote || 12;
		let numNotes = vnode.attrs.numnotes || 17;
		let activeNotes = vnode.attrs.activenotes || [];
		let onpianokeydown = vnode.attrs.onpianokeydown || (()=>{});
		let onpianokeyup = vnode.attrs.onpianokeyup || (()=>{});

		if (Keyboard.isBlack(numNotes - 1)) {
			numNotes--;
		}
		let keys = [];
		for (let i = 0; i < numNotes; i++) {
			let note = rootNote + i;
			let className = 'key-white';
			let style = {};
			if (Keyboard.isBlack(i)) {
				className = 'key-black';
				style = {
					width: 100/numWhite[numNotes] + '%',
					marginLeft: -50 / numWhite[numNotes] + '%',
					marginRight: -50 / numWhite[numNotes] + '%',
				};
			}
			if (activeNotes[note]) {
				className += ' key-active';
			}
			keys.push(m('.key', {
				className : className,
				style: style,
				ontouchstart : () => onpianokeydown(note),
				ontouchend : () => onpianokeydown(note),
				onmousedown : () => onpianokeydown(note),
				onmouseup : () => onpianokeyup(note),
				onmouseenter : (e) => { (e.buttons & 1) && onpianokeydown(note) },
				onmouseleave : () => onpianokeyup(note),
			}));
		}
		return m('.keyboard', keys);
	}
};

//
// SVG icons
//
let SVGIcon = (icon) => m('svg', {viewBox: '0 0 48 48', height: 48, width: 48}, m('g', icon));
let SVGPath = (d) => m('path', {d: d})
let IconCancel = SVGIcon([
	SVGPath("M 33,15 15,33"),
	SVGPath("M 15,15 33,33")
]);
let IconLoop = SVGIcon([
	SVGPath("m 24,15 0,0 5,0 6,0 c 4,0 8,3 8,8 0,4 -3,8 -8,8 l -5,0 m -6,0 -1,0 -5,0 -5,0 c -4,0 -8,-3 -8,-8 0,-4 3,-8 8,-8 l 5,0"),
	SVGPath("m 14,10 5,5 -5,5"),
	SVGPath("m 34,26 -5,5 5,5")
]);
let IconMinus = SVGIcon([SVGPath("M 15,24 33,24")]);
let IconPlus = SVGIcon([SVGPath("M 24,15 24,33"), SVGPath("M 15,24 33,24")]);
let IconLeft = SVGIcon([SVGPath("M 24,15 15,24 24,33")]);
let IconRight = SVGIcon([SVGPath("M 24,15 33,24 24,33")]);
let IconMetronome = SVGIcon([SVGPath("M 24,15 33,24 24,33")]);

//
// Scherzo logic
//
class Scherzo {
	constructor() {
		const audioContext = new window.AudioContext();

		if (navigator.requestMIDIAccess) {
			navigator.requestMIDIAccess().then((midi) => {
				const enumerate = () => {
					let inputs = midi.inputs.values();
					for (let input = inputs.next(); input && !input.done;
							 input = inputs.next()) {
						input.value.onmidimessage =
							(m) => { this.midi(m.data[0], m.data[1], m.data[2]); };
					}
				};
				enumerate();
				midi.onstatechange = enumerate;
			});
		}

		const AUDIO_BUFFER_SIZE = 1024;
		const pcm = audioContext.createScriptProcessor(AUDIO_BUFFER_SIZE, 0, 2);
		const analyser = audioContext.createAnalyser();

		this.sampleRate = audioContext.sampleRate;
		this.scherzo = Module.ccall('scherzo_create', 'number', [ 'number', 'number' ],
																[ this.sampleRate, 32]);

		const sizeInBytes = AUDIO_BUFFER_SIZE * 2 * Int16Array.BYTES_PER_ELEMENT;
		this.int16BufPtr = Module._malloc(sizeInBytes);
		pcm.onaudioprocess = this.audioCallback.bind(this);
		this.pcm = pcm;
		this.pcm.connect(audioContext.destination);

		this.setInstrumentPath(0, '/sf2/piano.sf3');
		this.loadInstrument(0);

		this.rootNote = 48;
		this.activeNotes = {};
		this.beatIndicator = this.loopIndicator = false;
	}
	changeOctave(delta) {
		this.rootNote = this.rootNote + delta * 12;
		if (this.rootNote < 0) {
			this.rootNote = 0;
		}
		if (this.rootNote > 108) {
			this.rootNote = 108;
		}
	}
	setInstrumentPath(id, path) {
		Module.ccall('scherzo_set_instrument_path', 'int',
								 [ 'number', 'number', 'string' ], [ this.scherzo, id, path ]);
	}
	loadInstrument(id) {
		Module.ccall('scherzo_load_instrument', 'int', [ 'number', 'number' ],
								 [ this.scherzo, id ]);
	}
	midi(msg, a, b) {
		if (msg == 0x90 && b > 0) {
			if (this.activeNotes[a]) {
				return;
			}
			this.activeNotes[a] = b;
		} else if (msg == 0x80 || (msg == 0x90 && b == 0)) {
			delete this.activeNotes[a];
		}
		Module.ccall('scherzo_midi', 'void',
								 [ 'number', 'number', 'number', 'number' ],
								 [ this.scherzo, msg, a, b ]);
		clearTimeout(this.tid)
		this.tid = setTimeout(() => m.redraw(), 16);
	}
	loop() { this.midi(0xb0, 0x51, 1); }
	cancel() { this.midi(0xb0, 0x52, 1); }
	tap() { this.midi(0xb0, 0x50, 1); }
	setCC(n, v) { this.midi(0xb0, n, v); }
	noteOn(note, velocity) {
		velocity = velocity || 127;
		this.midi(0x90, note, velocity);
	}
	noteOff(note) { this.midi(0x80, note, 0); }
	bpm() { return Module.ccall('scherzo_get_bpm', 'number', ['number'], [this.scherzo]); }
	looperState() { return Module.ccall('scherzo_get_looper_state', 'number', ['number'], [this.scherzo]); }
	note(n) { return Module.ccall('scherzo_get_note', 'number', ['number', 'number'], [this.scherzo, n]); }
	cc(n) { return Module.ccall('scherzo_get_cc', 'number', ['number', 'number'], [this.scherzo, n]); }
	audioCallback(e) {
		const left = e.outputBuffer.getChannelData(0);
		const right = e.outputBuffer.getChannelData(1);
		const events = Module.ccall(
			'scherzo_write_stereo', 'number', [ 'number', 'number', 'number' ],
			[ this.scherzo, this.int16BufPtr, left.length ]);
			for (let i = 0; i < left.length; i++) {
				const leftLo = Module.getValue(this.int16BufPtr + i * 4, 'i8');
				const leftHi = Module.getValue(this.int16BufPtr + i * 4 + 1, 'i8');
				const rightLo = Module.getValue(this.int16BufPtr + i * 4 + 2, 'i8');
				const rightHi = Module.getValue(this.int16BufPtr + i * 4 + 3, 'i8');

				right[i] = (rightHi * 256 + (rightLo & 0xff)) / 0x8000;
				left[i] = (leftHi * 256 + (leftLo & 0xff)) / 0x8000;
			}

			this.events |= events;
			if (events & (1 << 1)) {
				this.beatIndicator = 1;
			}
			if (events & (1 << 2)) {
				this.loopIndicator = 1;
			}
			if (events != 0) {
				this.redraw();
			}
	}
	redraw() {
		clearTimeout(this.tid);
		this.tid = setTimeout(() => {
			m.redraw();
			this.events = 0;
			this.beatIndicator = 0;
			this.loopIndicator = 0;
		}, 0);
	}
}

//
// Main part: create glitch audio player, handle global events, render layout
//
var Module = window.Module || {
  'print' : function(text) { console.log(text) },
  'printErr' : function(text) { console.warn(text) }
};

(function(d) {
  var script = d.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  if ('WebAssembly' in window) {
    script.src = 'scherzo-loader.js';
  } else {
    script.src = 'scherzo-asm.js';
  }
  d.getElementsByTagName('head')[0].appendChild(script);
})(document);

Module['onRuntimeInitialized'] = function() {
	FS.mkdir('/sf2');
	FS.createPreloadedFile('/sf2', 'piano.sf3', '/naivesound/_scherzo/master/piano.sf3', true, false,
			 () => { main(); });
};

const keyDownBindings = {
  // Global hotkeys for metronome and looper
  'Space' : (scherzo) => scherzo.tap(),
  'Enter' : (scherzo) => scherzo.loop(),
  'Backspace' : (scherzo) => scherzo.cancel(),
  'Delete' : (scherzo) => scherzo.cancel(),
  // TODO: master gain, looper gain, metronome gain, looper decay
  // Octave switch
  'KeyZ' : (scherzo) => scherzo.rootNote = Math.max(scherzo.rootNote - 12, 0),
  'KeyX' : (scherzo) => scherzo.rootNote = Math.min(scherzo.rootNote + 12, 108),
	// Piano keyboard
  'KeyA' : (scherzo) => scherzo.noteOn(scherzo.rootNote, 127),
  'KeyW' : (scherzo) => scherzo.noteOn(scherzo.rootNote + 1, 127),
  'KeyS' : (scherzo) => scherzo.noteOn(scherzo.rootNote + 2, 127),
  'KeyE' : (scherzo) => scherzo.noteOn(scherzo.rootNote + 3, 127),
  'KeyD' : (scherzo) => scherzo.noteOn(scherzo.rootNote + 4, 127),
  'KeyF' : (scherzo) => scherzo.noteOn(scherzo.rootNote + 5, 127),
  'KeyT' : (scherzo) => scherzo.noteOn(scherzo.rootNote + 6, 127),
  'KeyG' : (scherzo) => scherzo.noteOn(scherzo.rootNote + 7, 127),
  'KeyY' : (scherzo) => scherzo.noteOn(scherzo.rootNote + 8, 127),
  'KeyH' : (scherzo) => scherzo.noteOn(scherzo.rootNote + 9, 127),
  'KeyU' : (scherzo) => scherzo.noteOn(scherzo.rootNote + 10, 127),
  'KeyJ' : (scherzo) => scherzo.noteOn(scherzo.rootNote + 11, 127),
  'KeyK' : (scherzo) => scherzo.noteOn(scherzo.rootNote + 12, 127),
  'KeyO' : (scherzo) => scherzo.noteOn(scherzo.rootNote + 13, 127),
  'KeyL' : (scherzo) => scherzo.noteOn(scherzo.rootNote + 14, 127),
  'KeyP' : (scherzo) => scherzo.noteOn(scherzo.rootNote + 15, 127),
  'Semicolon' : (scherzo) => scherzo.noteOn(scherzo.rootNote + 16, 127),
  'BracketRight' : (scherzo) => scherzo.noteOn(scherzo.rootNote + 17, 127),
  'Quote' : (scherzo) => scherzo.noteOn(scherzo.rootNote + 18, 127),
};

const keyUpBindings = {
  'KeyA' : (scherzo) => scherzo.noteOff(scherzo.rootNote),
  'KeyW' : (scherzo) => scherzo.noteOff(scherzo.rootNote + 1),
  'KeyS' : (scherzo) => scherzo.noteOff(scherzo.rootNote + 2),
  'KeyE' : (scherzo) => scherzo.noteOff(scherzo.rootNote + 3),
  'KeyD' : (scherzo) => scherzo.noteOff(scherzo.rootNote + 4),
  'KeyF' : (scherzo) => scherzo.noteOff(scherzo.rootNote + 5),
  'KeyT' : (scherzo) => scherzo.noteOff(scherzo.rootNote + 6),
  'KeyG' : (scherzo) => scherzo.noteOff(scherzo.rootNote + 7),
  'KeyY' : (scherzo) => scherzo.noteOff(scherzo.rootNote + 8),
  'KeyH' : (scherzo) => scherzo.noteOff(scherzo.rootNote + 9),
  'KeyU' : (scherzo) => scherzo.noteOff(scherzo.rootNote + 10),
  'KeyJ' : (scherzo) => scherzo.noteOff(scherzo.rootNote + 11),
  'KeyK' : (scherzo) => scherzo.noteOff(scherzo.rootNote + 12),
  'KeyO' : (scherzo) => scherzo.noteOff(scherzo.rootNote + 13),
  'KeyL' : (scherzo) => scherzo.noteOff(scherzo.rootNote + 14),
  'KeyP' : (scherzo) => scherzo.noteOff(scherzo.rootNote + 15),
  'Semicolon' : (scherzo) => scherzo.noteOff(scherzo.rootNote + 16),
  'BracketRight' : (scherzo) => scherzo.noteOff(scherzo.rootNote + 17),
  'Quote' : (scherzo) => scherzo.noteOff(scherzo.rootNote + 18),
};

function main() {
  const scherzo = new Scherzo();
  document.onkeydown = (e) => {
    let key = (e.ctrlKey ? 'Ctrl+' : '') + e.code;
    let f = keyDownBindings[key];
    if (f) {
      f(scherzo);
    }
  };
  document.onkeyup = (e) => {
    let key = (e.ctrlKey ? 'Ctrl+' : '') + e.code;
    let f = keyUpBindings[key];
    if (f) {
      f(scherzo);
    }
  };
  window.scherzo = scherzo;
  m.mount(document.body, {view : () => m(Container, {scherzo : scherzo})});
}
