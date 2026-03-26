<template>
    <div>
        <kendo-grid
            :columns="columns"
            :data-items="identifiers"
            :skip="skip"
            :page-size="pageSize"
            :pageable="getPageOptions"
            :total="totalItems"
            :sortable="{ mode: 'multiple' }"
            :sort="kendoSort"
            class="k-grid--height-auto k-grid--no-padding-header"
            @sortchange="onKendoSortChange"
            @pagechange="onPageChange">
            <template #state="{props}">
                <td class="k-grid__column-actions">
                    <identifier-actions
                        v-if="!isLicensePlate(props)"
                        :work-flow-state="props.dataItem.identifierRequestWorkflowState"
                        :type="props.dataItem.credentialVariantId"
                        :request-id="props.dataItem.identifierRequestId"
                        :identifier-id="props.dataItem.identifierId"
                        :has-identifier="props.dataItem.hasIdentifier"
                        :has-link-unlink="props.dataItem.hasLinkUnlink"
                        :can-cancel-link-unlink="props.dataItem.canCancelLinkUnlink"
                        :production-type="props.dataItem.producedBy"
                        :technology-type="props.dataItem.technology"
                        :requestor-id="props.dataItem.requestorId"
                        :current-user-profile-id="userProfileId"
                        @refresh="loadIdentifiersRequests()"
                        @view-details="onViewDetails">
                    </identifier-actions>
                </td>
            </template>

            <template #date-submitted="{props}">
                <td>
                    {{ formatYimDate(getIdentifierRequestDate(props.dataItem)) }}
                </td>
            </template>
            <template #date="{props}">
                <td>
                    {{ formatMaxDate(props.dataItem[props.field]) }}
                </td>
            </template>
        </kendo-grid>

        <identifier-request-state-modal
            v-if="showIdentifierRequestId && showDetailModal"
            :show="showDetailModal"
            :enable-order-link="true"
            :show-dossier-link="false"
            :identifier-request-id="showIdentifierRequestId"
            @close="closeDetailModal">
        </identifier-request-state-modal>
    </div>
</template>

<script lang="ts" src="./person-identifiers-request-table.ts"></script>
