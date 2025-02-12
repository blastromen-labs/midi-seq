<template>
    <nav class="fixed top-0 left-0 right-0 bg-gray-900 border-b border-gray-800 z-10">
        <div class="w-full px-4 sm:px-6 lg:px-8 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2">
                        <button @click="$emit('copy')"
                            class="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 text-sm relative group"
                            :disabled="copiedPattern" :class="{ 'opacity-50 cursor-not-allowed': copiedPattern }">
                            Copy
                            <div
                                class="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Shift + Enter
                            </div>
                        </button>
                        <button @click="$emit('paste')"
                            class="px-3 py-1 rounded bg-yellow-600 text-white hover:bg-yellow-700 text-sm relative group"
                            :disabled="!copiedPattern" :class="{ 'opacity-50 cursor-not-allowed': !copiedPattern }">
                            Paste
                            <div
                                class="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Enter
                            </div>
                        </button>
                        <button v-if="copiedPattern" @click="$emit('clear')"
                            class="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-sm relative group">
                            Clear
                            <div
                                class="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Clear clipboard
                            </div>
                        </button>
                        <button @click="$emit('clearAllNotes')"
                            class="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-sm relative group">
                            Clear All
                            <div
                                class="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Clear all notes
                            </div>
                        </button>
                    </div>
                    <div class="h-6 w-px bg-gray-700"></div>
                    <div class="flex items-center gap-2">
                        <label class="text-white text-sm">Note Length:</label>
                        <select v-model="selectedNoteLength" @change="noteTypeChanged"
                            class="bg-gray-700 text-white rounded px-3 py-1.5 text-sm border border-gray-600 hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none">
                            <option value="16">1/16</option>
                            <option value="32">1/32</option>
                            <option value="64">1/64</option>
                        </select>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2">
                        <label class="text-white text-sm">Show Notes</label>
                        <button @click="toggleShowNotes" :class="[
                            'w-12 h-6 rounded-full transition-colors relative px-0.5 flex items-center',
                            showNotes ? 'bg-blue-600 justify-end' : 'bg-gray-600 justify-start'
                        ]">
                            <span class="block w-5 h-5 rounded-full bg-white transition-all"></span>
                        </button>
                    </div>
                    <div v-if="midiSupported" class="flex items-center gap-2">
                        <label class="text-white text-sm">MIDI Output:</label>
                        <select v-model="selectedDevice" @change="selectMidiOutput"
                            class="bg-gray-700 text-white rounded px-3 py-1.5 text-sm border border-gray-600 hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none">
                            <option value="">Select device...</option>
                            <option v-for="device in midiOutputs" :key="device.id" :value="device.id">
                                {{ device.name }}
                            </option>
                        </select>
                    </div>
                    <div v-else class="text-red-500 text-sm">
                        MIDI not supported in this browser
                    </div>
                </div>
            </div>
        </div>
    </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
    copiedPattern: {
        type: Array,
        default: null
    },
    noteLength: {
        type: String,
        default: '16'
    }
});

const midiSupported = ref(false);
const midiOutputs = ref([]);
const selectedDevice = ref('');
const showNotes = ref(false);
const selectedNoteLength = ref(props.noteLength);

const emit = defineEmits(['midiOutputSelected', 'showNotesChanged', 'copy', 'paste', 'clear', 'noteLengthChanged', 'clearAllNotes']);

const noteTypeChanged = () => {
    emit('noteLengthChanged', selectedNoteLength.value);
};

const toggleShowNotes = () => {
    showNotes.value = !showNotes.value;
    emit('showNotesChanged', showNotes.value);
};

const initializeMidi = async () => {
    try {
        if (navigator.requestMIDIAccess) {
            const midiAccess = await navigator.requestMIDIAccess();
            midiSupported.value = true;
            updateMidiOutputs(midiAccess);

            // Listen for MIDI device connection changes
            midiAccess.onstatechange = (e) => {
                updateMidiOutputs(midiAccess);
            };
        }
    } catch (err) {
        console.error('MIDI access failed:', err);
        midiSupported.value = false;
    }
};

const updateMidiOutputs = (midiAccess) => {
    const outputs = [];
    midiAccess.outputs.forEach(output => {
        outputs.push({
            id: output.id,
            name: output.name || `Output ${outputs.length + 1}`,
            output: output
        });
    });
    midiOutputs.value = outputs;

    // If the currently selected device is no longer available, clear the selection
    if (selectedDevice.value && !outputs.find(o => o.id === selectedDevice.value)) {
        selectedDevice.value = '';
        emit('midiOutputSelected', null);
    }
};

const selectMidiOutput = () => {
    const selectedOutput = midiOutputs.value.find(o => o.id === selectedDevice.value);
    emit('midiOutputSelected', selectedOutput ? selectedOutput.output : null);
};

onMounted(() => {
    initializeMidi();
});
</script>
