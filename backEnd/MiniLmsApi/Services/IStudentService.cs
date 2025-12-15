using MiniLmsApi.Models;

namespace MiniLmsApi.Services;

public interface IStudentService
{
    IEnumerable<Student> GetAllStudents();
    Student? GetStudentById(string id);
}
