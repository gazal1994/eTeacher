using MiniLmsApi.Models;
using MiniLmsApi.Repositories;

namespace MiniLmsApi.Services;

public class StudentService : IStudentService
{
    private readonly IStudentRepository _studentRepository;

    public StudentService(IStudentRepository studentRepository)
    {
        _studentRepository = studentRepository;
    }

    public IEnumerable<Student> GetAllStudents()
    {
        return _studentRepository.GetAll();
    }

    public Student? GetStudentById(string id)
    {
        return _studentRepository.GetById(id);
    }
}
