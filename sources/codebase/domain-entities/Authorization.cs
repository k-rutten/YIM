namespace YIM.Services.Registration.Data.Entities;

using System;
using System.Collections.Generic;
using System.Linq;
using CrossTenancy.Abstractions;
using Exceptions;
using Guards;
using Workflows;
using YIM.Data;
using YIM.Data.Entities;
using YIM.Localization;

/// <summary>
/// The authorization data entity.
/// </summary>
public class Authorization : CrossTenancyConcurrencyEntityBase, IArchiveSupport
{
    private readonly List<AuthorizationZone> _zones = [];
    private readonly List<AuthorizationContractorType> _contractorTypes = [];
    private readonly List<AccessSystemAuthorization> _accessSystemAuthorizations = [];
    private readonly List<PersonRoleAuthorizationAccreditationType> _authorizationAccreditationTypes = [];
    private readonly List<AuthorizationLocation> _authorizationLocations = [];
    private readonly List<YimAsset> _yimAssets = [];

    /// <summary>
    /// Initializes a new instance of the <see cref="Authorization" /> class.
    /// </summary>
    /// <param name="authorizationId">The authorization ID.</param>
    /// <param name="name">The name.</param>
    /// <param name="locations">The locations.</param>
    /// <param name="dateTimeSchedule">The date time schedules.</param>
    /// <param name="zones">The zones.</param>
    public Authorization(
        Guid authorizationId,
        string name,
        ICollection<Location> locations,
        DateTimeSchedule dateTimeSchedule,
        ICollection<Zone> zones,
        List<YimAsset>? yimAssets = default)
    {
        ArgumentNullException.ThrowIfNull(name);

        if (authorizationId == Guid.Empty)
        {
            throw new ArgumentNullException(nameof(authorizationId));
        }

        AuthorizationId = authorizationId;
        Name = name;

        SetYimAssets(yimAssets ?? new List<YimAsset>());
        SetLocations(locations);
        SetDateTimeSchedule(dateTimeSchedule);
        SetZones(zones);
    }

    /// <summary>
    /// Prevents a default instance of the <see cref="Authorization"/> class from being created.
    /// </summary>
    /// <remarks>Used by Entity Framework.</remarks>
    private Authorization()
    {
    }

    private Authorization(Guid sourceTenantId, Guid sourceEntityId)
        : base(sourceTenantId, sourceEntityId)
    {
    }

    public static Authorization CreateFromSynchronization(
        Guid sourceTenantId,
        Authorization source,
        DateTimeSchedule destinationDateTimeSchedule,
        ICollection<YimAsset> destinationYimAssets)
    {
        ArgumentNullException.ThrowIfNull(source);
        ArgumentNullException.ThrowIfNull(destinationDateTimeSchedule);
        ArgumentNullException.ThrowIfNull(destinationYimAssets);

        var authorization = new Authorization(sourceTenantId, source.AuthorizationId)
        {
            AuthorizationId = SequentialGuid.NewGuid(),
            Name = source.Name,
            Description = source.Description,
            DateTimeScheduleId = destinationDateTimeSchedule.DateTimeScheduleId,
            DateTimeSchedule = destinationDateTimeSchedule,
            ProcessDefinitionTypes = source.ProcessDefinitionTypes,
            AuthorizationTypes = source.AuthorizationTypes,
            DisableAccreditation = source.DisableAccreditation,
            SendNotification = source.SendNotification
        };

        authorization._yimAssets.AddRange(destinationYimAssets);
        return authorization;
    }

    public void UpdateFromSynchronization(
        Guid sourceTenantId,
        Authorization source,
        DateTimeSchedule destinationDateTimeSchedule,
        ICollection<YimAsset> destinationYimAssets)
    {
        ArgumentNullException.ThrowIfNull(source);
        ArgumentNullException.ThrowIfNull(destinationDateTimeSchedule);
        ArgumentNullException.ThrowIfNull(destinationYimAssets);

        Guard.SameSourceTenant(this, sourceTenantId);

        Name = source.Name;
        Description = source.Description;
        DateTimeScheduleId = destinationDateTimeSchedule.DateTimeScheduleId;
        DateTimeSchedule = destinationDateTimeSchedule;
        ProcessDefinitionTypes = source.ProcessDefinitionTypes;
        AuthorizationTypes = source.AuthorizationTypes;
        DisableAccreditation = source.DisableAccreditation;
        SendNotification = source.SendNotification;
        SetYimAssets(destinationYimAssets);
        UpdateLastModified();
    }

    /// <summary>
    /// Gets the authorization identifier.
    /// </summary>
    public Guid AuthorizationId { get; private set; }

