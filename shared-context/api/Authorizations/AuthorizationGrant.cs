namespace YIM.Services.Registration.ApiModels.Authorizations;

using System;
using ValueObjects;

/// <summary>
/// Authorization access grant for a period.
/// </summary>
public class AuthorizationGrant
{
    /// <summary>
    /// Initializes a new instance of the <see cref="AuthorizationGrant"/> class.
    /// </summary>
    /// <param name="authorizationId">The authorization identifier.</param>
    /// <param name="period">The access period.</param>
    public AuthorizationGrant(Guid authorizationId, Period period)
    {
        AuthorizationId = authorizationId;
        Period = period;
    }

    /// <summary>
    /// Gets the authorization identifier.
    /// </summary>
    public Guid AuthorizationId { get; }

    /// <summary>
    /// Gets the authorization acess period..
    /// </summary>
    public Period Period { get; }

    /// <summary>
    /// Create a grant based on dates.
    /// </summary>
    /// <param name="authorizationId">The required authorization identifier.</param>
    /// <param name="from">The required from date.</param>
    /// <param name="to">The required to date.</param>
    /// <returns>The grant.</returns>
    /// <exception cref="ArgumentNullException">when from or to are null</exception>
    public static AuthorizationGrant Create(Guid authorizationId, DateTime? from, DateTime? to)
    {
        if (from == null)
        {
            throw new ArgumentNullException(nameof(from));
        }

        if (to == null)
        {
            throw new ArgumentNullException(nameof(to));
        }
        return new AuthorizationGrant(authorizationId, new Period(from.Value, to.Value));
    }
}
