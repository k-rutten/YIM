namespace YIM.Services.Registration.ApiModels.Authorizations;

using System;
using System.Collections.Generic;
using DataAnnotations;

/// <summary>
/// Adds persons to a specific authorization for a given schedule.
/// </summary>
public class AddAuthorizationMembersRequest
{
    /// <summary>
    /// The start date of the authorization, this date must occur before the to date.
    /// </summary>
    [RuleNotNull]
    public DateTime From { get; set; }

    /// <summary>
    /// To date is after from date or null, which means no end date.
    /// </summary>
    public DateTime? To { get; set; }

    /// <summary>
    /// Get the person identifiers.
    /// </summary>
    public ICollection<Guid> PersonIds { get; set; } = Array.Empty<Guid>();
}
