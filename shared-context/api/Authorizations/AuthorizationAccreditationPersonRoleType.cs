namespace YIM.Services.Registration.ApiModels.Authorizations;

using Data;

/// <summary>
/// Represents the authentication accreditation type for an authorization.
/// </summary>
public class AuthorizationAccreditationPersonRoleType
{
    /// <summary>
    /// Gets or sets the employee accreditation type for the authorization.
    /// </summary>
    public AuthorizationAccreditationType? AccreditationType { get; set; }

    /// <summary>
    /// Gets or sets the First Step Accreditor Type.
    /// </summary>
    public AccreditorGroupType? FirstStepAccreditorType { get; set; }

    /// <summary>
    /// Gets or sets the second step accreditor type.
    /// </summary>
    public AccreditorGroupType? SecondStepAccreditorType { get; set; }
}
