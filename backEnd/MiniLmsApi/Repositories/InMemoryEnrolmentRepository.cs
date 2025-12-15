using System.Collections.Concurrent;
using MiniLmsApi.Models;

namespace MiniLmsApi.Repositories;

public class InMemoryEnrolmentRepository : IEnrolmentRepository
{
    private readonly List<Enrolment> _enrolments = new();
    private readonly object _lock = new();

    public void AddEnrolment(Enrolment enrolment)
    {
        lock (_lock)
        {
            _enrolments.Add(enrolment);
        }
    }

    public IEnumerable<Enrolment> GetAll()
    {
        lock (_lock)
        {
            return _enrolments.ToList();
        }
    }

    public IEnumerable<Enrolment> GetByCourseId(Guid courseId)
    {
        lock (_lock)
        {
            return _enrolments.Where(e => e.CourseId == courseId).ToList();
        }
    }

    public IEnumerable<Enrolment> GetByStudentId(string studentId)
    {
        lock (_lock)
        {
            return _enrolments.Where(e => e.StudentId == studentId).ToList();
        }
    }

    public bool Exists(string studentId, Guid courseId)
    {
        lock (_lock)
        {
            return _enrolments.Any(e => e.StudentId == studentId && e.CourseId == courseId);
        }
    }

    public Enrolment Create(Enrolment enrolment)
    {
        lock (_lock)
        {
            enrolment.EnrolledAt = DateTime.UtcNow;
            _enrolments.Add(enrolment);
            return enrolment;
        }
    }

    public void Delete(string studentId, Guid courseId)
    {
        lock (_lock)
        {
            var enrolmentToRemove = _enrolments.FirstOrDefault(e => e.StudentId == studentId && e.CourseId == courseId);
            if (enrolmentToRemove != null)
            {
                _enrolments.Remove(enrolmentToRemove);
            }
        }
    }
}