    /// <summary>
    /// Gets the name.
    /// </summary>
    public string Name { get; private set; } = null!;

    /// <summary>
    /// Gets the description.
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Gets the list of associated access system templates.
    /// </summary>
    public IReadOnlyCollection<AccessSystemAuthorization> AccessSystemAuthorizations => _accessSystemAuthorizations.ToList().AsReadOnly();

    /// <summary>
    /// Gets the list of associated zones.
    /// </summary>
    public IReadOnlyCollection<AuthorizationZone> Zones => _zones;

    /// <summary>
    /// Gets the process function types this gives access to.
    /// </summary>
    public ProcessDefinitionTypes ProcessDefinitionTypes { get; private set; } = ProcessDefinitionTypes.None;

    /// <summary>
    /// Gets the authorization types.
    /// </summary>
    public AuthorizationTypes AuthorizationTypes { get; private set; } = AuthorizationTypes.None;

    /// <summary>
    /// Gets the datetime schedule id.
    /// </summary>
    public Guid DateTimeScheduleId { get; private set; }

    /// <summary>
    /// Gets the datetime schedule.
    /// </summary>
    public DateTimeSchedule DateTimeSchedule { get; private set; } = null!;

    /// <summary>
    /// Gets a value indicating of this authorizations requires accreditation.
    /// </summary>
    public bool DisableAccreditation { get; private set; }

    /// <summary>
    /// Gets a value indication the accreditation per personRoleType.
    /// </summary>
    public IReadOnlyCollection<PersonRoleAuthorizationAccreditationType> AuthorizationAccreditationTypes => _authorizationAccreditationTypes;

    /// <inheritdoc/>
    public bool IsArchived { get; private set; }

    /// <inheritdoc/>
    public DateTimeOffset? ArchivedOnUtc { get; private set; }

    /// <summary>
    /// Gets a list of AuthorizationContractorTypes
    /// </summary>
    public List<AuthorizationContractorType> ContractorTypes => _contractorTypes;

    /// <summary>
    /// Gets a list of AuthorizationLocations
    /// </summary>
    public IReadOnlyCollection<AuthorizationLocation> Locations => _authorizationLocations;

    /// <summary>
    /// Gets a value indicating whether notifications are enabled.
    /// </summary>
    public bool SendNotification { get; private set; }

    public IReadOnlyCollection<YimAsset> YimAssets => _yimAssets;

    /// <summary>
    /// Sets the authorization accreditation type for a specific person role.
    /// </summary>
    /// <param name="personRoleType">The person role type.</param>
    /// <param name="accreditationType">The authorization accreditation type.</param>
    /// <param name="firstAccreditor">The first accreditor group type.</param>
    /// <param name="secondAccreditor">The second accreditor group type.</param>
    public void SetAuthorizationAccreditationType(
        PersonRoleType personRoleType,
        AuthorizationAccreditationType accreditationType,
        AccreditorGroupType? firstAccreditor,
        AccreditorGroupType? secondAccreditor)
    {
        var existing = _authorizationAccreditationTypes.Find(x => x.RoleType == personRoleType);
        if (existing != null)
        {
            existing.SetAccreditation(accreditationType, firstAccreditor, secondAccreditor);
        }
        else
        {
            _authorizationAccreditationTypes.Add(new PersonRoleAuthorizationAccreditationType(this, personRoleType, accreditationType, firstAccreditor, secondAccreditor));
        }
    }

    /// <summary>
    /// unlinks AccessSystem authorization details.
    /// </summary>
    public void UnLinkAccessSystemAuthorization(AccessControlSystem accessControlSystem)
    {
        if (_accessSystemAuthorizations.Exists(x => x.AccessControlSystem == accessControlSystem))
        {
            _accessSystemAuthorizations.RemoveAll(x => x.AccessControlSystem == accessControlSystem);
            UpdateLastModified();
        }
    }

    /// <summary>
    /// Links AccessSystem authorization details.
    /// </summary>
    /// <param name="template">The AccessSystem authorization template linked to this authorization.</param>
    public void LinkAccessSystemTemplate(AccessSystemTemplate template)
    {
        ArgumentNullException.ThrowIfNull(template);

        if (_accessSystemAuthorizations.Exists(x => x.AccessControlSystem == template.AccessSystemType
            && x is AccessSystemTemplateAuthorization a
            && a.TemplateId == template.Id))
        {
            return;
        }
        UnLinkAccessSystemAuthorization(template.AccessSystemType);

        _accessSystemAuthorizations.Add(new AccessSystemTemplateAuthorization(this, template));
        UpdateLastModified();
    }

