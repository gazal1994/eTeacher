using System.Collections.Concurrent;
using MiniLmsApi.Models;

namespace MiniLmsApi.Repositories;

public class InMemoryStudentRepository : IStudentRepository
{
    private readonly ConcurrentDictionary<string, Student> _students = new();

    public InMemoryStudentRepository()
    {
        // Constructor - data will be loaded from JSON files via JsonDataLoader
    }

    public void AddStudent(Student student)
    {
        _students.TryAdd(student.Id, student);
    }

    public IEnumerable<Student> GetAll()
    {
        return _students.Values.ToList();
    }

    public Student? GetById(string id)
    {
        _students.TryGetValue(id, out var student);
        return student;
    }
}
