<template>
    <div class="min-h-screen flex flex-col bg-black" tabindex="0" @keydown="handleKeyDown" ref="container">
        <Navbar @midi-output-selected="handleMidiOutputSelected" @show-notes-changed="handleShowNotesChanged"
            @copy="copyCurrentStep" @paste="pasteToCurrentStep" @clear="clearClipboard" :copied-pattern="copiedPattern"
            :note-length="noteLength" @note-length-changed="handleNoteLengthChanged" @clear-all-notes="clearAllNotes"
            :pattern-length="patternLength" @pattern-length-changed="handlePatternLengthChanged" />
        <main class="flex-1 flex items-center justify-center p-8 pt-20">
            <div class="bg-panel rounded-lg p-6 shadow-xl w-[500px]">
                <div class="mb-4 flex justify-between items-center">
                    <div class="flex items-center gap-4">
                        <div class="flex items-center gap-2">
                            <label class="text-white text-sm">Paint Color:</label>
                            <div class="flex gap-1">
                                <button @click="selectedColor = 'blue'" class="w-8 h-8 rounded transition-all border-2"
                                    :class="[
                                        'bg-blue-600 hover:bg-blue-500',
                                        selectedColor === 'blue' ? 'border-white scale-110' : 'border-transparent'
                                    ]"></button>
                                <button @click="selectedColor = 'red'" class="w-8 h-8 rounded transition-all border-2"
                                    :class="[
                                        'bg-red-600 hover:bg-red-500',
                                        selectedColor === 'red' ? 'border-white scale-110' : 'border-transparent'
                                    ]"></button>
                                <button @click="selectedColor = 'green'" class="w-8 h-8 rounded transition-all border-2"
                                    :class="[
                                        'bg-green-600 hover:bg-green-500',
                                        selectedColor === 'green' ? 'border-white scale-110' : 'border-transparent'
                                    ]"></button>
                                <button @click="selectedColor = 'cyan'" class="w-8 h-8 rounded transition-all border-2"
                                    :class="[
                                        'bg-cyan-500 hover:bg-cyan-400',
                                        selectedColor === 'cyan' ? 'border-white scale-110' : 'border-transparent'
                                    ]"></button>
                                <button @click="selectedColor = 'magenta'"
                                    class="w-8 h-8 rounded transition-all border-2" :class="[
                                        'bg-fuchsia-500 hover:bg-fuchsia-400',
                                        selectedColor === 'magenta' ? 'border-white scale-110' : 'border-transparent'
                                    ]"></button>
                                <button @click="selectedColor = 'yellow'"
                                    class="w-8 h-8 rounded transition-all border-2" :class="[
                                        'bg-yellow-500 hover:bg-yellow-400',
                                        selectedColor === 'yellow' ? 'border-white scale-110' : 'border-transparent'
                                    ]"></button>
                                <button @click="selectedColor = 'white'" class="w-8 h-8 rounded transition-all border-2"
                                    :class="[
                                        'bg-white hover:bg-gray-100',
                                        selectedColor === 'white' ? 'border-blue-500 scale-110' : 'border-transparent'
                                    ]"></button>
                                <button @click="selectedColor = null"
                                    class="w-8 h-8 rounded transition-all border-2 bg-gray-800 hover:bg-gray-700 flex items-center justify-center"
                                    :class="[
                                        selectedColor === null ? 'border-white scale-110' : 'border-transparent'
                                    ]">
                                    <span class="text-white text-xl">&times;</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Add shift controls -->
                <div class="flex items-center justify-center gap-2 mb-4">
                    <div class="grid grid-cols-3 gap-1">
                        <div></div>
                        <button @click="shiftNotes('up')"
                            class="p-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 relative group">
                            <span class="text-xl">↑</span>
                            <div
                                class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Shift + ↑
                            </div>
                        </button>
                        <div></div>
                        <button @click="shiftNotes('left')"
                            class="p-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 relative group">
                            <span class="text-xl">←</span>
                            <div
                                class="absolute top-1/2 right-full transform -translate-y-1/2 mr-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Shift + ←
                            </div>
                        </button>
                        <div class="p-2 text-gray-500 text-sm">Shift</div>
                        <button @click="shiftNotes('right')"
                            class="p-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 relative group">
                            <span class="text-xl">→</span>
                            <div
                                class="absolute top-1/2 left-full transform -translate-y-1/2 ml-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Shift + →
                            </div>
                        </button>
                        <div></div>
                        <button @click="shiftNotes('down')"
                            class="p-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 relative group">
                            <span class="text-xl">↓</span>
                            <div
                                class="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Shift + ↓
                            </div>
                        </button>
                        <div></div>
                    </div>
                </div>

                <div class="flex justify-center">
                    <MidiGrid :grid-data="currentStepGrid" @toggle-cell="toggleCell" @stop-painting="resetDrawMode"
                        :show-notes="showNotes" :note-length="noteLength" />
                </div>

                <!-- Add tempo controls -->
                <div class="mt-4 flex items-center justify-center gap-4">
                    <label class="text-white text-sm">Tempo:</label>
                    <input type="range" v-model="tempo" min="50" max="500" step="1"
                        class="w-48 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                    <div class="flex items-center gap-2">
                        <input type="number" v-model="tempo" min="50" max="500"
                            class="w-16 px-2 py-1 text-sm bg-gray-700 text-white rounded border border-gray-600" />
                        <span class="text-white text-sm">BPM</span>
                    </div>
                </div>

                <!-- Step navigation -->
                <div class="mt-4 flex items-center justify-center gap-4">
                    <button @click="previousStep"
                        class="w-10 h-10 flex items-center justify-center rounded bg-gray-700 text-white hover:bg-gray-600">
                        <span class="text-xl">←</span>
                    </button>
                    <div class="text-white flex items-center justify-center gap-1">
                        <span class="w-6 text-right">{{ currentStepDisplay }}</span>
                        <span class="text-gray-500">/</span>
                        <span class="w-6 text-left">{{ patternLength }}</span>
                    </div>
                    <button @click="nextStep"
                        class="w-10 h-10 flex items-center justify-center rounded bg-gray-700 text-white hover:bg-gray-600">
                        <span class="text-xl">→</span>
                    </button>
                    <button @click="togglePlayback"
                        class="w-20 h-10 flex items-center justify-center rounded bg-blue-600 text-white hover:bg-blue-700 transition relative group">
                        {{ isPlaying ? 'Stop' : 'Play' }}
                        <div
                            class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Space
                        </div>
                    </button>
                    <button @click="downloadMidi"
                        class="w-10 h-10 flex items-center justify-center rounded bg-green-600 text-white hover:bg-green-700 transition relative group">
                        <span class="text-xl">↓</span>
                        <div
                            class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Download MIDI
                        </div>
                    </button>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup>
