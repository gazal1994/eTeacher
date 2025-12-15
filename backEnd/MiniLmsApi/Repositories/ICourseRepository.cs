using MiniLmsApi.Models;

namespace MiniLmsApi.Repositories;

public interface ICourseRepository
{
    IEnumerable<Course> GetAll();
    Course? GetById(Guid id);
    Course Create(Course course);
    Course? Update(Guid id, Course course);
    bool Delete(Guid id);
}
