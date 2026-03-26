namespace YIM.Services.Registration.ApiModels.Authorizations;

using DataAnnotations;
using YIM.ApiModels;
using Data;

/// <summary>
/// The filter for finding authorization member candidates.
/// </summary>
public class AuthorizationMemberCandidateFilter : PageRequest
{
    /// <summary>
    /// Gets or sets the search context.
    /// </summary>
    [RuleNotNull]
    public AuthorizationMemberCandidateFilterType FilterType { get; set; }

    /// <summary>
    /// Gets or sets the search filter for person fullname.
    /// Required when <see cref="FilterType"/> is <see cref="AuthorizationMemberCandidateFilterType.Name"/>.
    /// </summary>
    [RuleMaxStringLength(200)]
    public string? FullName { get; set; }

    /// <summary>
    /// Gets or sets the search filter for person number.
    /// Required when <see cref="FilterType"/> is <see cref="AuthorizationMemberCandidateFilterType.PersonnelNumber"/>.
    /// </summary>
    [RuleMaxStringLength(RegistrationDataTypes.PersonnelNumberMaxLength)]
    public string? PersonNumber { get; set; }

    /// <summary>
    /// Gets or sets the search filter for identifier number.
    /// Required when <see cref="FilterType"/> is <see cref="AuthorizationMemberCandidateFilterType.IdentifierNumber"/>.
    /// </summary>
    [RuleMaxStringLength(RegistrationDataTypes.CredentialNumberMaxLength)]
    public string? IdentifierNumber { get; set; }
}
