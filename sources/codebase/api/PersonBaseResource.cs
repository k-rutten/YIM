namespace YIM.Services.Registration.ApiModels;

using System;

using YIM.ApiModels;

/// <summary>
/// The person base resource class.
/// </summary>
public abstract class PersonBaseResource : WebResource, ISupportModificationTime
{
    /// <summary>
    /// Gets or sets the person identifier.
    /// </summary>
    public Guid PersonId { get; set; }

    /// <summary>
    /// Gets or sets the full name.
    /// </summary>
    public string? FullName { get; set; }

    /// <summary>
    /// Gets or sets the company name.
    /// </summary>
    public string? CompanyName { get; set; }

    /// <summary>
    /// Gets or sets the state.
    /// </summary>
    public State<PersonState> State { get; set; } = EmptyState.Person;

    /// <summary>
    /// Gets or sets a value indicating whether this person is a shadow entity from another tenant.
    /// </summary>
    public bool HasExternalSource { get; set; }

    /// <inheritdoc/>
    public DateTimeOffset ModifiedOnUtc { get; set; }

    /// <inheritdoc/>
    public DateTimeOffset CreatedOnUtc { get; set; }
}
