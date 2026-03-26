namespace YIM.Services.Registration.ApiModels;

using System;
using YIM.ApiModels;
using DataAnnotations;
using YIM.Workflows;
using Microsoft.AspNetCore.Mvc;
using AspNetCore.ModelBinding;
using Data;

/// <summary>
/// The persons filter class.
/// </summary>
public class PersonsFilter : PageRequest
{
    /// <summary>
    /// Gets or sets the search filter for visitors.
    /// </summary>
    [RuleMaxStringLength(200)]
    public string? PersonName { get; set; }

    /// <summary>
    /// Gets or sets the search filter for personnel numbers.
    /// </summary>
    [RuleMaxStringLength(50)]
    public string? PersonnelNumber { get; set; }

    /// <summary>
    /// Gets or sets the search filter for the visitor's company
    /// </summary>
    [RuleMaxStringLength(RegistrationDataTypes.CompanyNameMaxLength)]
    public string? PersonCompanyName { get; set; }

    /// <summary>
    /// Gets or sets the role.
    /// </summary>
    [ModelBinder(typeof(CommaSeparatedQueryBinder))]
    public PersonRoleType[]? Role { get; set; }

    /// <summary>
    /// Gets or sets the from date of birth filter.
    /// </summary>
    public DateTime? DateOfBirthFrom { get; set; }

    /// <summary>
    /// Gets or sets the to date of birth filter.
    /// </summary>
    public DateTime? DateOfBirthTo { get; set; }

    /// <summary>
    /// Gets the from date of first arrival filter.
    /// </summary>
    public DateTime? FirstArrivalFrom { get; set; }

    /// <summary>
    /// Gets the to date of first arrival filter.
    /// </summary>
    public DateTime? FirstArrivalTo { get; set; }

    /// <summary>
    /// Gets the from date of last departure filter.
    /// </summary>
    public DateTime? LastDepartureFrom { get; set; }

    /// <summary>
    /// Gets the to date of last departure filter.
    /// </summary>
    public DateTime? LastDepartureTo { get; set; }

    /// <summary>
    /// Gets the from date of created at filter.
    /// </summary>
    public DateTime? CreatedAtFrom { get; set; }

    /// <summary>
    /// Gets the to date of created at filter.
    /// </summary>
    public DateTime? CreatedAtTo { get; set; }

    /// <summary>
    /// Gets the from date of dossier last modified filter.
    /// </summary>
    public DateTime? DossierLastModifiedFrom { get; set; }

    /// <summary>
    /// Gets the to date of dossier last modified filter.
    /// </summary>
    public DateTime? DossierLastModifiedTo { get; set; }

    /// <summary>
    /// Gets the company identifier.
    /// </summary>
    public Guid? CompanyId { get; set; }

    /// <summary>
    /// Gets or sets the search filter for the person's email address
    /// </summary>
    [RuleMaxStringLength(ValueObjects.EmailAddress.EmailMaxLength)]
    public string? EmailAddress { get; set; }
}
