<template>
    <div class="identifier-actions">
        <yim-status-indicator :state="getStateClassModifier(workFlowState)">
            {{ getLocalizedCredentialRequestWorkflowStateName(workFlowState) }}
        </yim-status-indicator>
        <yim-actions-button
            v-if="(workFlowState !== identifierRequestWorkflowState.ReadyForProduction) && (workFlowState !== identifierRequestWorkflowState.ReadyForRevoke)"
            ref="actionsButton"
            @showMenu="toggleMenu"
            @hideMenu="closeMenu"></yim-actions-button>

        <portal to="application-action-menus">
            <ul
                v-if="showMenu"
                ref="actionsMenuRoot"
                v-click-away="closeMenu"
                class="identifier-actions__actions-menu"
                :style="menuStyle">
                <li class="identifier-actions__menu-item">
                    <button
                        class="identifier-actions__action-button"
                        @click="onViewDetailsAction($event)">
                        {{ $t('ShowDetails') }}
                    </button>
                </li>
                <li v-if="isLinkUnlinkAction" class="identifier-actions__menu-item">
                    <button
                        :disabled="actionButtonIsDisabled"
                        class="identifier-actions__action-button"
                        @click="onLinkUnlinkAction">
                        {{ hasIdentifier ? $t('Unlink') : $t('Link') }}
                    </button>
                </li>
                <li v-if="isEditAction" class="identifier-actions__menu-item">
                    <button
                        :disabled="actionButtonIsDisabled"
                        class="identifier-actions__action-button"
                        @click="onEditAction">
                        {{ $t('Continue') }}
                    </button>
                </li>
                <li v-if="isRevokeAction && currentUserIsRequestor" class="identifier-actions__menu-item">
                    <button
                        :disabled="actionButtonIsDisabled"
                        class="identifier-actions__action-button"
                        @click="onShowConfirmModal">
                        {{ $t('Revoke') }}
                    </button>
                </li>
                <li v-if="isCancelAction" class="identifier-actions__menu-item">
                    <button
                        :disabled="actionButtonIsDisabled"
                        class="identifier-actions__action-button identifier-actions__action-button--warning"
                        @click="onShowConfirmModal">
                        {{ workFlowState === identifierRequestWorkflowState.ReadyForCooldown ? $t('CancelCooldown') : $t('DeleteConcept') }}
                    </button>
                </li>
                <li v-if="isReplaceAction" class="identifier-actions__menu-item">
                    <button
                        :disabled="actionButtonIsDisabled"
                        class="identifier-actions__action-button"
                        @click="onRequestAction">
                        {{ $t('Replace') }}
                    </button>
                </li>
                <li v-if="isRequestAction" class="identifier-actions__menu-item">
                    <button
                        :disabled="actionButtonIsDisabled"
                        class="identifier-actions__action-button"
                        @click="onRequestAction">
                        {{ $t('RequestAction') }}
                    </button>
                </li>
                <li v-if="canCancelLinkUnlink" class="identifier-actions__menu-item">
                    <button
                        class="identifier-actions__action-button"
                        @click.prevent="onShowCancelLinkUnlinkModal">
                        {{ $t('CancelRequest') }}
                    </button>
                </li>
            </ul>
        </portal>

        <portal to="application-modals">
            <confirm-modal
                :show-modal="showConfirmModal"
                :title="isReadyForCooldown ? $t('CancelCooldown') : $t('DeleteConcept')"
                :text="isReadyForCooldown ? $t('CancelCooldown') : $t('DeleteConcept')"
                :cancel-text="$t('Cancel')"
                :processing="actionButtonIsDisabled"
                @hide-modal="showConfirmModal = false"
                @confirm-action="onCancelAction"></confirm-modal>

            <confirm-modal
                :show-modal="showCancelLinkUnlinkModal"
                :title="$t('CancelLinkUnlinkRequest')"
                :text="$t('AreYouSureToCancelLinkUnlinkRequest')"
                :cancel-text="$t('No')"
                :save-text="$t('Yes')"
                @hide-modal="showCancelLinkUnlinkModal = false"
                @confirm-action="onConfirmCancelLinkUnlink">
            </confirm-modal>
        </portal>
    </div>
</template>
<script lang="ts" src="./identifier-actions.ts"></script>
<style lang="scss" src="./identifier-actions.scss" scoped></style>
