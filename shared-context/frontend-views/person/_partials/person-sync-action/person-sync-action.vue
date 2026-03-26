<template>
    <div>
        <action
            v-if="isAdministrator"
            :title="$t('SynchronizePerson')"
            :check="true"
            @click.native="debounceSynchronizePerson"></action>
    </div>
</template>

<script lang="ts" src="./person-sync-action.ts"></script>
