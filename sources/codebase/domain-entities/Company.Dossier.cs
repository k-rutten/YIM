namespace YIM.Services.Registration.Data.Entities;

using System;
using Workflows.DataComponents.CompanyComponents;

public partial class Company
{
    /// <summary>
    /// Gets the company dossier.
    /// </summary>
    public CompanyDossier Dossier { get; private set; } = null!;

    /// <summary>
    /// Add company dossier component.
    /// </summary>
    /// <param name="source">The component to use.</param>
    public void AddDossierComponent(ICompany source)
    {
        if (source == null)
        {
            return; // skip empty values.
        }

        var isModified = EnsureDossier.Document.SetComponent(source);

        if (isModified)
        {
            EnsureDossier.UpdateLastModified();
            UpdateLastModified();
        }
    }

    /// <summary>
    /// Remove company dossier component.
    /// </summary>
    public void RemoveDossierComponent()
    {
        var dossierDocument = EnsureDossier.Document;

        if (dossierDocument != null)
        {
            var deactivationDataComponent = EnsureDossier.Document.GetDataComponent<CompanyDeactivation>();

            if (deactivationDataComponent != null)
            {
                Dossier.Document.RemoveComponent(deactivationDataComponent);
            }
        }
    }

    public void UpdateDossierFromSynchronization(CompanyDossier dossier)
    {
        EnsureDossier.Document.Clear();

        foreach (var component in dossier.Document.Components)
        {
            EnsureDossier.Document.SetComponent(component);
        }
    }

    // Release 22.21 makes Dossier required for every company.
    // It's a coding error when the dossier is accessed without loading the dossier.
    private CompanyDossier EnsureDossier => Dossier ?? throw new InvalidOperationException($"Include {nameof(Dossier)}");
}
