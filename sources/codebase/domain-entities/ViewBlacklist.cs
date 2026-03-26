namespace YIM.Emulators.Aeos.Data.Entities;
using System;

public partial class ViewBlacklist
{
    public long Carrieroid { get; set; }
    public string Violationcatname { get; set; }
    public int? Type { get; set; }
    public string Description { get; set; }
    public DateTime? Validfrom { get; set; }
    public DateTime? Validto { get; set; }
    public DateTime? Removaldate { get; set; }
}
