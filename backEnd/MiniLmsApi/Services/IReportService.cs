using MiniLmsApi.DTOs;

namespace MiniLmsApi.Services;

public interface IReportService
{
    IEnumerable<ReportRowResponse> GetEnrolmentsSummary();
}
