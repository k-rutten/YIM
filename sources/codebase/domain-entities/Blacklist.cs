namespace YIM.Emulators.Aeos.Data.Entities;
using System;

public partial class Blacklist
{
    public long Carrieroid { get; set; }
    public int Type { get; set; }
    public long? Violationcategoryobjectid { get; set; }
    public DateTime Validfrom { get; set; }
    public DateTime Validto { get; set; }
    public string Description { get; set; }
    public DateTime? Removaldate { get; set; }
    public long Objectid { get; set; }
    public string Uniqueid { get; set; }
    public bool Removed { get; set; }
}
