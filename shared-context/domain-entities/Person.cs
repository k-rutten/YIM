namespace YIM.Services.Registration.Data.Entities;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CrossTenancy.Abstractions;
using YIM.Data;
using Exceptions;
using Guards;
using YIM.Localization;
using YIM.Services.Registration;
using Json;
using ValueObjects;
using Workflows;
using Workflows.DataComponents.PersonComponents;
using YIM.Services.Registration.Data.Entities.Credentials;

/// <summary>
/// The person entity class. Since this entity will be monitored by <see cref="RowVersion"/>,
/// we will update the last modified value even for authorization and accreditation changes.
/// </summary>
public partial class Person : CrossTenancyConcurrencyEntityBase, ISupportExternalIdentifier
{
    /// <summary>
    /// Initializes a new instance of the <see cref="Person" /> class.
    /// </summary>
    /// <param name="personId">The person identifier.</param>
    /// <param name="personRole">The person role.</param>
    /// <param name="sourceType">The source type.</param>
    public Person(Guid personId, PersonRoleType personRole, PersonSourceType sourceType)
    {
        GuidArgumentExceptionHelper.ThrowIfNullOrEmpty(personId);

        PersonId = personId;
        PersonRole = personRole;
        State = PersonState.Active;
        Dossier = new PersonDossier(this, new DossierDocument());
        PersonSourceType = sourceType;
    }

    private Person()
    {
    }

    /// <summary>
    /// Creates a new instance of the <see cref="Person"/> class from a synchronization source.
    /// </summary>
    /// <param name="sourceTenantId">The identifier of the source tenant.</param>
    /// <param name="personId">The identifier of the person to be created.</param>
    /// <param name="source">The source <see cref="Person"/> instance used for synchronization.</param>
    /// <param name="employer">The employer of the person.</param>
    /// <returns>A new <see cref="Person"/> instance initialized with the data from the source.</returns>
    internal static Person CreateFromSynchronization(Guid sourceTenantId, Guid personId, Person source, Company? employer = null, Company? mainContractor = null)
    {
        GuidArgumentExceptionHelper.ThrowIfNullOrEmpty(sourceTenantId);
        ArgumentNullException.ThrowIfNull(source);
        ArgumentNullException.ThrowIfNull(source.Dossier);

        if (employer is not null)
        {
            Guard.SameSourceTenant(employer, sourceTenantId);
        }

        if (mainContractor is not null)
        {
            Guard.SameSourceTenant(mainContractor, sourceTenantId);
        }

        var person = new Person(personId, source.PersonRole, source.PersonSourceType)
        {
            SourceTenantId = sourceTenantId,
            SourceEntityId = source.PersonId,
            IsShadow = true,

            PersonnelNumber = source.PersonnelNumber
        };

        if (!string.IsNullOrWhiteSpace(source.CompanyName))
        {
            person.SetCompanyName(source.CompanyName);
        }

        person.SetEmployer(employer);
        person.SetMainContractor(mainContractor);
        if (source.EmailAddress != null)
        {
            person.SetEmailAddress(source.EmailAddress);
        }

        person.SetLanguage(Language.GetSupportedLanguage(source.LanguageCode));
        person.SetName(source.Initials, source.FirstName ?? string.Empty, source.LastNamePrefix, source.LastName ?? string.Empty);
        if (source.DateOfBirth.HasValue)
        {
            person.SetDateOfBirth(source.DateOfBirth.Value);
        }

        person.SetPhoneNumber(source.PhoneNumber);

        person.UpdatePeriodOfAccessFromSynchronization(sourceTenantId, source);


        person.Dossier = PersonDossier.CreateFromSynchronization(sourceTenantId, person, source.Dossier);
        return person;
    }

    private readonly List<CredentialAssignment> _personIdentifiers = [];

    /// <summary>
    /// Gets the minimum date of birth for persons.
    /// </summary>
    public static DateTime MinimumDateOfBirth { get; } = new DateTime(1900, 1, 1);

    /// <summary>
    /// Gets the person identifier.
    /// </summary>
    public Guid PersonId { get; private set; }

    /// <summary>
    /// Gets or sets the person role.
    /// </summary>
    public PersonRoleType PersonRole { get; private set; }

    /// <summary>
    /// Gets or sets the identifiying personnel number (user profile employee ID).
    /// </summary>
    public string? PersonnelNumber { get; set; }

    /// <summary>
    /// Gets or sets the external identifier for the person, which could come from an external system integrating with YIM.
    /// The external identifier must be unique across persons when set.
    /// </summary>
    public string? ExternalId { get; private set; }

    /// <summary>
    /// Gets the company name.
    /// </summary>
    public string? CompanyName { get; private set; }

    /// <summary>
    /// Gets the employer.
    /// </summary>
    public Company? Employer { get; private set; }

    /// <summary>
    /// Gets the employer identifier.
    /// </summary>
    public Guid? EmployerCompanyId { get; private set; }

