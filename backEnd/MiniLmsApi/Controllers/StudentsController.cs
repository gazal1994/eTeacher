using Microsoft.AspNetCore.Mvc;
using MiniLmsApi.Services;

namespace MiniLmsApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StudentsController : ControllerBase
{
    private readonly IStudentService _studentService;

    public StudentsController(IStudentService studentService)
    {
        _studentService = studentService;
    }

    [HttpGet]
    public ActionResult GetAll()
    {
        var students = _studentService.GetAllStudents();
        return Ok(students);
    }
}
