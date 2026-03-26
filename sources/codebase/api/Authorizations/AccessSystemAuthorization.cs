namespace YIM.Services.Registration.ApiModels.Authorizations;

/// <summary>
/// AEOS mapping for authorization.
/// We either use <see cref="Template"/>, <see cref="Access"/>,
/// <see cref="AccessGroup"/> or no mapping.
/// </summary>
public class AccessSystemAuthorization
{
    /// <summary>
    /// Gets or sets the AccessSystem mapping type.
    /// We either use <see cref="Template"/>, <see cref="Access"/>,
    /// <see cref="AccessGroup"/> or no mapping.
    /// </summary>
    public AccessSystemAuthorizationType MappingType { get; set; } = AccessSystemAuthorizationType.Template;

    /// <summary>
    /// Gets or sets the AccessSystem template mapping when <see cref="AccessSystemAuthorizationType.Template"/>.
    /// </summary>
    public AccessSystemTemplateAuthorization? Template { get; set; }

    /// <summary>
    /// Gets or sets the AccessSystem access mapping  when <see cref="AccessSystemAuthorizationType.Access"/>.
    /// </summary>
    public AccessSystemAccessAuthorization? Access { get; set; }

    /// <summary>
    /// Gets or sets the AccessSystem access group mapping  when <see cref="AccessSystemAuthorizationType.AccessGroup"/>.
    /// </summary>
    public AccessSystemAccessGroupAuthorization? AccessGroup { get; set; }
}
