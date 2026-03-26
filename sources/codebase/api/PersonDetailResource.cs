namespace YIM.Services.Registration.ApiModels;

using System;
using System.Collections.Generic;

using ValueObjects;
using YIM.Workflows;

/// <summary>
/// The person detail resource.
/// </summary>
public class PersonDetailResource : PersonBaseResource
{
    /// <summary>
    /// Gets or sets the list of registrations.
    /// </summary>
    public List<RegistrationListResource> Registrations { get; set; } = [];

    /// <summary>
    /// Gets or sets the dossier form.
    /// </summary>
    public DossierFormResource Dossier { get; set; } = new DossierFormResource();

    /// <summary>
    /// Gets or sets the email address.
    /// </summary>
    public EmailAddress? EmailAddress { get; set; }

    /// <summary>
    /// Gets or sets the phone number.
    /// </summary>
    public PhoneNumber? PhoneNumber { get; set; }

    /// <summary>
    /// Gets or sets the person number of the person.
    /// </summary>
    public string? PersonnelNumber { get; set; }

    /// <summary>
    /// Gets or sets the person role of the person.
    /// </summary>
    public PersonRoleType Role { get; set; }

    /// <summary>
    /// Gets or sets the visible dossier tabs.
    /// </summary>
    public List<DossierAccessLevels> DossierAccessLevels { get; set; } = [];

    /// <summary>
    /// Gets or sets the available actions.
    /// </summary>
    public List<RegistrationActionTypes> RegistrationActionTypes { get; set; } = [];

    /// <summary>
    /// Gets or sets the start date.
    /// </summary>
    public DateTime? PeriodOfAccessFrom { get; set; }

    /// <summary>
    /// Gets or sets the end date.
    /// </summary>
    public DateTime? PeriodOfAccessTo { get; set; }

    public ICollection<long> Processes { get; set; } = Array.Empty<long>();

    public bool HasBlockedEmployer { get; set; } = false;
}
