<template>
    <div>
        <action
            v-if="hasUploadPhotoPermission"
            :title="$t('PhotoUpload')"
            @click.native="openPhotoEditor"></action>
        <yim-modal
            :show="showPhotoEditor"
            :show-header="true"
            :show-close="true"
            type="small"
            @close="closePhotoEditor(true)">
            <template #default>
                <icon-spinner v-if="imageIsBeingUploaded"></icon-spinner>

                <form-field-image-upload
                    v-if="showPhotoEditor"
                    v-show="!imageIsBeingUploaded"
                    name="photo"
                    type="text"
                    :image-url="photoBlobUrl"
                    :has-face-detection="true"
                    :hint="$t('Only .jpg and .png files are allowed.')"
                    :reset-image="resetImage"
                    :image-configuration="photoConfiguration"
                    :upload-error="uploadErrors"
                    :upload-errors="uploadErrors"
                    :label="$t('Photo')"
                    :is-compact="true"
                    property-name="PersonPhoto_fileReference"
                    data-cy="form-field-image-upload-photo"
                    @change="uploadPhoto($event)">
                </form-field-image-upload>
            </template>
            <template #actions>
                <yim-button
                    type="ghost"
                    data-cy="button-cancel"
                    @click="closePhotoEditor(true)">
                    {{ $t('Close') }}
                </yim-button>
            </template>
        </yim-modal>
    </div>
</template>

<script lang="ts" src="./person-photo-upload-action.ts"></script>
