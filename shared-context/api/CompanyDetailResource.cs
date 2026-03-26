namespace YIM.Services.Registration.ApiModels;

using System.Collections.Generic;
using YIM.Workflows;

/// <summary>
/// The company detail resource.
/// </summary>
public class CompanyDetailResource : CompanyBaseResource
{
    /// <summary>
    /// Gets or sets the dossier form.
    /// </summary>
    public DossierFormResource Dossier { get; set; } = new DossierFormResource();

    /// <summary>
    /// Gets or sets the list of registrations.
    /// </summary>
    public List<RegistrationListResource> Registrations { get; set; } = [];

    /// <summary>
    /// Gets or sets the visible dossier tabs.
    /// </summary>
    public List<DossierAccessLevels> DossierAccessLevels { get; set; } = [];

    /// <summary>
    /// Gets or sets the available actions.
    /// </summary>
    public List<RegistrationActionTypes> RegistrationActionTypes { get; set; } = [];

    public bool IsShadow { get; set; }
}
