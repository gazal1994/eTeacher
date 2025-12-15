using MiniLmsApi.Models;
using MiniLmsApi.Repositories;
using MiniLmsApi.Services;
using Moq;

namespace MiniLmsApi.Tests;

public class ReportServiceTests
{
    private readonly Mock<ICourseRepository> _mockCourseRepository;
    private readonly Mock<IEnrolmentRepository> _mockEnrolmentRepository;
    private readonly ReportService _reportService;

    public ReportServiceTests()
    {
        _mockCourseRepository = new Mock<ICourseRepository>();
        _mockEnrolmentRepository = new Mock<IEnrolmentRepository>();
        _reportService = new ReportService(_mockCourseRepository.Object, _mockEnrolmentRepository.Object);
    }

    [Fact]
    public void GetEnrolmentsSummary_NoCoursesExist_ReturnsEmptyList()
    {
        // Arrange
        _mockCourseRepository.Setup(r => r.GetAll()).Returns(new List<Course>());
        _mockEnrolmentRepository.Setup(r => r.GetAll()).Returns(new List<Enrolment>());

        // Act
        var result = _reportService.GetEnrolmentsSummary();

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact]
    public void GetEnrolmentsSummary_CoursesExistNoEnrolments_ReturnsCoursesWithZeroStudents()
    {
        // Arrange
        var courses = new List<Course>
        {
            new Course { Id = Guid.NewGuid(), Title = "React Basics", Description = "Learn React" },
            new Course { Id = Guid.NewGuid(), Title = "Advanced TypeScript", Description = "Master TypeScript" }
        };

        _mockCourseRepository.Setup(r => r.GetAll()).Returns(courses);
        _mockEnrolmentRepository.Setup(r => r.GetAll()).Returns(new List<Enrolment>());

        // Act
        var result = _reportService.GetEnrolmentsSummary().ToList();

        // Assert
        Assert.Equal(2, result.Count);
        
        // Verify first course (should be "Advanced TypeScript" after sorting)
        Assert.Equal("Advanced TypeScript", result[0].CourseTitle);
        Assert.Equal(0, result[0].TotalStudents);
        
        // Verify second course (should be "React Basics" after sorting)
        Assert.Equal("React Basics", result[1].CourseTitle);
        Assert.Equal(0, result[1].TotalStudents);
    }

    [Fact]
    public void GetEnrolmentsSummary_MultipleEnrolments_ReturnsCorrectCounts()
    {
        // Arrange
        var course1Id = Guid.NewGuid();
        var course2Id = Guid.NewGuid();
        var student1Id = Guid.NewGuid();
        var student2Id = Guid.NewGuid();
        var student3Id = Guid.NewGuid();

        var courses = new List<Course>
        {
            new Course { Id = course1Id, Title = "React Basics", Description = "Learn React" },
            new Course { Id = course2Id, Title = "Node.js", Description = "Backend with Node" }
        };

        var enrolments = new List<Enrolment>
        {
            new Enrolment { StudentId = student1Id, CourseId = course1Id },
            new Enrolment { StudentId = student2Id, CourseId = course1Id },
            new Enrolment { StudentId = student3Id, CourseId = course2Id }
        };

        _mockCourseRepository.Setup(r => r.GetAll()).Returns(courses);
        _mockEnrolmentRepository.Setup(r => r.GetAll()).Returns(enrolments);

        // Act
        var result = _reportService.GetEnrolmentsSummary().ToList();

        // Assert
        Assert.Equal(2, result.Count);
        
        // Find course1 in results
        var course1Report = result.First(r => r.CourseId == course1Id);
        Assert.Equal("React Basics", course1Report.CourseTitle);
        Assert.Equal(2, course1Report.TotalStudents);
        
        // Find course2 in results
        var course2Report = result.First(r => r.CourseId == course2Id);
        Assert.Equal("Node.js", course2Report.CourseTitle);
        Assert.Equal(1, course2Report.TotalStudents);
    }

    [Fact]
    public void GetEnrolmentsSummary_DuplicateEnrolments_CountsUniqueStudentsOnly()
    {
        // Arrange
        var courseId = Guid.NewGuid();
        var studentId = Guid.NewGuid();

        var courses = new List<Course>
        {
            new Course { Id = courseId, Title = "React Basics", Description = "Learn React" }
        };

        // Simulate duplicate enrolments (same student, same course)
        // This should not happen in production due to validation, but report must handle it
        var enrolments = new List<Enrolment>
        {
            new Enrolment { StudentId = studentId, CourseId = courseId, EnrolledAt = DateTime.UtcNow },
            new Enrolment { StudentId = studentId, CourseId = courseId, EnrolledAt = DateTime.UtcNow.AddMinutes(-5) }
        };

        _mockCourseRepository.Setup(r => r.GetAll()).Returns(courses);
        _mockEnrolmentRepository.Setup(r => r.GetAll()).Returns(enrolments);

        // Act
        var result = _reportService.GetEnrolmentsSummary().ToList();

        // Assert
        Assert.Single(result);
        Assert.Equal("React Basics", result[0].CourseTitle);
        Assert.Equal(1, result[0].TotalStudents); // Should count the student only ONCE
    }

