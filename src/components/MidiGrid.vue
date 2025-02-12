<template>
    <div class="grid grid-cols-5" @mousedown="startPainting" @mouseup="stopPainting" @mouseleave="stopPainting">
        <div v-for="(cell, index) in gridData" :key="index" @mousedown.prevent="startPainting($event, index)"
            @mouseenter="handleMouseEnter(index)" :data-index="index" :class="[
                'w-12 h-12 cursor-pointer transition-colors relative border-r border-b border-gray-600',
                cell ? getColorClass(cell.color) : 'bg-grid-cell hover:bg-gray-800',
                index % 5 === 0 ? 'border-l' : '',
                index < 5 ? 'border-t' : ''
            ]" @contextmenu.prevent="cycleNoteLength(index)">
            <!-- Note length indicator -->
            <div v-if="cell" class="absolute bottom-1 right-1 flex gap-0.5">
                <div v-for="dot in getNoteLengthDots(cell.noteLength)" :key="dot"
                    class="w-1 h-1 bg-black opacity-50 rounded-full">
                </div>
            </div>
            <template v-if="showNotes">
                <!-- Blue note (top-left) -->
                <span class="absolute top-1 left-1 text-xs opacity-50 text-blue-300">
                    {{ getBlueNote(index) }}
                </span>
                <!-- Red note (top-right) -->
                <span class="absolute top-1 right-1 text-xs opacity-50 text-red-300">
                    {{ getRedNote(index) }}
                </span>
                <!-- Green note (bottom) -->
                <span class="absolute bottom-1 left-1 text-xs opacity-50 text-green-300">
                    {{ getGreenNote(index) }}
                </span>
            </template>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
    gridData: {
        type: Array,
        required: true
    },
    showNotes: {
        type: Boolean,
        default: true
    },
    noteLength: {
        type: String,
        default: '16'
    }
});

const emit = defineEmits(['toggle-cell', 'stop-painting']);
const isPainting = ref(false);
const paintValue = ref(false);

const startPainting = (event, index) => {
    if (index !== undefined) {
        isPainting.value = true;
        paintValue.value = true;
        emit('toggle-cell', { index, value: true });
    }
};

const stopPainting = () => {
    isPainting.value = false;
    emit('stop-painting');
};

const handleMouseEnter = (index) => {
    if (isPainting.value) {
        emit('toggle-cell', { index, value: true });
    }
};

const cycleNoteLength = (index) => {
    const cell = props.gridData[index];
    if (!cell) return;

    const lengths = ['16', '32', '64'];
    const currentIndex = lengths.indexOf(cell.noteLength);
    const nextIndex = (currentIndex + 1) % lengths.length;
    const newLength = lengths[nextIndex];

    // Update the cell with the new note length
    emit('toggle-cell', {
        index,
        value: true,
        updateNoteLength: true,
        noteLength: newLength
    });
};

const getColorClass = (color) => {
    // Return the proper Tailwind background class based on the color assigned
    switch (color) {
        case 'blue': return 'bg-blue-600';
        case 'red': return 'bg-red-600';
        case 'green': return 'bg-green-600';
        case 'cyan': return 'bg-cyan-500';
        case 'magenta': return 'bg-fuchsia-500';
        case 'yellow': return 'bg-yellow-500';
        case 'white': return 'bg-white';
        default: return '';
    }
};

const getBlueNote = (index) => {
    const col = index % 5;
    const row = Math.floor(index / 5);
    if (row < 12) {
        const useChannel1 = col >= 3;
        const adjustedCol = useChannel1 ? col - 3 : col;
        const startNote = 127 - (adjustedCol * 36); // Each column starts 36 notes lower
        const note = startNote - row;
        return note >= 0 && note <= 127 ? note : '';
    }
    return '';
};

const getRedNote = (index) => {
    const col = index % 5;
    const row = Math.floor(index / 5);
    if (row < 12) {
        const useChannel1 = col >= 3;
        const adjustedCol = useChannel1 ? col - 3 : col;
        const startNote = 115 - (adjustedCol * 36); // Starts 12 notes lower than blue section
        const note = startNote - row;
        return note >= 0 && note <= 127 ? note : '';
    }
    return '';
};

const getGreenNote = (index) => {
    const col = index % 5;
    const row = Math.floor(index / 5);
    if (row < 12) {
        const useChannel1 = col >= 3;
        const adjustedCol = useChannel1 ? col - 3 : col;
        const startNote = 103 - (adjustedCol * 36); // Starts 12 notes lower than red section
        const note = startNote - row;
        return note >= 0 && note <= 127 ? note : '';
    }
    return '';
};

const getNoteLengthDots = (noteLength) => {
    switch (noteLength) {
        case '64': return 3; // Three dots for 1/64
        case '32': return 2; // Two dots for 1/32
        case '16': return 1; // One dot for 1/16
        default: return 1;
    }
};
</script>

<style scoped>
.grid-cols-5 {
    grid-template-columns: repeat(5, 48px);
    gap: 0;
}
</style>
