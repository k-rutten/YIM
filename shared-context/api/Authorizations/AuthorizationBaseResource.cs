namespace YIM.Services.Registration.ApiModels.Authorizations;

using System;
using System.Collections.Generic;
using Locations;
using YIM.ApiModels;
using ContractorTypes;
using YIM.Workflows;
using ApiModels.YimAssets;
using YIM.Services.Registration.ApiModels.Zone;

/// <summary>
/// The authorization resource class.
/// </summary>
public abstract class AuthorizationBaseResource : WebResource
{
    /// <summary>
    /// Gets the authorization identifier.
    /// </summary>
    public Guid AuthorizationId { get; set; }

    /// <summary>
    /// Gets the name.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets the description.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets the disable accreditation value.
    /// </summary>
    public bool DisableAccreditation { get; set; }

    /// <summary>
    /// Gets the location.
    /// </summary>
    public IList<LocationReferenceResource> Locations { get; set; } = [];

    /// <summary>
    /// Gets the date time schedule.
    /// </summary>
    public DateTimeScheduleResource DateTimeSchedule { get; set; } = null!;

    /// <summary>
    /// Gets or sets the zones.
    /// </summary>
    public IList<ZoneResource> Zones { get; set; } = [];

    /// <summary>
    /// Gets or sets the process function types.
    /// </summary>
    public IList<ProcessDefinitionTypes> ProcessDefinitionTypes { get; set; } = [];

    /// <summary>
    /// Gets or sets the authorization types.
    /// </summary>
    public IList<AuthorizationTypes> AuthorizationTypes { get; set; } = [];

    /// <summary>
    /// Gets the state.
    /// </summary>
    public ArchiveState State { get; set; } = ArchiveState.Active;

    /// <summary>
    /// Gets the ContractorTypes
    /// </summary>
    public IList<ContractorTypeReferenceResource> ContractorTypes { get; set; } = [];

    /// <summary>
    /// <value>The authentication accreditation type.</value>
    /// </summary>
    public AuthorizationAccreditationPersonRoleType? EmployeeAuthorizationAccreditationType { get; set; }

    /// <summary>
    /// Gets a value indicating whether notifications are enabled.
    /// </summary>
    public bool SendNotification { get; set; }

    /// <summary>
    /// Gets or sets the list of YIM asset identifiers associated with the authorization.
    /// </summary>
    public IList<YimAssetWithZoneAndLocationListResource> YimAssets { get; set; } = [];

    /// <summary>
    /// Gets or sets a value indicating whether this authorization originates from an external (parent) tenant.
    /// </summary>
    public bool HasExternalSource { get; set; }

    /// <summary>
    /// Gets or sets the name of the source tenant when this authorization is shared from another tenant.
    /// </summary>
    public string? SourceTenantName { get; set; }
}
