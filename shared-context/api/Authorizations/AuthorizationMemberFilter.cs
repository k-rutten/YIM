namespace YIM.Services.Registration.ApiModels.Authorizations;

using System;
using System.Collections.Generic;
using Data;
using DataAnnotations;
using ValueObjects;
using YIM.ApiModels;
using YIM.Workflows;

/// <summary>
/// The authorization person filter
/// </summary>
public class AuthorizationMemberFilter : PageRequest
{
    /// <summary>
    /// Gets or sets the type of the person.
    /// </summary>
    public PersonRoleType[] Types { get; set; } = Array.Empty<PersonRoleType>();

    /// <summary>
    /// Gets or sets the states of the authorization.
    /// </summary>
    public AuthorizationState[]? States { get; set; }

    /// <summary>
    /// Gets or sets the name of the person.
    /// </summary>
    [RuleMaxStringLength(200)]
    public string? FullName { get; set; }

    /// <summary>
    /// Gets or sets the company where the person works.
    /// </summary>
    [RuleMaxStringLength(200)]
    public string? Employer { get; set; }

    /// <summary>
    /// Gets or sets the date of birth of the person.
    /// </summary>
    public Period? DateOfBirth { get; set; }

    /// <summary>
    /// Gets or sets the event active from date.
    /// </summary>
    public Period? AuthorizedFrom { get; set; }

    /// <summary>
    /// Gets or sets the event active to date.
    /// </summary>
    public Period? AuthorizedTo { get; set; }

    /// <summary>
    /// Gets or sets the personnel number.
    /// </summary>
    [RuleMaxStringLength(RegistrationDataTypes.PersonnelNumberMaxLength)]
    public string? PersonnelNumber { get; set; }

    /// <summary>
    /// Gets or sets the emailaddress.
    /// </summary>
    [RuleMaxStringLength(EmailAddress.EmailMaxLength)]
    public string? MailAddress { get; set; }

    public ICollection<Guid>? SelectedPersonAuthorizationIds { get; set; }
}
