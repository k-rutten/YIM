namespace YIM.Services.Registration.ApiModels.Authorizations;

using DataAnnotations;

/// <summary>
/// AccessSystem access attached to authorization.
/// </summary>
public class AccessSystemAccessAuthorization
{
    /// <summary>
    /// Gets or sets the AccessSystem access identifier.
    /// </summary>
    [RuleNotNullOrEmpty]
    public long AccessId { get; set; }

    /// <summary>
    /// Gets or sets the AccessSystem access date time schedule identifier.
    /// </summary>
    [RuleNotNullOrEmpty]
    public long? DateTimeScheduleId { get; set; }
}
