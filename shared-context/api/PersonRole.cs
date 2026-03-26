namespace YIM.Services.Registration.ApiModels;

using YIM.Workflows;

/// <summary>
/// Person role.
/// </summary>
public class PersonRole
{
    /// <summary>
    /// Gets or sets the person role.
    /// </summary>
    public PersonRoleType Role { get; set; }

    /// <summary>
    /// Gets or sets the person number.
    /// </summary>
    public string? PersonNumber { get; set; }
}
