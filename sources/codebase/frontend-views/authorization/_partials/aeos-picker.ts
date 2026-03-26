import { Component, Emit, mixins, Prop } from 'vue-facing-decorator';
import EntityPickerComponent from '@src/components/entity-picker-component/entity-picker-component.vue';
import BaseMixin from '@src/utils/mixins/base-mixin';
import FilterMixin from 'yim-common/src/utils/mixins/filter-mixin';
import AuthorizationMixin from '@src/utils/mixins/authorization-mixin';
import ProcessMixin from '@src/utils/mixins/process-mixin';
import { SelectedItem } from '@src/models/models';
import { DetailModalItem, SelectModalItem } from 'yim-common/src/models/models';
import { PageRequest, PageResource } from '@src/models/generated/common';
import { defaultPageSize } from '@src/utils/types/pagination-options';
import { registrationApiService } from '@src/services';
import { HttpResponse } from 'yim-common/src/utils/helpers/http-utils';
import { AccessControlSystem } from '../../../models/generated/registration';

@Component({
    components: {
        'entity-picker-component': EntityPickerComponent
    },
    emits: ['selected-item-changed']
})

export default class AeosPicker extends mixins(BaseMixin, FilterMixin, AuthorizationMixin, ProcessMixin)
{
    @Prop()
    variant: string;

    @Prop()
    readonly rules!: string | object;

    @Prop()
    readonly alreadySelected!: SelectedItem;

    selectedItem: SelectedItem | null = null;
    selectedItemModalItem: SelectModalItem | null = null;
    itemListCount = 0;
    selectedItemId: string | null = null;
    itemList: SelectedItem[] = [];
    response: HttpResponse<PageResource<SelectedItem>>;

    get name(): string
    {
        switch (this.variant)
        {
            case 'AEOS template':
                return 'template';
            case 'AEOS day time schedule':
                return 'day time schedule';
            case 'AEOS access':
                return 'access';
            case 'AEOS access group':
                return 'access group';
            default: return '';
        }
    }

    get itemSearchResult(): DetailModalItem[]
    {
        return this.itemList.map((item: SelectedItem) =>
        {
            return new DetailModalItem({
                id: item.id.toString(),
                name: item.name,
                subtitle: item.description
            });
        });
    }

    async created(): Promise<void>
    {
        this.selectedItem = this.alreadySelected;
        await this.getInitialData();
    }

    onItemSearchOpen(): void
    {
        this.onItemSearch(new PageRequest({
            pageSize: defaultPageSize,
            page: 1
        }));
    }

    async onItemSearch(filter: PageRequest): Promise<void>
    {
        const pageRequestFilters = new PageRequest({
            search: filter.search,
            pageSize: filter.pageSize,
            page: filter.page,
            orderBy: filter.orderBy
        });

        switch (this.variant)
        {
            case 'AEOS template':
                this.response = await registrationApiService.findAccessSystemTemplates(AccessControlSystem.Aeos, pageRequestFilters);
                break;
            case 'AEOS day time schedule':
                this.response = await registrationApiService.findAccessSystemDateTimeSchedules(AccessControlSystem.Aeos, pageRequestFilters);
                break;
            case 'AEOS access':
                this.response = await registrationApiService.findAccessSystemAccesses(AccessControlSystem.Aeos, pageRequestFilters);
                break;
            case 'AEOS access group':
                this.response = await registrationApiService.findAccessSystemAccessGroups(AccessControlSystem.Aeos, pageRequestFilters);
                break;
        }
        if (this.response.isSuccess)
        {
            this.itemList = this.response.data.items;
            this.itemListCount = this.response.data.totalCount ?? this.itemList.length;
        }
        else
        {
            this.itemList = [];
            this.itemListCount = 0;
        }
    }

    async onItemSelect(dayTimeSchedule: DetailModalItem): Promise<void>
    {
        this.selectedItem = new SelectedItem({
            id: Number(dayTimeSchedule.id),
            name: dayTimeSchedule.name,
            description: dayTimeSchedule.description?.toString()
        });
        this.selectedItemId = this.selectedItem.id.toString();
        this.notifyItemChanged();
    }

    async onItemRemove(): Promise<void>
    {
        this.selectedItem = null;
        this.selectedItemId = null;
        this.selectedItemModalItem = null;
        this.notifyItemChanged();
    }

    @Emit('selected-item-changed')
    notifyItemChanged(): string | null
    {
        return this.selectedItemId || null;
    }
}
