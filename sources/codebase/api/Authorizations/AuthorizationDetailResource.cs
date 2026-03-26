namespace YIM.Services.Registration.ApiModels.Authorizations;

/// <summary>
/// The authorization detail resource.
/// </summary>
public class AuthorizationDetailResource : AuthorizationBaseResource
{
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
}
