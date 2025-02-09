<template>
    <div class="grid grid-cols-5" @mousedown="startPainting" @mouseup="stopPainting" @mouseleave="stopPainting">
        <div v-for="(cell, index) in gridData" :key="index" @mousedown.prevent="startPainting($event, index)"
            @mouseenter="handleMouseEnter(index)" :data-index="index" :class="[
                'w-12 h-12 cursor-pointer transition-colors relative border-r border-b border-gray-600',
                cell ? getColorClass(cell) : 'bg-grid-cell hover:bg-gray-800',
                index % 5 === 0 ? 'border-l' : '',
                index < 5 ? 'border-t' : ''
            ]">
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

const getColorClass = (cell) => {
    // Return the proper Tailwind background class based on the color assigned
    switch (cell) {
        case 'blue': return 'bg-blue-600';
        case 'red': return 'bg-red-600';
        case 'green': return 'bg-green-600';
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
</script>

<style scoped>
.grid-cols-5 {
    grid-template-columns: repeat(5, 48px);
    gap: 0;
}
</style>
