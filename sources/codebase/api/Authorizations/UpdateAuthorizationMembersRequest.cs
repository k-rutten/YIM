namespace YIM.Services.Registration.ApiModels.Authorizations;

using System;
using System.Collections.Generic;
using ApiModels;

/// <summary>
/// The update authorization members request.
/// </summary>
public class UpdateAuthorizationMembersRequest
{
    /// <summary>
    /// Gets the person authorization changes.
    /// </summary>
    public ICollection<NewAuthorizationMemberSchedule> Changes { get; set; } = Array.Empty<NewAuthorizationMemberSchedule>();
}
