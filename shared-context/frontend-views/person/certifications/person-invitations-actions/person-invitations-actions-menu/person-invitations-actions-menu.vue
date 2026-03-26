<template>
    <ul
        v-if="showMenu"
        ref="actionsMenuRoot"
        class="actions-menu"
        :style="menuStyle">
        <li v-if="hasExamAddAttemptPermission()" class="actions-menu__menu-item">
            <button :disabled="disableActionItem('supportsAddingExamAttempts')"
                    class="actions-menu__action-button--edit"
                    @click.prevent="areYouSureToAddExamAttempt()">
                {{ $t('ExamAddAttempt') }}
            </button>
        </li>
        <li v-if="hasExamManuallyPassPermission()" class="actions-menu__menu-item">
            <button :disabled="disableActionItem('supportsManuallyPassingExams')"
                    class="actions-menu__action-button--edit"
                    @click.prevent="areYouSureToManuallyPassExam()">
                {{ $t('ExamManuallyPass') }}
            </button>
        </li>
    </ul>
</template>

<script lang="ts" src="./person-invitations-actions-menu.ts"></script>
<style lang="scss" src="./person-invitations-actions-menu.scss" scoped></style>
