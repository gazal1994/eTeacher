namespace MiniLmsApi.Models;

public class Enrolment
{
    public string StudentId { get; set; } = string.Empty;
    public Guid CourseId { get; set; }
    public DateTime EnrolledAt { get; set; }
}
