<template>
    <nav class="w-full bg-gray-900 border-b border-gray-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div class="flex items-center justify-end">
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

const midiSupported = ref(false);
const midiOutputs = ref([]);
const selectedDevice = ref('');
const showNotes = ref(false);

const emit = defineEmits(['midiOutputSelected', 'showNotesChanged']);

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