import { ref, computed, onUnmounted, onMounted, watch } from 'vue';
import MidiGrid from './components/MidiGrid.vue';
import Navbar from './components/Navbar.vue';
import * as MidiWriter from 'midi-writer-js';

const container = ref(null);
const isPlaying = ref(false);
const currentStep = ref(0);
const copiedPattern = ref(null);
const showNotes = ref(false);
const selectedColor = ref('blue');
const tempo = ref(120);
const midiOutput = ref(null);
const noteLength = ref('16');
const patternLength = ref(16);

// Create a sequence with dynamic length
const sequence = ref(Array.from({ length: patternLength.value }, () => Array(60).fill(false)));

const currentStepDisplay = computed(() => currentStep.value + 1);
const currentStepGrid = computed(() => sequence.value[currentStep.value]);

// Calculate interval time in milliseconds from tempo (BPM)
const intervalTime = computed(() => (60 / tempo.value / 4) * 1000); // Quarter the beat for 16th notes

let interval;

// Watch for tempo changes and update the interval if playing
watch(tempo, (newTempo) => {
    // Clamp tempo value between 50 and 500
    if (newTempo < 50) tempo.value = 50;
    if (newTempo > 500) tempo.value = 500;

    if (isPlaying.value) {
        clearInterval(interval);
        interval = setInterval(playStep, intervalTime.value);
    }
});

const handleMidiOutputSelected = (output) => {
    midiOutput.value = output;
    // Stop playback when MIDI output changes
    if (isPlaying.value) {
        togglePlayback();
    }
};

const sendMidiNoteOn = (note, velocity = 100, channel = 0) => {
    if (midiOutput.value) {
        console.log(`Sending MIDI Note On - Note: ${note}, Channel: ${channel}`);
        const noteOnMessage = [0x90 + channel, note, velocity];
        midiOutput.value.send(noteOnMessage);
    }
};

