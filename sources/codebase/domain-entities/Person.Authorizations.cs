namespace YIM.Services.Registration.Data.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using Exceptions;
using ValueObjects;
using Workflows;
using YIM.Localization;

public partial class Person
{
    private readonly List<PersonAuthorization> _authorizations = [];

    /// <summary>
    /// Gets the assigned authorizations.
    /// </summary>
    public IReadOnlyCollection<PersonAuthorization> Authorizations => _authorizations;

    /// <summary>
    /// Imports an authorization.
    /// </summary>
    /// <param name="authorization">The authorization.</param>
    /// <param name="schedule">The authorization schedule.</param>
    /// <returns>The person authorization item.</returns>
    public PersonAuthorization AddAuthorizationByImport(
        Authorization authorization,
        AuthorizationSchedule schedule)
    {
        ArgumentNullException.ThrowIfNull(authorization);
        EnsureInsidePeriodOfAccess(schedule);
        EnsureScheduleTypeForPersonType(schedule);

        var item = FindAuthorization(authorization.AuthorizationId, schedule);
        if (item is null)
        {
            item = PersonAuthorization.CreateByImportSource(this, authorization, schedule);
            _authorizations.Add(item);
            UpdateLastModified();
        }

        return item;
    }

    /// <summary>
    /// Adds an authorization as admin.
    /// </summary>
    /// <param name="authorization">The authorization.</param>
    /// <param name="scheduleFrom">Schedule date from.</param>
    /// <param name="scheduleTo">Schedule date to.</param>
    /// <param name="user">The user that added the authorization.</param>
    /// <returns>The person authorization item.</returns>
    public PersonAuthorization AddAuthorizationByManagement(
        Authorization authorization,
        DateTime scheduleFrom,
        DateTime? scheduleTo,
        User? user)
    {
        ArgumentNullException.ThrowIfNull(authorization);

        var schedule = new AuthorizationSchedule(AuthorizationScheduleType.DaySchedule, scheduleFrom.Date, scheduleTo?.Date);
        EnsureInsidePeriodOfAccess(schedule);
        EnsureScheduleTypeForPersonType(schedule); // DaySchedule is not allowed for visitors, so fail here when we add a visitor to an event.

        var item = FindAuthorization(authorization.AuthorizationId, schedule);

        //Can create a new authorization if the equal or the equal authorization was revoked
        if (item is null || item.RevokedById is not null)
        {
            item = PersonAuthorization.CreateByManagementSource(this, authorization, schedule, user);
            _authorizations.Add(item);
            UpdateLastModified();
        }

        return item;
    }

    /// <summary>
    /// Adds an event authorization.
    /// </summary>
    /// <param name="eventMember">The event member.</param>
    /// <param name="authorization">The authorization.</param>
    /// <param name="period">The authorization period.</param>
    /// <param name="user">The user that added the authorization.</param>
    /// <remarks>
    /// AddAuthorization for events is using the Period object as we require a from and to date for events.
    /// </remarks>
    /// <returns>The person authorization item.</returns>
    public PersonAuthorization AddAuthorizationByEvent(
        EventMember eventMember,
        Authorization authorization,
        Period period,
        User? user)
    {
        ArgumentNullException.ThrowIfNull(authorization);
        ArgumentNullException.ThrowIfNull(eventMember);

        var schedule = new AuthorizationSchedule(AuthorizationScheduleType.DaySchedule, period.From, period.To);
        EnsureInsidePeriodOfAccess(schedule);

        var item = FindEventAuthorization(authorization.AuthorizationId, schedule, eventMember);
        if (item is null || item.RevokedById is not null)
        {
            item = PersonAuthorization.CreateByEventSource(this, eventMember, authorization, schedule, user);
            _authorizations.Add(item);
            UpdateLastModified();
        }

        return item;
    }

    public PersonAuthorization AddAuthorizationByTemplate(
        AuthorizationTemplate template,
        JobFunction? jobFunction,
        Authorization authorization,
        DateTime scheduleFrom,
        DateTime? scheduleTo)
    {
        ArgumentNullException.ThrowIfNull(template);
        ArgumentNullException.ThrowIfNull(authorization);

        // We can add a historical authorization, so we don't check the period of access for this category.
        var schedule = new AuthorizationSchedule(AuthorizationScheduleType.DaySchedule, scheduleFrom.Date, scheduleTo?.Date);
        var item = jobFunction is not null ?
            PersonAuthorization.CreateByJobFunctionSource(this, authorization, schedule, jobFunction, template) :
            PersonAuthorization.CreateByAuthorizationTemplate(this, authorization, schedule, template);
        var index = _authorizations.IndexOfFirst(x => x.IsSimilar(item));
        if (index == -1)
        {
            _authorizations.Add(item);
            UpdateLastModified();
        }
        else
        {
            item = _authorizations[index];
        }

        return item;
    }

