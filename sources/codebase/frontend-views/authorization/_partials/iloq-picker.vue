<template>
    <entity-picker-component
        :label="$t(`iLOQ ${name}`)"
        :name="name"
        :button-text="$t('Select day time schedule')"
        :selected-item="selectedItem"
        :rules="rules"
        :selected-modal-item="selectedItemModalItem"
        :search-result="itemSearchResult"
        :list-count="itemListCount"
        :label-select-item="$t(`Select a ${name} from the column to the left.`)"
        @item-search-open="onItemSearchOpen"
        @item-remove="onItemRemove"
        @item-select="onItemSelect"
        @item-search="onItemSearch"></entity-picker-component>
</template>

<script lang="ts" src="./iloq-picker.ts"></script>
