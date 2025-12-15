using System.ComponentModel.DataAnnotations;

namespace MiniLmsApi.DTOs;

public class CourseUpdateRequest
{
    [Required]
    [MinLength(2, ErrorMessage = "Title must be at least 2 characters long")]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MinLength(5, ErrorMessage = "Description must be at least 5 characters long")]
    public string Description { get; set; } = string.Empty;
}
