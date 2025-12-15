using System.ComponentModel.DataAnnotations;

namespace MiniLmsApi.DTOs;

public class EnrolmentCreateRequest
{
    [Required]
    public string StudentId { get; set; } = string.Empty;

    [Required]
    public Guid CourseId { get; set; }
}
