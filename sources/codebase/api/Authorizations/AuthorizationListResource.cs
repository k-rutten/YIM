namespace YIM.Services.Registration.ApiModels.Authorizations;

/// <summary>
/// The authorization list resource.
/// </summary>
public class AuthorizationListResource : AuthorizationBaseResource
{
    /// <summary>
    /// The location to use when sorting the list.
    /// </summary>
    public string SortLocation { get; set; } = string.Empty;
}
