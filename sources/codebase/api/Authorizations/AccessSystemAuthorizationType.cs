namespace YIM.Services.Registration.ApiModels.Authorizations;

/// <summary>
/// Type of AEOS mapping for authorization.
/// </summary>
public enum AccessSystemAuthorizationType
{
    /// <summary>
    /// Use AEOS template mapping.
    /// </summary>
    Template = 0,

    /// <summary>
    /// Use AEOS entrance mapping.
    /// </summary>
    Access = 1,

    /// <summary>
    /// Use AEOS entrance group mapping.
    /// </summary>
    AccessGroup = 2,
}
