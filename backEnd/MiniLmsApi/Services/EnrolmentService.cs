using MiniLmsApi.DTOs;
using MiniLmsApi.Exceptions;
using MiniLmsApi.Models;
using MiniLmsApi.Repositories;

namespace MiniLmsApi.Services;

public class EnrolmentService : IEnrolmentService
{
    private readonly IEnrolmentRepository _enrolmentRepository;
    private readonly IStudentRepository _studentRepository;
    private readonly ICourseRepository _courseRepository;

    public EnrolmentService(
        IEnrolmentRepository enrolmentRepository,
        IStudentRepository studentRepository,
        ICourseRepository courseRepository)
    {
        _enrolmentRepository = enrolmentRepository;
        _studentRepository = studentRepository;
        _courseRepository = courseRepository;
    }

    public IEnumerable<EnrolmentResponse> GetAllEnrolments(Guid? courseId = null, string? studentId = null)
    {
        IEnumerable<Enrolment> enrolments;

        if (courseId.HasValue)
        {
            enrolments = _enrolmentRepository.GetByCourseId(courseId.Value);
        }
        else if (studentId != null)
        {
            enrolments = _enrolmentRepository.GetByStudentId(studentId);
        }
        else
        {
            enrolments = _enrolmentRepository.GetAll();
        }

        return enrolments.Select(e =>
        {
            var student = _studentRepository.GetById(e.StudentId);
            var course = _courseRepository.GetById(e.CourseId);

            return new EnrolmentResponse
            {
                StudentId = e.StudentId,
                StudentName = student?.FullName ?? "Unknown",
                CourseId = e.CourseId,
                CourseTitle = course?.Title ?? "Unknown",
                EnrolledAt = e.EnrolledAt
            };
        }).ToList();
    }

    public EnrolmentResponse CreateEnrolment(string studentId, Guid courseId)
    {
        // Validate student exists
        var student = _studentRepository.GetById(studentId);
        if (student == null)
        {
            throw new NotFoundException($"Student with ID {studentId} not found");
        }

        // Validate course exists
        var course = _courseRepository.GetById(courseId);
        if (course == null)
        {
            throw new NotFoundException($"Course with ID {courseId} not found");
        }

        // Check for duplicate enrolment
        if (_enrolmentRepository.Exists(studentId, courseId))
        {
            throw new ConflictException($"Student {student.FullName} is already enrolled in {course.Title}");
        }

        // Create enrolment
        var enrolment = new Enrolment
        {
            StudentId = studentId,
            CourseId = courseId
        };

        var createdEnrolment = _enrolmentRepository.Create(enrolment);

        return new EnrolmentResponse
        {
            StudentId = createdEnrolment.StudentId,
            StudentName = student.FullName,
            CourseId = createdEnrolment.CourseId,
            CourseTitle = course.Title,
            EnrolledAt = createdEnrolment.EnrolledAt
        };
    }

    public void DeleteEnrolment(string studentId, Guid courseId)
    {
        // Validate enrolment exists
        if (!_enrolmentRepository.Exists(studentId, courseId))
        {
            throw new NotFoundException($"Enrolment not found for student {studentId} and course {courseId}");
        }

        _enrolmentRepository.Delete(studentId, courseId);
    }
}
