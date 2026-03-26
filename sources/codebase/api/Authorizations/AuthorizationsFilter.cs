namespace YIM.Services.Registration.ApiModels.Authorizations;

using System;
using System.Collections.Generic;

using YIM.ApiModels;
using YIM.Workflows;

/// <summary>
/// The authorizations filter class.
/// </summary>
public class AuthorizationsFilter : PageRequest
{
    /// <summary>
    /// Gets or sets the filter for specific locations.
    /// </summary>
    public IList<Guid> Locations { get; set; } = Array.Empty<Guid>();

    /// <summary>
    /// Gets or sets the filter for specific date time schedules.
    /// </summary>
    public IList<Guid> DateTimeSchedules { get; set; } = Array.Empty<Guid>();

    /// <summary>
    /// Gets or sets the filter for specific zones.
    /// </summary>
    public IList<Guid> Zones { get; set; } = Array.Empty<Guid>();

    /// <summary>
    /// Gets or sets the filter for excluded authorizations.
    /// </summary>
    public IList<Guid> Authorizations { get; set; } = Array.Empty<Guid>();

    /// <summary>
    /// Gets or sets the process function types.
    /// </summary>
    public IList<ProcessDefinitionTypes> ProcessDefinitionTypes { get; set; } = [];

    /// <summary>
    /// Gets or sets the authorization states.
    /// </summary>
    public ICollection<ArchiveState>? States { get; set; }

    /// <summary>
    /// Gets the authorizations scope.
    /// </summary>
    public AuthorizationsScope AuthorizationsScope { get; set; } = AuthorizationsScope.AuthorizationManagement;
}