    /// <summary>
    /// Links AccessSystem authorization details.
    /// </summary>
    /// <param name="entrance">The AccessSystem entrance linked to this authorization.</param>
    /// <param name="schedule">The AccessSystem date time schedule linked to this authorization.</param>
    public void LinkAccessSystemEntrance(AccessSystemAccess entrance, AccessSystemSchedule schedule)
    {
        ArgumentNullException.ThrowIfNull(entrance);
        ArgumentNullException.ThrowIfNull(schedule);

        if (entrance.AccessSystemType != schedule.AccessSystemType)
        {
            throw new YimInvalidOperationException("AccessSystemTypeMismatch");
        }

        if (_accessSystemAuthorizations.Exists(x => x.AccessControlSystem == entrance.AccessSystemType
            && x is AccessSystemAccessAuthorization a
            && a.AccessId == entrance.Id
            && a.ScheduleId == schedule.Id))
        {
            return;
        }

        UnLinkAccessSystemAuthorization(entrance.AccessSystemType);

        _accessSystemAuthorizations.Add(new AccessSystemAccessAuthorization(this, entrance, schedule));
        UpdateLastModified();
    }

    /// <summary>
    /// Links AccessSystem authorization details.
    /// </summary>
    /// <param name="entranceGroup">The AccessSystem entrance group linked to this authorization.</param>
    /// <param name="schedule">The AccessSystem date time schedule linked to this authorization.</param>
    public void LinkAccessSystemEntranceGroup(AccessSystemAccessGroup entranceGroup, AccessSystemSchedule schedule)
    {
        ArgumentNullException.ThrowIfNull(entranceGroup);
        ArgumentNullException.ThrowIfNull(schedule);

        if (entranceGroup.AccessSystemType != schedule.AccessSystemType)
        {
            throw new YimInvalidOperationException("AccessSystemTypeMismatch");
        }

        if (_accessSystemAuthorizations.Exists(x => x.AccessControlSystem == entranceGroup.AccessSystemType
            && x is AccessSystemAccessGroupAuthorization a
            && a.AccessGroupId == entranceGroup.Id
            && a.ScheduleId == schedule.Id))
        {
            return;
        }

        UnLinkAccessSystemAuthorization(entranceGroup.AccessSystemType);

        _accessSystemAuthorizations.Add(new AccessSystemAccessGroupAuthorization(this, entranceGroup, schedule));
        UpdateLastModified();
    }

    /// <summary>
    /// Links an access system access group authorization details.
    /// </summary>
    /// <param name="accessGroup"></param>
    /// <exception cref="ArgumentNullException"></exception>
    public void LinkAccessGroup(AccessSystemAccessGroup accessGroup)
    {
        ArgumentNullException.ThrowIfNull(accessGroup);

        if (_accessSystemAuthorizations.Exists(x => x.AccessControlSystem == accessGroup.AccessSystemType
            && x is AccessSystemAccessGroupAuthorization a
            && a.AccessGroupId == accessGroup.Id))
        {
            return;
        }

        UnLinkAccessSystemAuthorization(accessGroup.AccessSystemType);
        _accessSystemAuthorizations.Add(new AccessSystemAccessGroupAuthorization(this, accessGroup));
        UpdateLastModified();
    }

    /// <summary>
    /// Update the name of the authorization.
    /// </summary>
    /// <param name="name">The new name.</param>
    public void SetName(string name)
    {
        ArgumentNullException.ThrowIfNull(name);

        if (name != Name)
        {
            Name = name;
            UpdateLastModified();
        }
    }

    public void SetDescription(string? description)
    {
        if (description != Description)
        {
            Description = description;
            UpdateLastModified();
        }
    }

    /// <summary>
    /// Update the accreditation requirement of the authorization.
    /// </summary>
    /// <param name="disableAccreditation">The new value.</param>
    public void SetDisableAccreditation(bool disableAccreditation)
    {
        if (disableAccreditation != DisableAccreditation)
        {
            DisableAccreditation = disableAccreditation;
            UpdateLastModified();
        }
    }

