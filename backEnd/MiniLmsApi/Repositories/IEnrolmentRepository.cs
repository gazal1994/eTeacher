using MiniLmsApi.Models;

namespace MiniLmsApi.Repositories;

public interface IEnrolmentRepository
{
    IEnumerable<Enrolment> GetAll();
    IEnumerable<Enrolment> GetByCourseId(Guid courseId);
    IEnumerable<Enrolment> GetByStudentId(string studentId);
    bool Exists(string studentId, Guid courseId);
    Enrolment Create(Enrolment enrolment);
    void Delete(string studentId, Guid courseId);
}
