namespace YIM.Services.Registration.Data.Entities;

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Threading;
using System.Threading.Tasks;
using CrossTenancy.Abstractions;
using Exceptions;
using Guards;
using Json;
using ValueObjects;
using Workflows.DataComponents.CompanyComponents;
using YIM.Data;
using YIM.Localization;

/// <summary>
/// The company data entity class.
/// </summary>
public partial class Company : CrossTenancyConcurrencyEntityBase, ISupportExternalIdentifier, IExternalObject<Guid>
{
    private readonly List<Subcontractor> _subcontractors = [];
    private readonly List<CompanyContactPerson> _contactPersons = [];

    /// <summary>
    /// Initializes a new instance of the <see cref="Company" /> class.
    /// </summary>
    /// <param name="companyId">The company identifier.</param>
    public Company(Guid companyId)
    {
        GuidArgumentExceptionHelper.ThrowIfNullOrEmpty(companyId);

        CompanyId = companyId;
        State = CompanyState.Active;
        Dossier = new CompanyDossier(this, new DossierDocument());
    }

    /// <summary>
    /// Prevents a default instance of the <see cref="Company"/> class from being created.
    /// </summary>
    /// <remarks>Used by Entity Framework.</remarks>
    private Company()
    {
    }

    public static Company CreateFromSynchronization(
        Guid sourceTenantId,
        Company sourceCompany)
    {
        GuidArgumentExceptionHelper.ThrowIfNullOrEmpty(sourceTenantId);
        ArgumentNullException.ThrowIfNull(sourceCompany);

        var company = new Company(SequentialGuid.NewGuid())
        {
            CountryCode = sourceCompany.CountryCode,
            ChamberOfCommerceNumber = sourceCompany.ChamberOfCommerceNumber,
            Name = sourceCompany.Name,
            VatRegistrationNumber = sourceCompany.VatRegistrationNumber,
            State = sourceCompany.State,
            Maincontractor = sourceCompany.Maincontractor,
            InjuryFrequency = sourceCompany.InjuryFrequency,
            InjuryFrequencyUploadDate = sourceCompany.InjuryFrequencyUploadDate,
            WaiverValidityDate = sourceCompany.WaiverValidityDate,
            DeactivateOnUtc = sourceCompany.DeactivateOnUtc,
            SourceTenantLabel = sourceCompany.SourceTenantLabel,
            Address = sourceCompany.Address,
            CompanyVcaCertificate = sourceCompany.CompanyVcaCertificate,
            SourceTenantId = sourceTenantId,
            SourceEntityId = sourceCompany.CompanyId,
            IsShadow = true
        };

        company.Dossier = new CompanyDossier(company, sourceCompany.Dossier.Document);

        return company;
    }

    /// <summary>
    /// Gets the company identifier.
    /// </summary>
    public Guid CompanyId { get; private set; }

    /// <summary>
    /// Gets or sets the external identifier of the company, which could come from an external system integrating with YIM.
    /// The external identifier must be unique across companies when set.
    /// </summary>
    public string? ExternalId { get; private set; }

    /// <summary>
    /// Gets the address.
    /// </summary>
    public Address? Address { get; private set; }

    /// <summary>
    /// Gets or sets the chamber of commerce number.
    /// </summary>
    public string? ChamberOfCommerceNumber { get; set; }

    /// <summary>
    /// Gets or sets the country code.
    /// </summary>
    public string? CountryCode { get; set; }

    /// <summary>
    /// Gets or sets the country.
    /// </summary>
    public Country? Country { get; set; }

    /// <summary>
    /// Gets the name.
    /// </summary>
    public string Name { get; private set; } = string.Empty;

    /// <summary>
    /// Gets the VAT number.
    /// </summary>
    public string? VatRegistrationNumber { get; private set; }

    /// <summary>
    /// Gets the organization status.
    /// </summary>
    public CompanyState State { get; private set; }

    /// <summary>
    /// Gets the subcontractor collection in case this company acts as subcontractor.
    /// </summary>
    public IReadOnlyCollection<Subcontractor> Subcontractors => _subcontractors;

    /// <summary>
    /// Gets the contactperson collection.
    /// </summary>
    public IReadOnlyCollection<CompanyContactPerson> ContactPersons => _contactPersons;

    /// <summary>
    /// Gets the maincontractor in case this company is maincontractor.
    /// </summary>
    public Maincontractor? Maincontractor { get; private set; }

    public double? InjuryFrequency { get; private set; }

    public DateTimeOffset? InjuryFrequencyUploadDate { get; private set; }

    public DateTime? WaiverValidityDate { get; set; }

    public DateTimeOffset? DeactivateOnUtc { get; private set; }

    public void SetInjuryFrequency(double injuryFrequency, DateTimeOffset dateTimeOffset)
    {
        InjuryFrequency = injuryFrequency;
        InjuryFrequencyUploadDate = dateTimeOffset;
    }

