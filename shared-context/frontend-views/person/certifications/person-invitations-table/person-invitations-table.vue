<template>
    <div>
        <template v-if="invitations && invitations.length">
            <kendo-grid :columns="columns"
                        class="k-grid"
                        :sortable="{ mode: 'multiple' }"
                        :sort="kendoSort"
                        :data-items="invitations"
                        @sortchange="onKendoSortChange">
                <template #name="{props}">
                    <td>
                        {{ props.dataItem.name }}
                    </td>
                </template>
                <template #platform="{props}">
                    <td>
                        {{ props.dataItem.elearningPlatformName }}
                    </td>
                </template>
                <template #date="{props}">
                    <td>
                        {{ formatYimDate(props.dataItem.validUntillUtc) }}
                    </td>
                </template>
                <template #state="{props}">
                    <td>
                        <yim-status-indicator :state="getInvitationStateClassModifier(props.dataItem.invitationState)">
                            {{ getInvitationStateName(props.dataItem.invitationState) }}
                        </yim-status-indicator>
                    </td>
                </template>
                <template #actions="{props}">
                    <td>
                        <person-invitations-actions :person-id="personId"
                                                    :source="props.dataItem">
                        </person-invitations-actions>
                    </td>
                </template>
            </kendo-grid>
        </template>

        <no-results v-else :text="$t('NoElearningInvitationsFound')"></no-results>
    </div>
</template>

<script lang="ts" src="./person-invitations-table.ts"></script>
