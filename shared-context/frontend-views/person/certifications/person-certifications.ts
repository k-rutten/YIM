import { Component, mixins } from 'vue-facing-decorator';
import BaseMixin from '@src/utils/mixins/base-mixin';
import KendoTableMixin from '@src/utils/mixins/kendo-table-mixin';
import EnumLocalizerMixin from '@src/utils/mixins/enum-localizer-mixin';
import { usePersonInvitationsStore } from '@src/store/person-invitations-module';
import { usePersonCertificatesStore } from '@src/store/person-certifications-module';

@Component
export default class PersonCertifications extends mixins(BaseMixin, KendoTableMixin, EnumLocalizerMixin)
{
    private readonly _personInvitationsStore = usePersonInvitationsStore();
    private readonly _personCertificatesStore = usePersonCertificatesStore();

    get totalItems(): number
    {
        return Math.max(this._personCertificatesStore.certificatesCount, this._personInvitationsStore.invitationsCount);
    }
}
