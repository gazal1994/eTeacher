using MiniLmsApi.Models;

namespace MiniLmsApi.Services;

public interface ICourseService
{
    IEnumerable<Course> GetAllCourses();
    Course? GetCourseById(Guid id);
    Course CreateCourse(string title, string description);
    Course UpdateCourse(Guid id, string title, string description);
    void DeleteCourse(Guid id);
}
