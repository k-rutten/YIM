namespace YIM.Services.Registration.Data.Entities;

using System;
using Workflows.DataComponents.PersonComponents;

public partial class Person
{
    /// <summary>
    /// Gets the person dossier.
    /// </summary>
    public PersonDossier Dossier { get; private set; } = null!;

    /// <summary>
    /// Updates the dossier component.
    /// </summary>
    /// <param name="source">The component to add.</param>
    public void SetDossierComponent(IPerson source)
    {
        if (source is null)
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
    /// Gets a dossier component when present.
    /// </summary>
    /// <typeparam name="TDataComponent">The component type to retrieve.</typeparam>
    /// <returns>The resolved data component or null when not found.</returns>
    public TDataComponent? GetDossierComponent<TDataComponent>()
        where TDataComponent : class, IPerson => EnsureDossier.Document.GetDataComponent<TDataComponent>();

    public string? GetLicencePlate()
        => GetDossierComponent<PersonVehicle>()?.LicensePlate;

    public string? GetLicencePlateCountryCode()
        => GetDossierComponent<PersonVehicle>()?.CountryCode;

    // Release 22.21 makes Dossier required for every person.
    // It's a coding error when the dossier is accessed without loading the dossier.
    private PersonDossier EnsureDossier => Dossier ?? throw new InvalidOperationException($"Include {nameof(Dossier)}");
}
