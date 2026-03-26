<template>
    <div>
        <template v-if="certificates && certificates.length">
            <kendo-grid :columns="columns"
                        class="k-grid"
                        :sortable="{ mode: 'multiple' }"
                        :sort="kendoSort"
                        :data-items="certificates"
                        @sortchange="onKendoSortChange">
                <template #name="{props}">
                    <td>
                        {{ props.dataItem.certificateName }}
                    </td>
                </template>
                <template #date="{props}">
                    <td>
                        {{ formatYimDate(props.dataItem.validUntillUtc) }}
                    </td>
                </template>
                <template #state="{props}">
                    <td>
                        <yim-status-indicator :state="getCertificateStateClassModifier(props.dataItem.certificateState)">
                            {{ getCertificateStateName(props.dataItem.certificateState) }}
                        </yim-status-indicator>
                    </td>
                </template>
            </kendo-grid>
        </template>

        <no-results v-else :text="$t('NoCertificationsFound')"></no-results>
    </div>
</template>

<script lang="ts" src="./person-certifications-table.ts"></script>
