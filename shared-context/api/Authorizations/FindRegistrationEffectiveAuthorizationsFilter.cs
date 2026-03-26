namespace YIM.Services.Registration.ApiModels.Authorizations;

using System;

using YIM.ApiModels;
using DataAnnotations;

/// <summary>
/// The effective authorizations filter class.
/// </summary>
public class FindRegistrationEffectiveAuthorizationsFilter : PageRequest
{
    /// <summary>
    /// Gets or sets the start date and time, so April 3, 2020 8:00.
    /// </summary>
    public DateTime? ValidFromDateTime { get; set; }

    /// <summary>
    /// Gets or sets the end date and time, so April 3, 2020 14:00.
    /// </summary>
    public DateTime? ValidToDateTime { get; set; }

    [RuleMaxStringLength(200)]
    public string? SearchLocation { get; set; }
}
