<template>
    <div>
        <kendo-grid
            class="k-grid--clickable k-grid--height-auto k-grid--no-padding-header"
            :columns="columns"
            :data-items="identifierRequests"
            :skip="skip"
            :page-size="pageSize"
            :pageable="getPageOptions"
            :total="pageCount"
            @pagechange="onPageChange">
            <template #date="{props}">
                <td>
                    {{ formatMaxDate(props.dataItem[props.field]) }}
                </td>
            </template>
            <template #state="{props}">
                <td>
                    <yim-status-indicator :state="getStateClassModifier(props.dataItem.status)">
                        {{ getStateName(props.dataItem.status) }}
                    </yim-status-indicator>
                </td>
            </template>

            <template #actions="{props}">
                <td class="k-grid__column-actions">
                    <yim-identifier-actions
                        :person-id="personId"
                        :identifier-id="props.dataItem.identifierId"
                        :identifier-status="props.dataItem.status"
                        :credential-production-type="props.dataItem.producedBy"
                        :credential-technology-type="props.dataItem.technology"
                        :identifier-request-id="props.dataItem.requestId"
                        :credential-variant-id="props.dataItem.credentialVariantId"
                        :credential-variant-name="props.dataItem.credentialVariantName"
                        :has-link-unlink="props.dataItem.hasLinkUnlink"
                        :delivery-type="props.dataItem.cardLocationDeliveryType"
                        :has-external-source="props.dataItem.hasExternalSource"
                        @revoke="updatePersonIdentifiers">
                    </yim-identifier-actions>
                </td>
            </template>
        </kendo-grid>
    </div>
</template>

<script lang="ts" src="./person-identifiers-production-table.ts"></script>
