namespace YIM.Services.Registration.Data.Entities;
using System;
using ValueObjects;

public partial class Company
{
    public CompanyVcaCertificate? CompanyVcaCertificate { get; private set; }

    public void RemoveVcaCertificate()
    {
        CompanyVcaCertificate = null;
    }

    public void SetVcaCertificate(
        VcaCertificateType type,
        DateTime? expirationDate,
        string? certificateNumber,
        string? description,
        FileReference? fileReference)
    {
        if (CompanyVcaCertificate is null)
        {
            CompanyVcaCertificate = new CompanyVcaCertificate(this, type)
            {
                ExpirationDate = expirationDate,
                CertificateNumber = certificateNumber,
                Description = description,
                FileReference = fileReference
            };
        }
        else
        {
            CompanyVcaCertificate.ExpirationDate = expirationDate;
            CompanyVcaCertificate.CertificateNumber = certificateNumber;
            CompanyVcaCertificate.Description = description;
            CompanyVcaCertificate.FileReference = fileReference;
        }
    }
}