    /// <summary>
    /// Adds an approved authorization.
    /// The properties <see cref="RegistrationAuthorization.RegistrationAccess"/> and <see cref="RegistrationAuthorization.Authorization"/>
    /// must be available in this method.
    /// </summary>
    /// <param name="registrationAuthorization">The registration access authorization.</param>
    /// <returns>The person authorization item.</returns>
    public PersonAuthorization AddAuthorizationByRegistration(RegistrationAuthorization registrationAuthorization)
    {
        ArgumentNullException.ThrowIfNull(registrationAuthorization);
        if (registrationAuthorization.Authorization is null)
        {
            throw new ArgumentOutOfRangeException(nameof(registrationAuthorization), $"{nameof(registrationAuthorization.Authorization)} was not loaded");
        }

        if (!registrationAuthorization.IsApproved())
        {
            throw new YimDataException(ExceptionLocalizerId.AuthorizationWasNotApproved);
        }

        var utcNow = Clock.UtcNow;
        var schedule = new AuthorizationSchedule(registrationAuthorization.ScheduleType, registrationAuthorization.ScheduleFrom, registrationAuthorization.ScheduleTo);
        EnsureInsidePeriodOfAccess(schedule);
        EnsureScheduleTypeForPersonType(schedule);

        if (registrationAuthorization.PersonAuthorizationId is not null)
        {
            // Update existing person authorization instead of adding a new one.
            var existingPersonAuthorization = _authorizations.Find(x => x.Id == registrationAuthorization.PersonAuthorizationId);
            if (existingPersonAuthorization is null)
            {
                throw new YimEntityNotFoundException(ExceptionLocalizerId.PersonAuthorizationNotFound);
            }

            existingPersonAuthorization.ChangeSchedule(schedule, utcNow);

            return existingPersonAuthorization;
        }

        var item = PersonAuthorization.CreateByRegistrationSource(this, schedule, registrationAuthorization);
        _authorizations.Add(item);
        UpdateLastModified();

        return item;
    }

    public void RevokeAuthorizations(IEnumerable<PersonAuthorization> personAuthorizations, DateTimeOffset utcNow)
    {
        foreach (var personAuthorization in personAuthorizations)
        {
            RevokeAuthorization(personAuthorization, utcNow);
        }
    }

    public void RevokeAuthorization(PersonAuthorization personAuthorization, DateTimeOffset utcNow)
    {
        if (personAuthorization.PersonId != PersonId)
        {
            throw new YimInvalidOperationException(ExceptionLocalizerId.PersonNotFound);
        }

        var index = _authorizations.IndexOf(personAuthorization);
        if (index == -1)
        {
            return;
        }

        personAuthorization.Revoke(utcNow);
        UpdateLastModified();
    }

    public void UpdateSchedule(PersonAuthorization personAuthorization, DateTime newScheduleFrom, DateTime? newScheduleTo, DateTimeOffset dutchNow)
    {
        var newSchedule = new AuthorizationSchedule(personAuthorization.ScheduleType, newScheduleFrom, newScheduleTo);

        EnsureInsidePeriodOfAccess(newSchedule);
        personAuthorization.ChangeSchedule(newSchedule, dutchNow);
    }

    /// <summary>
    /// Imports an authorization.
    /// </summary>
    /// <param name="authorization">The authorization.</param>
    /// <param name="schedule">The authorization schedule.</param>
    /// <returns>The person authorization item.</returns>
    public PersonAuthorization AddAuthorizationByRegistrationIntergrationApi(
        Authorization authorization,
        AuthorizationSchedule schedule)
    {
        ArgumentNullException.ThrowIfNull(authorization);
        EnsureInsidePeriodOfAccess(schedule);
        EnsureScheduleTypeForPersonType(schedule);

        var item = FindAuthorization(authorization.AuthorizationId, schedule);
        if (item is null)
        {
            item = PersonAuthorization.CreateByRegistrationIntergrationApiSource(this, authorization, schedule);
            _authorizations.Add(item);
            UpdateLastModified();
        }

        return item;
    }

    private void EnsureScheduleTypeForPersonType(AuthorizationSchedule schedule)
    {
        switch (schedule.Type)
        {
            case AuthorizationScheduleType.MaxOneDayTimeSchedule when PersonRole != PersonRoleType.Visitor:
                throw new YimInvalidOperationException("MaxOneDayTimeScheduleInvalidForPersonRole");
            case AuthorizationScheduleType.DaySchedule when PersonRole == PersonRoleType.Visitor:
                throw new YimInvalidOperationException("DayScheduleInvalidForPersonRole");
        }
    }

    private PersonAuthorization? FindAuthorization(
        Guid authorizationId,
        AuthorizationSchedule schedule) => _authorizations.Find(
            x => x.AuthorizationId == authorizationId &&
                 x.ScheduleType == schedule.Type &&
                 x.ScheduleFrom == schedule.From &&
                 x.ScheduleTo == schedule.To);

    private PersonAuthorization? FindEventAuthorization(
        Guid authorizationId,
        AuthorizationSchedule schedule,
        EventMember eventMember) => _authorizations.Find(
            x => x.AuthorizationId == authorizationId &&
                x.ScheduleType == schedule.Type &&
                x.ScheduleFrom == schedule.From &&
                x.ScheduleTo == schedule.To &&
                x.SourceEventMember == eventMember &&
                x.Source == PersonAuthorizationSourceType.EventSource);
}
