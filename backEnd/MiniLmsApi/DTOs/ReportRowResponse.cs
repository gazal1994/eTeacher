namespace MiniLmsApi.DTOs;

public class ReportRowResponse
{
    public Guid CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public int TotalStudents { get; set; }
}
