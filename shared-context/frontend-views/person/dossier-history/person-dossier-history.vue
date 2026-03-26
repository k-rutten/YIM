<template>
    <div v-if="dossierHistory" class="person__content">
        <yim-dossier-timeline :dossier-history="dossierHistory"></yim-dossier-timeline>
    </div>
</template>

<script lang="ts" src="./person-dossier-history.ts"></script>
