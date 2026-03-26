namespace YIM.Services.Registration.ApiModels.Authorizations;

using System;
using System.Collections.Generic;
using YIM.ApiModels;
using Locations;

/// <summary>
/// Implements an authorization reference class.
/// </summary>
public class AuthorizationReferenceResource : WebResource
{
    /// <summary>
    /// Gets or sets the authorization identifier.
    /// </summary>
    public Guid AuthorizationId { get; set; }

    /// <summary>
    /// Gets or sets the authorization name.
    /// </summary>
    public string AuthorizationName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the locations
    /// </summary>
    public IList<LocationReferenceResource> Locations { get; set; } = [];
}
