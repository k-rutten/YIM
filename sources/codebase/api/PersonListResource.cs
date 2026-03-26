namespace YIM.Services.Registration.ApiModels;

using System;
using ValueObjects;
using YIM.Workflows;

/// <summary>
/// The person list resource.
/// </summary>
public class PersonListResource : PersonBaseResource
{
    /// <summary>
    /// Gets or sets the email address.
    /// </summary>
    public EmailAddress? EmailAddress { get; set; }

    /// <summary>
    /// Gets or sets the personnel number.
    /// </summary>
    public string? PersonnelNumber { get; set; }

    /// <summary>
    /// Gets or sets the person phone number.
    /// </summary>
    public PhoneNumber? PhoneNumber { get; set; }

    /// <summary>
    /// Gets the role.
    /// </summary>
    public PersonRoleType? Role { get; set; }

    /// <summary>
    /// Gets or sets the person date of birth.
    /// </summary>
    public DateTime? DateOfBirth { get; set; }

    /// <summary>
    /// Gets or sets the first autorisation arrival date.
    /// </summary>
    public DateTime? FirstArrival { get; set; }

    /// <summary>
    /// Gets or sets the last autorisation departure date.
    /// </summary>
    public DateTime? LastDeparture { get; set; }

    /// <summary>
    /// Gets or sets the date the person dossier got last modified.
    /// </summary>
    public DateTimeOffset? DossierModifiedOnUtc { get; set; }
}
