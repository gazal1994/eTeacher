using MiniLmsApi.DTOs;
using MiniLmsApi.Repositories;

namespace MiniLmsApi.Services;

public class ReportService : IReportService
{
    private readonly ICourseRepository _courseRepository;
    private readonly IEnrolmentRepository _enrolmentRepository;

    public ReportService(ICourseRepository courseRepository, IEnrolmentRepository enrolmentRepository)
    {
        _courseRepository = courseRepository;
        _enrolmentRepository = enrolmentRepository;
    }

    public IEnumerable<ReportRowResponse> GetEnrolmentsSummary()
    {
        var courses = _courseRepository.GetAll();
        var enrolments = _enrolmentRepository.GetAll();

        // Group enrolments by course and count DISTINCT students (no duplicates)
        var enrolmentCountsByCourse = enrolments
            .GroupBy(e => e.CourseId)
            .ToDictionary(
                g => g.Key,
                g => g.Select(e => e.StudentId).Distinct().Count()
            );

        var report = courses.Select(course =>
        {
            // Get distinct student count for this course, or 0 if no enrolments
            var studentCount = enrolmentCountsByCourse.ContainsKey(course.Id)
                ? enrolmentCountsByCourse[course.Id]
                : 0;

            return new ReportRowResponse
            {
                CourseId = course.Id,
                CourseTitle = course.Title,
                TotalStudents = studentCount
            };
        })
        .OrderBy(r => r.CourseTitle) // Sort alphabetically by course title
        .ToList();

        return report;
    }
}
