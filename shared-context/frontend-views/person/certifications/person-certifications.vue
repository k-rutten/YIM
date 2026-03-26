<template>
    <div class="person__content">
        <div class="person__details">
            <person-certifications-table></person-certifications-table>

            <person-invitations-table></person-invitations-table>

            <yim-pagination :total-items="totalItems"></yim-pagination>
        </div>
    </div>
</template>

<script lang="ts" src="./person-certifications.ts"></script>
