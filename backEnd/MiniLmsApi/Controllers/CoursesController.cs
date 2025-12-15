using Microsoft.AspNetCore.Mvc;
using MiniLmsApi.DTOs;
using MiniLmsApi.Exceptions;
using MiniLmsApi.Services;

namespace MiniLmsApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CoursesController : ControllerBase
{
    private readonly ICourseService _courseService;

    public CoursesController(ICourseService courseService)
    {
        _courseService = courseService;
    }

    [HttpGet]
    public ActionResult<IEnumerable<CourseResponse>> GetAll()
    {
        var courses = _courseService.GetAllCourses();
        var response = courses.Select(c => new CourseResponse
        {
            Id = c.Id,
            Title = c.Title,
            Description = c.Description
        });

        return Ok(response);
    }

    [HttpGet("{id}")]
    public ActionResult<CourseResponse> GetById(Guid id)
    {
        try
        {
            var course = _courseService.GetCourseById(id);
            if (course == null)
            {
                return NotFound(new { error = $"Course with ID {id} not found" });
            }

            var response = new CourseResponse
            {
                Id = course.Id,
                Title = course.Title,
                Description = course.Description
            };

            return Ok(response);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpPost]
    public ActionResult<CourseResponse> Create([FromBody] CourseCreateRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { error = "Invalid course data" });
        }

        var course = _courseService.CreateCourse(request.Title, request.Description);

        var response = new CourseResponse
        {
            Id = course.Id,
            Title = course.Title,
            Description = course.Description
        };

        return CreatedAtAction(nameof(GetById), new { id = course.Id }, response);
    }

    [HttpPut("{id}")]
    public ActionResult<CourseResponse> Update(Guid id, [FromBody] CourseUpdateRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { error = "Invalid course data" });
        }

        try
        {
            var course = _courseService.UpdateCourse(id, request.Title, request.Description);

            var response = new CourseResponse
            {
                Id = course.Id,
                Title = course.Title,
                Description = course.Description
            };

            return Ok(response);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public ActionResult Delete(Guid id)
    {
        try
        {
            _courseService.DeleteCourse(id);
            return NoContent();
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }
}
