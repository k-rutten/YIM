<template>
    <div class="yim-actions">
        <slot></slot>
        <yim-actions-button
            ref="actionsButton"
            @showMenu="toggleActionsMenu"
            @hideMenu="hideAnyActionsMenu"></yim-actions-button>

        <portal to="application-action-menus">
            <person-invitations-actions-menu
                v-if="showActionMenu"
                ref="actionsMenu"
                :show-menu="showActionMenu"
                :menu-position="menuPosition"
                :source="source"
                @exam-add-attempt-clicked="examAddAttemptClicked"
                @exam-manually-pass-clicked="examManuallyPassClicked">
            </person-invitations-actions-menu>
        </portal>

        <confirm-modal
            :show-modal="showExamAttemptModal"
            :title="$t('ExamAddAttempt')"
            :text="$t('ExamAddAttemptValidation')"
            :cancel-text="$t('Cancel')"
            @hide-modal="showExamAttemptModal = false"
            @confirm-action="examAddTry"></confirm-modal>

        <confirm-modal
            :show-modal="showExamManuallyPassModal"
            :title="$t('ExamManuallyPass')"
            :text="$t('ExamManuallyPassValidation')"
            :cancel-text="$t('Cancel')"
            @hide-modal="showExamManuallyPassModal = false"
            @confirm-action="examForceCompletion"></confirm-modal>
    </div>
</template>

<script lang="ts" src="./person-invitations-actions.ts"></script>
