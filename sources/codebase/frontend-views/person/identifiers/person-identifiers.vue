<template>
    <div>
        <table-header :title="$t('Identifiers')">
            <form-field-buttons-toggle
                v-model="productionTable"
                :use-boolean="true"
                :options="[{name: $t('Active'), value: true}, {name: $t('Requests'), value: false}]"
                data-cy="toggle-accredit"
                class="visitor-arrivals-overview__button"
                :table="true">
            </form-field-buttons-toggle>
        </table-header>

        <person-identifiers-production-table
            v-if="productionTable"
            :person="person"
            :person-id="personId">
        </person-identifiers-production-table>

        <person-identifiers-request-table
            v-else-if="!productionTable"
            :person="person"
            :person-id="personId">
        </person-identifiers-request-table>

        <no-results v-else :text="$t('NoActiveIdentifierFound')"></no-results>
    </div>
</template>

<script lang="ts" src="./person-identifiers.ts"></script>
<style lang="scss" src="./person-identifiers.scss"></style>