    /// <summary>
    /// Gets the email address.
    /// </summary>
    public EmailAddress? EmailAddress { get; private set; }

    /// <summary>
    /// Gets the language code.
    /// </summary>
    public string? LanguageCode { get; private set; }

    /// <summary>
    /// The person's initials.
    /// </summary>
    public string? Initials { get; private set; }

    /// <summary>
    /// The person's first name.
    /// </summary>
    public string? FirstName { get; private set; }

    /// <summary>
    /// Gets the full name.
    /// </summary>
    public string? FullName { get; private set; }

    /// <summary>
    /// The person's last name.
    /// </summary>
    public string? LastName { get; private set; }

    /// <summary>
    /// The person's last name prefix.
    /// </summary>
    public string? LastNamePrefix { get; private set; }

    /// <summary>
    /// Gets the date of birth.
    /// </summary>
    public DateTime? DateOfBirth { get; private set; }

    /// <summary>
    /// Gets the person status.
    /// </summary>
    public PersonState State { get; private set; }

    /// <summary>
    /// gets the phone number.
    /// </summary>
    public PhoneNumber? PhoneNumber { get; private set; }

    public PersonSourceType PersonSourceType { get; private set; }

    public Guid? PhotoStorageId { get; private set; }

    public DateTime? PhotoUploadedOn { get; private set; }

    public IReadOnlyCollection<CredentialAssignment> PersonIdentifiers => _personIdentifiers;

    /// <summary>
    /// The main contractor id
    /// </summary>
    public Guid? MainContractorId { get; private set; }

    /// <summary>
    /// The Main contractor
    /// </summary>
    public Company? MainContractor { get; private set; }

    /// <summary>
    /// The contractor (person itself => contractor type)
    /// </summary>
    public Contractor? Contractor { get; private set; }

    public string GetDossierStoragePath(Guid storageId) => $"{StorageFolder.Persons}/{PersonId}/{StorageFolder.Dossier}/{storageId}";

    /// <summary>
    /// Map the person role to a process type.
    /// </summary>
    /// <returns>The mapped process definition type.</returns>
    public ProcessDefinitionTypes GetProcessType() => PersonRole switch
    {
        PersonRoleType.Contractor => ProcessDefinitionTypes.ContractorRegistration,
        PersonRoleType.Employee => ProcessDefinitionTypes.EmployeeRegistration,
        PersonRoleType.Visitor => ProcessDefinitionTypes.VisitorRegistration,
        _ => throw new NotSupportedException($"PersonRole conversion from {PersonRole} to {nameof(ProcessDefinitionTypes)} is not supported."),
    };

    /// <summary>
    /// Sets the company name.
    /// </summary>
    /// <param name="companyName">The company name.</param>
    public void SetCompanyName(string companyName)
    {
        CompanyName = companyName;
    }

    /// <summary>
    /// Sets the employer.
    /// </summary>
    /// <param name="employer">The employer.</param>
    public void SetEmployer(Company? employer)
    {
        Employer = employer;
        CompanyName = employer?.Name;
        EmployerCompanyId = employer?.CompanyId;
    }

    /// <summary>
    /// Sets the email address.
    /// </summary>
    /// <param name="emailAddress">The email address.</param>
    public void SetEmailAddress(EmailAddress emailAddress)
    {
        EmailAddress = emailAddress;
    }

    public void ClearEmailAddress()
    {
        EmailAddress = null;
    }

    /// <summary>
    /// Set language code of the person.
    /// </summary>
    /// <param name="language">The language to apply.</param>
    public void SetLanguage(Language language)
    {
        LanguageCode = language.Code;
    }

    /// <summary>
    /// Sets the name.
    /// </summary>
    /// <param name="initials">Person initials.</param>
    /// <param name="firstName">Person first name.</param>
    /// <param name="lastNamePrefix">Person last name prefix (optional).</param>
    /// <param name="lastName">Person last name.</param>
    public void SetName(string? initials, string firstName, string? lastNamePrefix, string lastName)
    {
        if (Initials != initials ||
            FirstName != firstName ||
            LastName != lastName ||
            LastNamePrefix != lastNamePrefix)
        {
            Initials = initials;
            FirstName = firstName;
            LastName = lastName;
            LastNamePrefix = lastNamePrefix;

            FullName = PersonFullName.FormatInformalPersonName(initials, firstName, lastNamePrefix, lastName);
        }
    }

    /// <summary>
    /// Sets the birth date.
    /// </summary>
    /// <param name="birthDate">The birth date.</param>
    public void SetDateOfBirth(DateTime birthDate)
    {
        if (birthDate < MinimumDateOfBirth)
        {
            throw new YimDataException(ExceptionLocalizerId.DateOfBirthInvalidMessage);
        }

        DateOfBirth = birthDate.Date;
    }

