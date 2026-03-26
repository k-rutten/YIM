namespace YIM.Services.Registration.ApiModels.Authorizations;

using System;
using System.Collections.Generic;
using DataAnnotations;
using ApiModels.YimAssets;
using YIM.Workflows;

/// <summary>
/// Base request for add or update.
/// </summary>
public abstract class AuthorizationBaseRequest
{
    /// <summary>
    /// Gets or sets the authorization name.
    /// </summary>
    [RuleMaxStringLength(100)]
    [RuleNotNullOrEmpty]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the date time schedule identifier.
    /// </summary>
    [RuleNotNullOrEmpty]
    public Guid DateTimeScheduleId { get; set; }

    /// <summary>
    /// Gets or sets the disable accreditation value.
    /// </summary>
    [RuleNotNull]
    public bool DisableAccreditation { get; set; }

    /// <summary>
    /// Gets or sets the description.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the process definition types.
    /// </summary>
    public IList<ProcessDefinitionTypes> ProcessDefinitionTypes { get; set; } = [];

    /// <summary>
    /// Gets or sets the authorization types.
    /// </summary>
    public IList<AuthorizationTypes> AuthorizationTypes { get; set; } = [];

    /// <summary>
    /// Gets or sets the zone identifiers.
    /// </summary>
    public IEnumerable<Guid> Zones { get; set; } = [];

    /// <summary>
    /// Gets or sets the location identifiers.
    /// </summary>
    public IList<Guid> LocationIds { get; set; } = [];

    /// <summary>
    /// Gets or sets the Contractor Type Ids.
    /// </summary>
    public ICollection<long>? ContractorTypeIds { get; set; }

    /// <summary>
    /// Gets or sets the optional AEOS mapping.
    /// </summary>
    public AccessSystemAuthorization? AeosMapping { get; set; }

    /// <summary>
    /// Gets or sets the optional iLOQ mapping.
    /// </summary>
    public AccessSystemAuthorization? IloqMapping { get; set; }

    /// <summary>
    /// Gets or sets the optional SALTO mapping.
    /// </summary>
    public AccessSystemAuthorization? SaltoMapping { get; set; }

    /// <summary>
    /// <value>The authentication accreditation type.</value>
    /// </summary>
    public AuthorizationAccreditationPersonRoleType? EmployeeAuthorizationAccreditationType { get; set; }

    /// <summary>
    /// Gets a value indicating whether notifications are enabled.
    /// </summary>
    public bool SendNotification { get; set; }

    /// <summary>
    /// Gets or sets the YIM asset identifiers associated with the authorization.
    /// </summary>
    public IList<YimAssetListResource> YimAssets { get; set; } = [];
}
