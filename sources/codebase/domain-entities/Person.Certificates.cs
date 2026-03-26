namespace YIM.Services.Registration.Data.Entities;
using System.Collections.Generic;

public partial class Person
{
    private readonly List<PersonCertificate> _certificates = [];

    /// <summary>
    /// Gets the certificates.
    /// </summary>
    public IReadOnlyCollection<PersonCertificate> Certificates => _certificates;
}
