namespace YIM.Services.Registration.ApiModels;

using System;
using System.Collections.Generic;
using ValueObjects;
using YIM.ApiModels;

/// <summary>
/// The company base resource.
/// </summary>
public abstract class CompanyBaseResource : WebResource, ISupportModificationTime
{
    /// <summary>
    /// Gets or sets the address.
    /// </summary>
    public Address? Address { get; set; }

    /// <summary>
    /// Gets or sets the chamber of commerce number.
    /// </summary>
    public string? ChamberOfCommerceNumber { get; set; }

    /// <summary>
    /// Gets or sets the contact persons.
    /// </summary>
    public ICollection<ContactPersonResource> ContactPersons { get; set; } = Array.Empty<ContactPersonResource>();

    /// <summary>
    /// Gets or sets the country.
    /// </summary>
    public string? Country { get; set; }

    /// <summary>
    /// Gets or sets the company identifier.
    /// </summary>
    public Guid CompanyId { get; set; }

    /// <summary>
    /// Gets or sets the company external identifier when present.
    /// </summary>
    public string? CompanyExternalId { get; set; }

    /// <summary>
    /// Gets or sets the name.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the state.
    /// </summary>
    public State<CompanyState> State { get; set; } = EmptyState.Company;

    /// <summary>
    /// Gets or sets the VAT number.
    /// </summary>
    public string? VatRegistrationNumber { get; set; }

    /// <inheritdoc/>
    public DateTimeOffset ModifiedOnUtc { get; set; }

    /// <inheritdoc/>
    public DateTimeOffset CreatedOnUtc { get; set; }

    public DateTimeOffset? DeactivateOnUtc { get; set; }

    public bool IsBlocked { get; set; }

    public bool IsMainContractor { get; set; }
}
