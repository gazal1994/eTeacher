using Microsoft.AspNetCore.Mvc;
using MiniLmsApi.DTOs;
using MiniLmsApi.Exceptions;
using MiniLmsApi.Services;

namespace MiniLmsApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EnrolmentsController : ControllerBase
{
    private readonly IEnrolmentService _enrolmentService;

    public EnrolmentsController(IEnrolmentService enrolmentService)
    {
        _enrolmentService = enrolmentService;
    }

    [HttpGet]
    public ActionResult<IEnumerable<EnrolmentResponse>> GetAll([FromQuery] Guid? courseId, [FromQuery] string? studentId)
    {
        var enrolments = _enrolmentService.GetAllEnrolments(courseId, studentId);
        return Ok(enrolments);
    }

    [HttpPost]
    public ActionResult<EnrolmentResponse> Create([FromBody] EnrolmentCreateRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { error = "Invalid enrolment data" });
        }

        try
        {
            var enrolment = _enrolmentService.CreateEnrolment(request.StudentId, request.CourseId);
            return CreatedAtAction(nameof(GetAll), null, enrolment);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (ConflictException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    [HttpDelete]
    public ActionResult Delete([FromQuery] string studentId, [FromQuery] Guid courseId)
    {
        try
        {
            _enrolmentService.DeleteEnrolment(studentId, courseId);
            return NoContent();
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }
}
