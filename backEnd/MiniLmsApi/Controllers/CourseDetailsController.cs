using Microsoft.AspNetCore.Mvc;
using MiniLmsApi.Services;

namespace MiniLmsApi.Controllers;

[ApiController]
[Route("api/course-details")]
public class CourseDetailsController : ControllerBase
{
    private readonly JsonDataLoader _dataLoader;
    private readonly ILogger<CourseDetailsController> _logger;
    private static List<CourseDetail>? _cachedCourseDetails;

    public CourseDetailsController(JsonDataLoader dataLoader, ILogger<CourseDetailsController> logger)
    {
        _dataLoader = dataLoader;
        _logger = logger;
    }

    private List<CourseDetail> GetCourseDetails()
    {
        if (_cachedCourseDetails == null)
        {
            _cachedCourseDetails = _dataLoader.LoadCourseDetails();
        }
        return _cachedCourseDetails;
    }

    /// <summary>
    /// Get detailed information for a specific course
    /// </summary>
    /// <param name="courseId">The course ID (GUID format)</param>
    /// <returns>Detailed course information including instructor, syllabus, requirements, etc.</returns>
    [HttpGet("{courseId}")]
    public ActionResult<CourseDetail> GetCourseDetail(string courseId)
    {
        try
        {
            var courseDetails = GetCourseDetails();
            var detail = courseDetails.FirstOrDefault(cd => cd.CourseId == courseId);

            if (detail == null)
            {
                _logger.LogWarning($"Course details not found for courseId: {courseId}");
                return NotFound(new { message = $"Course details not found for courseId: {courseId}" });
            }

            return Ok(detail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error retrieving course details for courseId: {courseId}");
            return StatusCode(500, new { message = "An error occurred while retrieving course details" });
        }
    }

    /// <summary>
    /// Get detailed information for all courses
    /// </summary>
    /// <returns>List of all course details</returns>
    [HttpGet]
    public ActionResult<List<CourseDetail>> GetAllCourseDetails()
    {
        try
        {
            var courseDetails = GetCourseDetails();
            _logger.LogInformation($"Retrieved {courseDetails.Count} course details");
            return Ok(courseDetails);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all course details");
            return StatusCode(500, new { message = "An error occurred while retrieving course details" });
        }
    }
}