    [Fact]
    public void GetEnrolmentsSummary_SortedByCourseTitle_ReturnsAlphabeticalOrder()
    {
        // Arrange
        var courses = new List<Course>
        {
            new Course { Id = Guid.NewGuid(), Title = "Zebra Course", Description = "Last" },
            new Course { Id = Guid.NewGuid(), Title = "Alpha Course", Description = "First" },
            new Course { Id = Guid.NewGuid(), Title = "Beta Course", Description = "Second" }
        };

        _mockCourseRepository.Setup(r => r.GetAll()).Returns(courses);
        _mockEnrolmentRepository.Setup(r => r.GetAll()).Returns(new List<Enrolment>());

        // Act
        var result = _reportService.GetEnrolmentsSummary().ToList();

        // Assert
        Assert.Equal(3, result.Count);
        Assert.Equal("Alpha Course", result[0].CourseTitle);
        Assert.Equal("Beta Course", result[1].CourseTitle);
        Assert.Equal("Zebra Course", result[2].CourseTitle);
    }

    [Fact]
    public void GetEnrolmentsSummary_EnrolmentsForNonExistingCourse_IgnoresOrphanedEnrolments()
    {
        // Arrange
        var existingCourseId = Guid.NewGuid();
        var deletedCourseId = Guid.NewGuid(); // Course that was deleted
        var studentId = Guid.NewGuid();

        var courses = new List<Course>
        {
            new Course { Id = existingCourseId, Title = "React Basics", Description = "Learn React" }
        };

        var enrolments = new List<Enrolment>
        {
            new Enrolment { StudentId = studentId, CourseId = existingCourseId },
            new Enrolment { StudentId = studentId, CourseId = deletedCourseId } // Orphaned enrolment
        };

        _mockCourseRepository.Setup(r => r.GetAll()).Returns(courses);
        _mockEnrolmentRepository.Setup(r => r.GetAll()).Returns(enrolments);

        // Act
        var result = _reportService.GetEnrolmentsSummary().ToList();

        // Assert
        Assert.Single(result); // Only the existing course should appear
        Assert.Equal(existingCourseId, result[0].CourseId);
        Assert.Equal(1, result[0].TotalStudents);
    }

    [Fact]
    public void GetEnrolmentsSummary_MixedScenario_HandlesComplexData()
    {
        // Arrange
        var course1Id = Guid.NewGuid();
        var course2Id = Guid.NewGuid();
        var course3Id = Guid.NewGuid();
        var student1Id = Guid.NewGuid();
        var student2Id = Guid.NewGuid();
        var student3Id = Guid.NewGuid();

        var courses = new List<Course>
        {
            new Course { Id = course1Id, Title = "Course B", Description = "Second alphabetically" },
            new Course { Id = course2Id, Title = "Course A", Description = "First alphabetically" },
            new Course { Id = course3Id, Title = "Course C", Description = "Third alphabetically" }
        };

        var enrolments = new List<Enrolment>
        {
            // Course A: 2 students
            new Enrolment { StudentId = student1Id, CourseId = course2Id },
            new Enrolment { StudentId = student2Id, CourseId = course2Id },
            
            // Course B: 1 student (with duplicate)
            new Enrolment { StudentId = student3Id, CourseId = course1Id },
            new Enrolment { StudentId = student3Id, CourseId = course1Id }, // Duplicate
            
            // Course C: 0 students
        };

        _mockCourseRepository.Setup(r => r.GetAll()).Returns(courses);
        _mockEnrolmentRepository.Setup(r => r.GetAll()).Returns(enrolments);

        // Act
        var result = _reportService.GetEnrolmentsSummary().ToList();

        // Assert
        Assert.Equal(3, result.Count);
        
        // Verify sorted order and counts
        Assert.Equal("Course A", result[0].CourseTitle);
        Assert.Equal(2, result[0].TotalStudents);
        
        Assert.Equal("Course B", result[1].CourseTitle);
        Assert.Equal(1, result[1].TotalStudents); // Duplicate should be counted once
        
        Assert.Equal("Course C", result[2].CourseTitle);
        Assert.Equal(0, result[2].TotalStudents);
    }
}