const sendMidiNoteOff = (note, channel = 0) => {
    if (midiOutput.value) {
        const noteOffMessage = [0x80 + channel, note, 0];
        midiOutput.value.send(noteOffMessage);
    }
};

// Add drawMode state
const drawMode = ref(null);

// Update toggleCell function
const toggleCell = ({ index, value, updateNoteLength, noteLength: newNoteLength }) => {
    if (updateNoteLength && sequence.value[currentStep.value][index]) {
        // Update just the note length of an existing cell
        sequence.value[currentStep.value][index] = {
            ...sequence.value[currentStep.value][index],
            noteLength: newNoteLength
        };
        return;
    }

    // On first cell of drawing session, determine the mode
    if (drawMode.value === null) {
        drawMode.value = sequence.value[currentStep.value][index] ? 'erase' : 'paint';
    }

    // Apply the drawing mode
    if (drawMode.value === 'paint') {
        // Only paint empty cells
        if (!sequence.value[currentStep.value][index]) {
            sequence.value[currentStep.value][index] = {
                color: selectedColor.value,
                noteLength: noteLength.value
            };
        }
    } else if (drawMode.value === 'erase') {
        // Only erase painted cells
        if (sequence.value[currentStep.value][index]) {
            sequence.value[currentStep.value][index] = false;
        }
    }
};

const resetDrawMode = () => {
    drawMode.value = null;
};

const previousStep = () => {
    currentStep.value = (currentStep.value - 1 + patternLength.value) % patternLength.value;
};

const nextStep = () => {
    currentStep.value = (currentStep.value + 1) % patternLength.value;
};

const copyCurrentStep = () => {
    copiedPattern.value = [...sequence.value[currentStep.value]];
};

const pasteToCurrentStep = () => {
    if (copiedPattern.value) {
        sequence.value[currentStep.value] = [...copiedPattern.value];
    }
};

const clearClipboard = () => {
    copiedPattern.value = null;
};

const togglePlayback = async () => {
    if (!midiOutput.value) {
        alert('Please select a MIDI output device first');
        return;
    }

    if (!isPlaying.value) {
        currentStep.value = 0;
        interval = setInterval(playStep, intervalTime.value);
        isPlaying.value = true;
    } else {
        clearInterval(interval);
        isPlaying.value = false;

        // Send note off messages for all possible MIDI notes (0-127) on both channels
        for (let note = 0; note <= 127; note++) {
            sendMidiNoteOff(note, 0); // Channel 0
            sendMidiNoteOff(note, 1); // Channel 1
        }
    }
};

const getMidiNote = (index, color) => {
    const col = index % 5;
    const row = Math.floor(index / 5);
    const sectionSize = 12;
    const rowWithinSection = row % sectionSize;

    // Determine if we should use channel 1 (last two columns)
    const useChannel1 = col >= 3;

    // For channel 1, we reset the column index to start from 0
    const adjustedCol = useChannel1 ? col - 3 : col;

    // Get the base notes for each primary color
    const getBaseNotes = () => {
        const channel = useChannel1 ? 1 : 0;
        const blueNote = 127 - (adjustedCol * 36) - rowWithinSection;
        const redNote = 115 - (adjustedCol * 36) - rowWithinSection;
        const greenNote = 103 - (adjustedCol * 36) - rowWithinSection;

        return {
            blue: blueNote >= 0 && blueNote <= 127 ? { note: blueNote, channel } : null,
            red: redNote >= 0 && redNote <= 127 ? { note: redNote, channel } : null,
            green: greenNote >= 0 && greenNote <= 127 ? { note: greenNote, channel } : null
        };
    };

    const baseNotes = getBaseNotes();
    const notes = [];

    // Add notes based on the color combination
    switch (color) {
        case 'blue':
            if (baseNotes.blue) notes.push(baseNotes.blue);
            break;
        case 'red':
            if (baseNotes.red) notes.push(baseNotes.red);
            break;
        case 'green':
            if (baseNotes.green) notes.push(baseNotes.green);
            break;
        case 'cyan': // Blue + Green
            if (baseNotes.blue) notes.push(baseNotes.blue);
            if (baseNotes.green) notes.push(baseNotes.green);
            break;
        case 'magenta': // Blue + Red
            if (baseNotes.blue) notes.push(baseNotes.blue);
            if (baseNotes.red) notes.push(baseNotes.red);
            break;
        case 'yellow': // Red + Green
            if (baseNotes.red) notes.push(baseNotes.red);
            if (baseNotes.green) notes.push(baseNotes.green);
            break;
        case 'white': // All colors
            if (baseNotes.blue) notes.push(baseNotes.blue);
            if (baseNotes.red) notes.push(baseNotes.red);
            if (baseNotes.green) notes.push(baseNotes.green);
            break;
    }

    return notes;
};