    /// <summary>
    /// Sets the phone number.
    /// </summary>
    /// <param name="phoneNumber">The phone number.</param>
    public void SetPhoneNumber(PhoneNumber? phoneNumber)
    {
        PhoneNumber = phoneNumber;
    }

    /// <summary>
    /// Indication if the employee was created by the AEOS import.
    /// There are two flavours how the employee could have been created in AEOS.
    /// Either an AEOS user added the employee directly in AEOS or AEOS was fed by an extern (HR)
    /// system. Both flavours are flagged as AEOS source.
    /// </summary>
    /// <returns>Returns true when the employee has been imported via AEOS.</returns>
    public bool HasAeosSource() => PersonSourceType switch
    {
        PersonSourceType.AeosImport or
            PersonSourceType.AeosManual => true,
        _ => false,
    };

    /// <summary>
    /// Indication if the employee has been created by either a YIM user or an AEOS user.
    /// </summary>
    /// <returns>Returns true when the employee has been imported via AEOS as manually created employee or via the YIM registation website.</returns>
    public bool HasUserRegistrationSource() => PersonSourceType switch
    {
        PersonSourceType.RegistrationSite => true,
        PersonSourceType.AeosManual => true,
        _ => false,
    };

    /// <summary>
    /// Indication if the employee was created by an import routine or by a YIM user.
    /// </summary>
    /// <returns>Returns true when the employee has been imported either via AEOS or via the public API.</returns>
    public bool HasImportSource() => PersonSourceType switch
    {
        PersonSourceType.RegistrationSite => false,
        _ => true,
    };

    public async Task UpdateExternalIdAsync(RegistrationDbContext dbContext, string? externalId, CancellationToken cancellationToken)
    {
        if (ExternalId == externalId)
        {
            // no op
        }
        else if (string.IsNullOrWhiteSpace(externalId))
        {
            ExternalId = null;
        }
        else
        {
            await dbContext.Persons
                .WhereWhen(dbContext.IsExistingEntity(this), x => x.PersonId != PersonId)
                .ThrowWhenAnyAsync(x => x.ExternalId == externalId, ExceptionLocalizerId.ExternalIdExists, cancellationToken).ConfigureAwait(false);
            ExternalId = externalId;
        }
    }

    public void SetMainContractor(Company? company)
    {
        MainContractor = company;
        MainContractorId = company?.CompanyId;
    }

    public void UpdateFromSynchronization(Guid sourceTenantId, Person source, Company? employer = null, Company? mainContractor = null)
    {
        GuidArgumentExceptionHelper.ThrowIfNullOrEmpty(sourceTenantId);
        ArgumentNullException.ThrowIfNull(source);
        ArgumentNullException.ThrowIfNull(source.Dossier);
        Guard.SameSourceTenant(this, sourceTenantId);

        if (employer is not null)
        {
            Guard.SameSourceTenant(employer, sourceTenantId);
        }

        if (mainContractor is not null)
        {
            Guard.SameSourceTenant(mainContractor, sourceTenantId);
        }

        PersonnelNumber = source.PersonnelNumber;
        if (!string.IsNullOrWhiteSpace(source.CompanyName))
        {
            SetCompanyName(source.CompanyName);
        }

        SetEmployer(employer);
        SetMainContractor(mainContractor);
        if (source.EmailAddress != null)
        {
            SetEmailAddress(source.EmailAddress);
        }

        SetLanguage(Language.GetSupportedLanguage(source.LanguageCode));
        SetName(source.Initials, source.FirstName ?? string.Empty, source.LastNamePrefix, source.LastName ?? string.Empty);
        if (source.DateOfBirth.HasValue)
        {
            SetDateOfBirth(source.DateOfBirth.Value);
        }

        SetPhoneNumber(source.PhoneNumber);

        UpdatePeriodOfAccessFromSynchronization(sourceTenantId, source);

        Dossier.UpdateFromSynchronization(source.Dossier.Document, this);
    }

    public void AddCredentialAssignmentFromSynchronization(Guid sourceTenantId, CredentialAssignment sourceCredentialAssignment, Credential destinationCredential)
    {
        GuidArgumentExceptionHelper.ThrowIfNullOrEmpty(sourceTenantId);
        ArgumentNullException.ThrowIfNull(sourceCredentialAssignment);
        ArgumentNullException.ThrowIfNull(destinationCredential);

        _personIdentifiers.Add(CredentialAssignment.CreateFromSynchronization(sourceTenantId, sourceCredentialAssignment, this, destinationCredential));
    }

    internal void UpdatePhotoStorageId(Guid photoStorageId)
    {
        PhotoStorageId = photoStorageId;
    }

    internal void UpdatePhotoUpload(DateTime? photoUploadedOn)
    {
        PhotoUploadedOn = photoUploadedOn;
    }

    internal void ClearPhotoUpload()
    {
        PhotoStorageId = null;
        PhotoUploadedOn = null;
    }
}
