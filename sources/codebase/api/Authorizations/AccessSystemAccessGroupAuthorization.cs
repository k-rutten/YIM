namespace YIM.Services.Registration.ApiModels.Authorizations;

using DataAnnotations;

/// <summary>
/// AccessSystem access group attached to authorization.
/// </summary>
public class AccessSystemAccessGroupAuthorization
{
    /// <summary>
    /// Gets or sets the AccessSystem access group identifier.
    /// </summary>
    [RuleNotNullOrEmpty]
    public long AccessGroupId { get; set; }

    /// <summary>
    /// Gets or sets the AccessSystem access group date time schedule identifier.
    /// </summary>
    [RuleNotNullOrEmpty]
    public long? DateTimeScheduleId { get; set; }
}
