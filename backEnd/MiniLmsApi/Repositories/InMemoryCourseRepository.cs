using System.Collections.Concurrent;
using MiniLmsApi.Models;

namespace MiniLmsApi.Repositories;

public class InMemoryCourseRepository : ICourseRepository
{
    private readonly ConcurrentDictionary<Guid, Course> _courses = new();

    public InMemoryCourseRepository()
    {
        // Constructor - data will be loaded from JSON files via JsonDataLoader
    }

    public void AddCourse(Course course)
    {
        _courses.TryAdd(course.Id, course);
    }

    public IEnumerable<Course> GetAll()
    {
        return _courses.Values.ToList();
    }

    public Course? GetById(Guid id)
    {
        _courses.TryGetValue(id, out var course);
        return course;
    }

    public Course Create(Course course)
    {
        course.Id = Guid.NewGuid();
        _courses.TryAdd(course.Id, course);
        return course;
    }

    public Course? Update(Guid id, Course course)
    {
        if (!_courses.ContainsKey(id))
        {
            return null;
        }

        course.Id = id;
        _courses[id] = course;
        return course;
    }

    public bool Delete(Guid id)
    {
        return _courses.TryRemove(id, out _);
    }
}
