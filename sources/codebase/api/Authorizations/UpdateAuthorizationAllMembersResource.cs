namespace YIM.Services.Registration.ApiModels.Authorizations;
using System;

public class UpdateAuthorizationAllMembersResource
{
    public UpdateAuthorizationAllMembersResource(DateTimeOffset dateCreatedOn)
    {
        DateCreatedOnUtc = dateCreatedOn;
    }

    /// <summary>
    /// Gets the date when the backgroundtask was created.
    /// </summary>
    public DateTimeOffset DateCreatedOnUtc { get; }
}
