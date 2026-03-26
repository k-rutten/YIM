namespace YIM.Services.Registration.Data.Entities;

using System;
using System.Collections.Generic;
using System.Linq;
using YIM.Data.Entities;
using Security;
using Workflows;

public class AuthorizationRule : ConcurrencyEntityBase
{
    private readonly List<AuthorizationRuleDateTimeSchedule> _dateTimeSchedules = [];
    private readonly List<AuthorizationRuleLocation> _locations = [];
    private readonly List<AuthorizationRuleZone> _zones = [];
    private readonly List<AuthorizationRulePermission> _permissions = [];
    private readonly List<AuthorizationRuleReport> _reports = [];
    private readonly List<AuthorizationRuleCompany> _companies = [];
    private readonly List<AuthorizationRuleContractorType> _contractorTypes = [];

    public AuthorizationRule(
        Guid authorizationRuleId,
        string name,
        string description)
    {
        GuidArgumentExceptionHelper.ThrowIfNullOrEmpty(authorizationRuleId);
        ArgumentExceptionHelper.ThrowIfNullOrEmpty(name);
        ArgumentExceptionHelper.ThrowIfNullOrEmpty(description);

        AuthorizationRuleId = authorizationRuleId;
        Name = name;
        Description = description;
    }

    public string Description { get; private set; }

    public Guid AuthorizationRuleId { get; private set; }

    public string Name { get; private set; }

    public bool AllowRoleDelegation { get; private set; } = false;

    public RegistrationActionTypes RegistrationActionTypes { get; private set; } = RegistrationActionTypes.None;

    public ProcessDefinitionTypes ProcessDefinitionTypes { get; private set; } = ProcessDefinitionTypes.None;

    public CompanyAccessLevel CompanyAccessLevel { get; private set; } = CompanyAccessLevel.None;

    public DossierAccessLevels DossierAccessLevels { get; private set; } = DossierAccessLevels.None;

    public FileAccessLevels FileAccessLevels { get; private set; } = FileAccessLevels.None;

    public bool AccreditAllCompanies { get; private set; } = false;

    public IReadOnlyCollection<AuthorizationRuleDateTimeSchedule> DateTimeSchedules => _dateTimeSchedules;

    public IReadOnlyCollection<AuthorizationRuleLocation> Locations => _locations;

    public IReadOnlyCollection<AuthorizationRuleZone> Zones => _zones;

    public IReadOnlyCollection<AuthorizationRuleCompany> Companies => _companies;

    public IReadOnlyCollection<AuthorizationRulePermission> Permissions => _permissions;

    public IReadOnlyCollection<AuthorizationRuleReport> Reports => _reports;

    public IReadOnlyCollection<AuthorizationRuleContractorType> ContractorTypes => _contractorTypes;

    public void SetName(string name)
    {
        ArgumentExceptionHelper.ThrowIfNullOrEmpty(name);
        Name = name;
    }

    public void SetDescription(string description)
    {
        ArgumentExceptionHelper.ThrowIfNullOrEmpty(description);
        Description = description;
    }

    /// <summary>
    /// Allow this role to be delegated to other users.
    /// </summary>
    public void AllowDelegation() => AllowRoleDelegation = true;

    /// <summary>
    /// Disallow delegation of this role.
    /// </summary>
    public void DisallowDelegation() => AllowRoleDelegation = false;

    public void SetAccreditAllCompanies(bool accreditAllCompanies)
    {
        AccreditAllCompanies = accreditAllCompanies;
        if (accreditAllCompanies)
        {
            _companies.Clear();
        }
    }

    public void SetRegistrationActionTypes(RegistrationActionTypes registrationActionTypes)
    {
        RegistrationActionTypes = registrationActionTypes;
    }

    public void SetProcessDefinitionTypes(ProcessDefinitionTypes processDefinitionTypes)
    {
        ProcessDefinitionTypes = processDefinitionTypes.EncodeHiddenTypes();
    }

    public void SetCompanyAccessLevel(CompanyAccessLevel companyAccessLevel)
    {
        CompanyAccessLevel = companyAccessLevel;
    }

    public void SetDossierAccessLevels(DossierAccessLevels dossierAccessLevels)
    {
        DossierAccessLevels = dossierAccessLevels;
    }

    public void SetFileAccessLevels(FileAccessLevels fileAccessLevels)
    {
        FileAccessLevels = fileAccessLevels;
    }

    public void SetDateTimeSchedules(IList<DateTimeSchedule> source)
    {
        ArgumentNullException.ThrowIfNull(source);

        if (_dateTimeSchedules.SetCollection(source, (s, t) => s.DateTimeScheduleId == t.DateTimeScheduleId, x => new AuthorizationRuleDateTimeSchedule(this, x)))
        {
            UpdateLastModified();
        }
    }

    public void SetLocations(IList<Location> source)
    {
        ArgumentNullException.ThrowIfNull(source);

        if (_locations.SetCollection(source, (s, t) => s.LocationId == t.LocationId, x => new AuthorizationRuleLocation(this, x)))
        {
            UpdateLastModified();
        }
    }

    public void SetZones(IList<Zone> source)
    {
        ArgumentNullException.ThrowIfNull(source);

        if (_zones.SetCollection(source, (s, t) => s.ZoneId == t.ZoneId, x => new AuthorizationRuleZone(this, x)))
        {
            UpdateLastModified();
        }
    }

    public void SetReports(IList<Report> source)
    {
        ArgumentNullException.ThrowIfNull(source);

        if (_reports.SetCollection(source, (s, t) => s.Id == t.ReportId, x => new AuthorizationRuleReport(this, x)))
        {
            UpdateLastModified();
        }
    }

    public void SetPermissions(IList<Permission> source)
    {
        ArgumentNullException.ThrowIfNull(source);

        if (_permissions.SetCollection(source, (s, t) => s == t.Permission, x => new AuthorizationRulePermission(this, x)))
        {
            UpdateLastModified();
        }
    }

    public void SetCompanies(IList<Company> source)
    {
        ArgumentNullException.ThrowIfNull(source);

        if (_companies.SetCollection(source, (s, t) => s.CompanyId == t.CompanyId, x => new AuthorizationRuleCompany(this, x)))
        {
            UpdateLastModified();
        }
    }

    public void SetContractorTypes(IList<ContractorType> source)
    {
        ArgumentNullException.ThrowIfNull(source);

        if (_contractorTypes.SetCollection(source, (s, t) => s.Id == t.ContractorTypeId, x => new AuthorizationRuleContractorType(this, x)))
        {
            UpdateLastModified();
        }
    }

    public void RemoveCompany(Company company)
    {
        ArgumentNullException.ThrowIfNull(company);

        _companies.RemoveAll(c => c.CompanyId == company.CompanyId);
    }
}