    /// <summary>
    /// Sets the date time schedule.
    /// </summary>
    /// <param name="dateTimeSchedule">The date time schedule.</param>
    public void SetDateTimeSchedule(DateTimeSchedule dateTimeSchedule)
    {
        if (dateTimeSchedule == null)
        {
            throw new YimEntityNotFoundException("Date time schedule is invalid.");
        }

        // Write Validator
        // Ensure that Authorization Has a Salto / AEOS Schedule
        var requiresAeosSchedule = _yimAssets.Any(x => x.AccessSystemType == AccessControlSystem.Aeos && x.RequiresSchedule);
        var requiresSaltoSchedule = _yimAssets.Any(x => x.AccessSystemType == AccessControlSystem.Salto && x.RequiresSchedule);

        if (dateTimeSchedule.AeosScheduleId is null && requiresAeosSchedule)
        {
            throw new YimInvalidOperationException(ExceptionLocalizerId.DayTimeScheduleAEOSConnectionRequired);
        }

        if (dateTimeSchedule.SaltoScheduleId is null && requiresSaltoSchedule)
        {
            throw new YimInvalidOperationException(ExceptionLocalizerId.DayTimeScheduleSaltoConnectionRequired);
        }


        if (DateTimeScheduleId != dateTimeSchedule.DateTimeScheduleId)
        {
            DateTimeSchedule = dateTimeSchedule;
            DateTimeScheduleId = dateTimeSchedule.DateTimeScheduleId;
            UpdateLastModified();
        }
    }

    /// <summary>
    /// Sets the process function types.
    /// </summary>
    /// <param name="processDefinitionTypes">The process function types.</param>
    public void SetProcessDefinitionTypes(ProcessDefinitionTypes processDefinitionTypes)
    {
        ProcessDefinitionTypes = processDefinitionTypes.EncodeHiddenTypes();
        UpdateLastModified();
    }

    /// <summary>
    /// Sets the authorization types.
    /// </summary>
    /// <param name="authorizationTypes">The authorization types.</param>
    public void SetAuthorizationTypes(AuthorizationTypes authorizationTypes)
    {
        AuthorizationTypes = authorizationTypes;
        UpdateLastModified();
    }

    /// <summary>
    /// Sets the zones.
    /// </summary>
    /// <param name="source">The zones.</param>
    public void SetZones(ICollection<Zone> source)
    {
        if (source.IsNullOrEmpty())
        {
            throw new YimInvalidOperationException("At least one zone must be selected.");
        }

        var hasRemoved = _zones.RemoveAll(x => !source.Any(y => y.ZoneId == x.ZoneId)) > 0;
        var toAdd = source.Where(x => !_zones.Exists(y => y.ZoneId == x.ZoneId)).Select(x => new AuthorizationZone(this, x)).ToList();
        if (toAdd.Count > 0)
        {
            _zones.AddRange(toAdd);
        }

        if (hasRemoved || toAdd.Count > 0)
        {
            UpdateLastModified();
        }
    }

    /// <inheritdoc/>
    public void Archive()
    {
        IsArchived = true;
        ArchivedOnUtc = DateTimeOffset.UtcNow;
    }

    /// <inheritdoc/>
    public void UnArchive()
    {
        IsArchived = false;
        ArchivedOnUtc = null;
    }

    /// <summary>
    /// Sets the contractor types for which this authorization is available
    /// </summary>
    /// <param name="contractorTypes">The contractor types</param>
    public void SetContractorTypes(ICollection<ContractorType>? contractorTypes)
    {
        ArgumentNullException.ThrowIfNull(contractorTypes);

        var hasAdded = false;
        foreach (var contractorType in contractorTypes.Where(x => !_contractorTypes.Exists(ct => ct.ContractorTypeId == x.Id)))
        {
            _contractorTypes.Add(new AuthorizationContractorType(this, contractorType));
            hasAdded = true;
        }

        var hasRemoved = _contractorTypes.RemoveAll(x => !contractorTypes.Any(ct => ct.Id == x.ContractorTypeId)) > 0;

        if (hasAdded || hasRemoved)
        {
            UpdateLastModified();
        }
    }

    /// <summary>
    /// Sets the locations.
    /// </summary>
    /// <param name="locations">The locations.</param>
    public void SetLocations(ICollection<Location> locations)
    {
        if (locations.IsNullOrEmpty())
        {
            throw new YimInvalidOperationException("At least one location must be selected.");
        }

        var hasRemoved = _authorizationLocations.RemoveAll(x => !locations.Any(y => y.LocationId == x.LocationId)) > 0;
        var toBeAdded = locations.Where(x => !_authorizationLocations.Exists(y => y.LocationId == x.LocationId)).Select(x => new AuthorizationLocation(this, x)).ToList();

        if (toBeAdded.Count > 0)
        {
            _authorizationLocations.AddRange(toBeAdded);
        }

        if (hasRemoved || toBeAdded.Count > 0)
        {
            UpdateLastModified();
        }
    }

    public void SetSendNotification(bool sendNotification)
    {
        if (SendNotification != sendNotification)
        {
            SendNotification = sendNotification;
        }
    }

    public void SetYimAssets(ICollection<YimAsset> yimAssets)
    {
        if (_yimAssets.SetCollection(yimAssets, (s, t) => s == t, x => x))
        {
            UpdateLastModified();
        }
    }
}
