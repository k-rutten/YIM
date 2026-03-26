namespace YIM.Services.Registration.ApiModels.Authorizations;

using System;

/// <summary>
/// The update authorization all members request.
/// </summary>
public class UpdateAuthorizationAllMembersRequest
{
    public UpdateAuthorizationAllMembersRequest()
    {
        SearchParams = new AuthorizationMemberFilter();
    }

    /// <summary>
    /// Gets ot sets the schedule to.
    /// </summary>
    public DateTime ScheduleTo { get; set; }

    public AuthorizationMemberFilter SearchParams { get; set; }
}