    /// <summary>
    /// Factory method for creating a company.
    /// </summary>
    /// <param name="name">The required name.</param>
    /// <returns>The company instance with name and name data component.</returns>
    public static Company Create(string name)
    {
        var company = new Company(SequentialGuid.NewGuid());
        company.SetName(name);
        company.AddDossierComponent(new CompanyName { Name = company.Name, CompanyId = company.CompanyId });

        return company;
    }

    /// <summary>
    /// Sets the address.
    /// </summary>
    /// <param name="address">The address.</param>
    public void SetAddress(Address address)
    {
        if (Address != address)
        {
            Address = address;
            if (address is not null && !string.IsNullOrEmpty(address.CountryCode))
            {
                CountryCode = address.CountryCode;
            }
            UpdateLastModified();
        }
    }

    /// <summary>
    /// Sets the contact persons.
    /// </summary>
    /// <param name="source">The list of contact persons.</param>
    public void SetContactPersons(IList<CompanyContactPerson> source)
    {
        if (source == null)
        {
            throw new YimInvalidOperationException("Contact persons must be non-null.");
        }

        _contactPersons.Clear();
        _contactPersons.AddRange(source);
        UpdateLastModified();
    }

    /// <summary>
    /// Sets the name.
    /// </summary>
    /// <param name="name">The name.</param>
    public void SetName(string name)
    {
        if (string.IsNullOrEmpty(name))
        {
            throw new ArgumentNullException(nameof(name));
        }

        Name = name;
    }

    /// <summary>
    /// Sets the VAT Number
    /// </summary>
    /// <param name="vatRegistrationNumber"></param>
    public void SetVatRegistrationNumber(string? vatRegistrationNumber)
    {
        if (vatRegistrationNumber == null)
        {
            return;
        }
        VatRegistrationNumber = vatRegistrationNumber;
    }

    public async Task UpdateExternalIdAsync(RegistrationDbContext dbContext, string? externalId, CancellationToken cancellationToken)
    {
        if (ExternalId == externalId)
        {
            return;
        }
        if (string.IsNullOrWhiteSpace(externalId))
        {
            ExternalId = null;
        }
        else if (dbContext.IsExistingEntity(this))
        {
            await dbContext.Companies.ThrowWhenAnyAsync(x => x.CompanyId != CompanyId &&
                                                             x.ExternalId == externalId,
                                                             ExceptionLocalizerId.ExternalIdExists,
                                                             cancellationToken).ConfigureAwait(false);
            ExternalId = externalId;
        }
        else
        {
            await dbContext.Companies.ThrowWhenAnyAsync(x => x.ExternalId == externalId,
                                                               ExceptionLocalizerId.ExternalIdExists,
                                                               cancellationToken).ConfigureAwait(false);
            ExternalId = externalId;
        }
    }

    public void ScheduleDeactivation(DateTimeOffset deactivateOnUtc)
    {
        if (State != CompanyState.Active)
        {
            throw new YimInvalidOperationException("Company is not active and cannot be deactivated.");
        }

        State = CompanyState.PendingDeactivation;
        DeactivateOnUtc = deactivateOnUtc;
    }

    public void Deactivate()
    {
        if (State != CompanyState.PendingDeactivation)
        {
            throw new YimInvalidOperationException("Company is not pending deactivation and cannot be deactivated.");
        }

        State = CompanyState.InActive;
    }

    public void Reactivate()
    {
        if(State == CompanyState.Active)
        {
            throw new YimInvalidOperationException(ExceptionLocalizerId.CompanyActiveCannotReactivate);
        }

        RemoveDossierComponent();

        State = CompanyState.Active;
        DeactivateOnUtc = null;
    }

    public void UpdateFromSynchronization(
        Guid sourceTenantId,
        Company sourceCompany)
    {
        GuidArgumentExceptionHelper.ThrowIfNullOrEmpty(sourceTenantId);
        ArgumentNullException.ThrowIfNull(sourceCompany);
        Guard.SameSourceTenant(this, sourceTenantId);

        CountryCode = sourceCompany.CountryCode;
        ChamberOfCommerceNumber = sourceCompany.ChamberOfCommerceNumber;
        Name = sourceCompany.Name;
        VatRegistrationNumber = sourceCompany.VatRegistrationNumber;
        State = sourceCompany.State;
        Maincontractor = sourceCompany.Maincontractor;
        InjuryFrequency = sourceCompany.InjuryFrequency;
        InjuryFrequencyUploadDate = sourceCompany.InjuryFrequencyUploadDate;
        WaiverValidityDate = sourceCompany.WaiverValidityDate;
        DeactivateOnUtc = sourceCompany.DeactivateOnUtc;
        Address = sourceCompany.Address;
        CompanyVcaCertificate = sourceCompany.CompanyVcaCertificate;

        UpdateDossierFromSynchronization(sourceCompany.Dossier);

        UpdateLastModified();
    }

    [NotMapped]
    public Guid Id => CompanyId;
}
