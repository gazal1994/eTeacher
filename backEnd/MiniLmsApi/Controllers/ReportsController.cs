using Microsoft.AspNetCore.Mvc;
using MiniLmsApi.DTOs;
using MiniLmsApi.Services;

namespace MiniLmsApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpGet("enrolments-summary")]
    public ActionResult<IEnumerable<ReportRowResponse>> GetEnrolmentsSummary()
    {
        var summary = _reportService.GetEnrolmentsSummary();
        return Ok(summary);
    }
}
