using MiniLmsApi.Exceptions;
using MiniLmsApi.Models;
using MiniLmsApi.Repositories;

namespace MiniLmsApi.Services;

public class CourseService : ICourseService
{
    private readonly ICourseRepository _courseRepository;

    public CourseService(ICourseRepository courseRepository)
    {
        _courseRepository = courseRepository;
    }

    public IEnumerable<Course> GetAllCourses()
    {
        return _courseRepository.GetAll();
    }

    public Course? GetCourseById(Guid id)
    {
        var course = _courseRepository.GetById(id);
        if (course == null)
        {
            throw new NotFoundException($"Course with ID {id} not found");
        }
        return course;
    }

    public Course CreateCourse(string title, string description)
    {
        var course = new Course
        {
            Title = title,
            Description = description
        };

        return _courseRepository.Create(course);
    }

    public Course UpdateCourse(Guid id, string title, string description)
    {
        var course = new Course
        {
            Title = title,
            Description = description
        };

        var updatedCourse = _courseRepository.Update(id, course);
        if (updatedCourse == null)
        {
            throw new NotFoundException($"Course with ID {id} not found");
        }

        return updatedCourse;
    }

    public void DeleteCourse(Guid id)
    {
        var deleted = _courseRepository.Delete(id);
        if (!deleted)
        {
            throw new NotFoundException($"Course with ID {id} not found");
        }
    }
}
