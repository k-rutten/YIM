namespace YIM.Services.Registration.ApiModels.Authorizations;

using DataAnnotations;

/// <summary>
/// AEOS template attached to authorization.
/// </summary>
public class AccessSystemTemplateAuthorization
{
    /// <summary>
    /// Gets or sets the AEOS template identifier.
    /// </summary>
    [RuleNotNullOrEmpty]
    public long TemplateId { get; set; }
}
