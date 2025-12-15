using MiniLmsApi.Models;

namespace MiniLmsApi.Repositories;

public interface IStudentRepository
{
    IEnumerable<Student> GetAll();
    Student? GetById(string id);
}