const playStep = () => {
    if (!isPlaying.value) return;

    // Play current step
    const currentStepNotes = sequence.value[currentStep.value];
    currentStepNotes.forEach((cell, index) => {
        if (cell) {
            const col = index % 5;
            const row = Math.floor(index / 5);
            const useChannel1 = col >= 3;
            const adjustedCol = useChannel1 ? col - 3 : col;

            // Calculate note numbers for each color section
            const blueNote = row < 12 ? 127 - (adjustedCol * 36) - row : null;
            const redNote = row < 12 ? 115 - (adjustedCol * 36) - row : null;
            const greenNote = row < 12 ? 103 - (adjustedCol * 36) - row : null;

            // Send MIDI notes based on cell color
            if (cell.color === 'blue' && blueNote >= 0 && blueNote <= 127) {
                sendMidiNoteOn(blueNote, 100, useChannel1 ? 1 : 0);
                setTimeout(() => sendMidiNoteOff(blueNote, useChannel1 ? 1 : 0), 100);
            }
            if (cell.color === 'red' && redNote >= 0 && redNote <= 127) {
                sendMidiNoteOn(redNote, 100, useChannel1 ? 1 : 0);
                setTimeout(() => sendMidiNoteOff(redNote, useChannel1 ? 1 : 0), 100);
            }
            if (cell.color === 'green' && greenNote >= 0 && greenNote <= 127) {
                sendMidiNoteOn(greenNote, 100, useChannel1 ? 1 : 0);
                setTimeout(() => sendMidiNoteOff(greenNote, useChannel1 ? 1 : 0), 100);
            }
        }
    });

    // Move to next step
    currentStep.value = (currentStep.value + 1) % patternLength.value;
};

const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
        if (event.shiftKey) {
            shiftNotes('left');
        } else {
            previousStep();
        }
    } else if (event.key === 'ArrowRight') {
        if (event.shiftKey) {
            shiftNotes('right');
        } else {
            nextStep();
        }
    } else if (event.key === 'ArrowUp' && event.shiftKey) {
        shiftNotes('up');
    } else if (event.key === 'ArrowDown' && event.shiftKey) {
        shiftNotes('down');
    } else if (event.key === 'Enter') {
        if (event.shiftKey) {
            // Copy when holding Shift + Enter
            copyCurrentStep();
        } else {
            // Paste on Enter
            if (copiedPattern.value) {
                pasteToCurrentStep();
            }
        }
    } else if (event.code === 'Space') {
        // Prevent default space behavior (scrolling)
        event.preventDefault();
        togglePlayback();
    }
};

const shiftNotes = (direction) => {
    const currentPattern = [...sequence.value[currentStep.value]];
    const newPattern = new Array(60).fill(false);

    for (let row = 0; row < 12; row++) {
        for (let col = 0; col < 5; col++) {
            const index = row * 5 + col;
            const currentCell = currentPattern[index];
            if (!currentCell) continue;

            let newRow = row;
            let newCol = col;
            const notesPerSection = 12;
            const currentSection = Math.floor(row / notesPerSection);

            switch (direction) {
                case 'up':
                    if (row % notesPerSection === 0) {
                        newRow = row + notesPerSection - 1;
                    } else {
                        newRow = row - 1;
                    }
                    break;
                case 'down':
                    if (row % notesPerSection === notesPerSection - 1) {
                        newRow = row - notesPerSection + 1;
                    } else {
                        newRow = row + 1;
                    }
                    break;
                case 'left':
                    if (col === 0) {
                        newCol = 4;
                    } else {
                        newCol = col - 1;
                    }
                    break;
                case 'right':
                    if (col === 4) {
                        newCol = 0;
                    } else {
                        newCol = col + 1;
                    }
                    break;
            }

            // Keep notes within their color section
            const newSection = Math.floor(newRow / notesPerSection);
            if (newSection === currentSection) {
                const newIndex = newRow * 5 + newCol;
                newPattern[newIndex] = { ...currentCell }; // Copy the cell object
            }
        }
    }

    sequence.value[currentStep.value] = newPattern;
};

