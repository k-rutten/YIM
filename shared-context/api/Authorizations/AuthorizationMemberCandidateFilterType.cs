namespace YIM.Services.Registration.ApiModels.Authorizations;

using System.Text.Json.Serialization;

/// <summary>
/// Enum to filter the authorization member search context.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum AuthorizationMemberCandidateFilterType
{
    /// <summary>
    /// Search context name.
    /// </summary>
    Name,

    /// <summary>
    /// Search context Personnel number.
    /// </summary>
    PersonnelNumber,

    /// <summary>
    /// Search context Identifier number.
    /// </summary>
    IdentifierNumber
}
