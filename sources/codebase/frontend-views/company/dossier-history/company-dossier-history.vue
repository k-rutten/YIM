<template>
    <div v-if="dossierHistory">
        <yim-dossier-timeline :dossier-history="dossierHistory"></yim-dossier-timeline>
    </div>
</template>

<script lang="ts" src="./company-dossier-history.ts"></script>