const downloadMidi = () => {
    // NOTE: This is working reference code for downloading MIDI files. It also renders the first step correctly.
    // Create separate MIDI tracks for channel 0 and channel 1
    const track0 = new MidiWriter.Track();
    const track1 = new MidiWriter.Track();

    // Set the tempo on both tracks
    track0.setTempo(tempo.value);
    track1.setTempo(tempo.value);

    // Process each step in the sequence (16 steps = 1 bar)
    sequence.value.forEach((step, stepIndex) => {
        // Arrays to hold notes for each channel
        const channel0Notes = [];
        const channel1Notes = [];
        const channel0Lengths = [];
        const channel1Lengths = [];

        // Collect notes for each channel in this step
        step.forEach((cell, index) => {
            if (cell) {
                const notes = getMidiNote(index, cell.color);
                notes.forEach(({ note, channel }) => {
                    if (channel === 0) {
                        channel0Notes.push(note);
                        channel0Lengths.push(cell.noteLength);
                    } else {
                        channel1Notes.push(note);
                        channel1Lengths.push(cell.noteLength);
                    }
                });
            }
        });

        // Calculate tick for the current step (each 16th note is 32 ticks apart)
        const currentTick = stepIndex * 32;

        // Create events for each unique note length in channel 0
        const uniqueLengths0 = [...new Set(channel0Lengths)];
        uniqueLengths0.forEach(length => {
            const notesWithLength = channel0Notes.filter((_, i) => channel0Lengths[i] === length);
            if (notesWithLength.length > 0) {
                const noteEvent0 = new MidiWriter.NoteEvent({
                    pitch: notesWithLength,
                    duration: length,
                    velocity: 100,
                    channel: 1,
                    tick: currentTick
                });
                track0.addEvent(noteEvent0);
            }
        });

        // Create events for each unique note length in channel 1
        const uniqueLengths1 = [...new Set(channel1Lengths)];
        uniqueLengths1.forEach(length => {
            const notesWithLength = channel1Notes.filter((_, i) => channel1Lengths[i] === length);
            if (notesWithLength.length > 0) {
                const noteEvent1 = new MidiWriter.NoteEvent({
                    pitch: notesWithLength,
                    duration: length,
                    velocity: 100,
                    channel: 2,
                    tick: currentTick
                });
                track1.addEvent(noteEvent1);
            }
        });
    });

    // Create a new MIDI file with both tracks
    track0.mergeTrack(track1);
    const writer = new MidiWriter.Writer([track0]);

    // Create a Blob from the MIDI data
    const blob = new Blob([writer.buildFile()], { type: 'audio/midi' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sequence.mid';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
};

const handleShowNotesChanged = (value) => {
    showNotes.value = value;
};

const handleNoteLengthChanged = (length) => {
    noteLength.value = length;
};

const clearAllNotes = () => {
    // Reset all steps to empty grid
    sequence.value = Array.from({ length: patternLength.value }, () => Array(60).fill(false));
};

const handlePatternLengthChanged = (newLength) => {
    // Store current sequence
    const currentSequence = sequence.value;

    // Create new sequence with new length
    sequence.value = Array.from({ length: newLength }, (_, index) => {
        // Copy existing steps if available, otherwise create empty step
        return index < currentSequence.length ? currentSequence[index] : Array(60).fill(false);
    });

    patternLength.value = newLength;

    // Ensure currentStep is within bounds
    if (currentStep.value >= newLength) {
        currentStep.value = newLength - 1;
    }
};

onMounted(() => {
    // Focus the container to enable keyboard events
    container.value?.focus();
});

onUnmounted(() => {
    if (interval) {
        clearInterval(interval);
    }
    // Send all notes off on all channels when component is unmounted
    if (midiOutput.value) {
        for (let channel = 0; channel < 16; channel++) {
            midiOutput.value.send([0xB0 + channel, 123, 0]); // All notes off
        }
    }
});
</script>

<style>
.grid-cols-5 {
    grid-template-columns: repeat(5, 48px);
    gap: 0;
}

/* Add outline: none to remove the focus ring when container is focused */
div[tabindex="0"]:focus {
    outline: none;
}
</style>
