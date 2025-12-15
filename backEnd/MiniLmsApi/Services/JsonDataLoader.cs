using System.Text.Json;
using MiniLmsApi.Models;
using MiniLmsApi.DTOs;

namespace MiniLmsApi.Services;

public class JsonDataLoader
{
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<JsonDataLoader> _logger;

    public JsonDataLoader(IWebHostEnvironment environment, ILogger<JsonDataLoader> logger)
    {
        _environment = environment;
        _logger = logger;
    }

    private string GetDataPath(string fileName)
    {
        return Path.Combine(_environment.ContentRootPath, "Data", fileName);
    }

    public List<Course> LoadCourses()
    {
        try
        {
            var filePath = GetDataPath("courses.json");
            if (!File.Exists(filePath))
            {
                _logger.LogError($"courses.json not found at {filePath}");
                return new List<Course>();
            }

            var json = File.ReadAllText(filePath);
            var courseDtos = JsonSerializer.Deserialize<List<CourseJsonDto>>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (courseDtos == null)
            {
                _logger.LogError("Failed to deserialize courses.json");
                return new List<Course>();
            }

            var courses = courseDtos.Select(dto => new Course
            {
                Id = Guid.Parse(dto.Id),
                Title = dto.Title,
                Description = dto.Description
            }).ToList();

            _logger.LogInformation($"Successfully loaded {courses.Count} courses from JSON");
            return courses;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading courses from JSON");
            return new List<Course>();
        }
    }

    public List<Student> LoadStudents()
    {
        try
        {
            var filePath = GetDataPath("students.json");
            if (!File.Exists(filePath))
            {
                _logger.LogError($"students.json not found at {filePath}");
                return new List<Student>();
            }

            var json = File.ReadAllText(filePath);
            var studentDtos = JsonSerializer.Deserialize<List<StudentJsonDto>>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (studentDtos == null)
            {
                _logger.LogError("Failed to deserialize students.json");
                return new List<Student>();
            }

            var students = studentDtos.Select(dto => new Student
            {
                Id = dto.Id,
                FullName = dto.FullName,
                Email = dto.Email
            }).ToList();

            _logger.LogInformation($"Successfully loaded {students.Count} students from JSON");
            return students;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading students from JSON");
            return new List<Student>();
        }
    }

    public List<Enrolment> LoadEnrolments()
    {
        try
        {
            var filePath = GetDataPath("enrolments.json");
            if (!File.Exists(filePath))
            {
                _logger.LogError($"enrolments.json not found at {filePath}");
                return new List<Enrolment>();
            }

            var json = File.ReadAllText(filePath);
            var enrolmentDtos = JsonSerializer.Deserialize<List<EnrolmentJsonDto>>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (enrolmentDtos == null)
            {
                _logger.LogError("Failed to deserialize enrolments.json");
                return new List<Enrolment>();
            }

            var enrolments = enrolmentDtos.Select(dto => new Enrolment
            {
                StudentId = dto.StudentId,
                CourseId = Guid.Parse(dto.CourseId),
                EnrolledAt = DateTime.Parse(dto.EnrolledAt)
            }).ToList();

            _logger.LogInformation($"Successfully loaded {enrolments.Count} enrolments from JSON");
            return enrolments;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading enrolments from JSON");
            return new List<Enrolment>();
        }
    }

    public List<CourseDetail> LoadCourseDetails()
    {
        try
        {
            var filePath = GetDataPath("courseDetails.json");
            if (!File.Exists(filePath))
            {
                _logger.LogError($"courseDetails.json not found at {filePath}");
                return new List<CourseDetail>();
            }

            var json = File.ReadAllText(filePath);
            var courseDetails = JsonSerializer.Deserialize<List<CourseDetail>>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (courseDetails == null)
            {
                _logger.LogError("Failed to deserialize courseDetails.json");
                return new List<CourseDetail>();
            }

            _logger.LogInformation($"Successfully loaded {courseDetails.Count} course details from JSON");
            return courseDetails;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading course details from JSON");
            return new List<CourseDetail>();
        }
    }
}

// DTOs for JSON deserialization
public class CourseJsonDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class StudentJsonDto
{
    public string Id { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

public class EnrolmentJsonDto
{
    public string StudentId { get; set; } = string.Empty;
    public string CourseId { get; set; } = string.Empty;
    public string EnrolledAt { get; set; } = string.Empty;
}

// Model for course details
public class CourseDetail
{
    public string CourseId { get; set; } = string.Empty;
    public Instructor Instructor { get; set; } = new();
    public string Level { get; set; } = string.Empty;
    public string Language { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int DurationHours { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
    public string LastUpdated { get; set; } = string.Empty;
    public List<string> WhatYouWillLearn { get; set; } = new();
    public List<string> Requirements { get; set; } = new();
    public List<SyllabusSection> Syllabus { get; set; } = new();
}

public class Instructor
{
    public string Name { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public string Avatar { get; set; } = string.Empty;
}

public class SyllabusSection
{
    public string Title { get; set; } = string.Empty;
    public int Lectures { get; set; }
    public int DurationMinutes { get; set; }
}
