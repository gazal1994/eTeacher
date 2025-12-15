using MiniLmsApi.DTOs;

namespace MiniLmsApi.Services;

public interface IEnrolmentService
{
    IEnumerable<EnrolmentResponse> GetAllEnrolments(Guid? courseId = null, string? studentId = null);
    EnrolmentResponse CreateEnrolment(string studentId, Guid courseId);
    void DeleteEnrolment(string studentId, Guid courseId);
}
