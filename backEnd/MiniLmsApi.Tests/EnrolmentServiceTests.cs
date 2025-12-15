using MiniLmsApi.Exceptions;
using MiniLmsApi.Repositories;
using MiniLmsApi.Services;

namespace MiniLmsApi.Tests;

public class EnrolmentServiceTests
{
    [Fact]
    public void CreateEnrolment_StudentNotFound_ThrowsNotFoundException()
    {
        // Arrange
        var courseRepository = new InMemoryCourseRepository();
        var studentRepository = new InMemoryStudentRepository();
        var enrolmentRepository = new InMemoryEnrolmentRepository();
        var service = new EnrolmentService(enrolmentRepository, studentRepository, courseRepository);

        var nonExistentStudentId = Guid.NewGuid();
        var validCourseId = Guid.Parse("11111111-1111-1111-1111-111111111111"); // Seeded course

        // Act & Assert
        var exception = Assert.Throws<NotFoundException>(() =>
            service.CreateEnrolment(nonExistentStudentId, validCourseId));

        Assert.Contains("Student", exception.Message);
        Assert.Contains("not found", exception.Message);
    }

    [Fact]
    public void CreateEnrolment_CourseNotFound_ThrowsNotFoundException()
    {
        // Arrange
        var courseRepository = new InMemoryCourseRepository();
        var studentRepository = new InMemoryStudentRepository();
        var enrolmentRepository = new InMemoryEnrolmentRepository();
        var service = new EnrolmentService(enrolmentRepository, studentRepository, courseRepository);

        var validStudentId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"); // Seeded student
        var nonExistentCourseId = Guid.NewGuid();

        // Act & Assert
        var exception = Assert.Throws<NotFoundException>(() =>
            service.CreateEnrolment(validStudentId, nonExistentCourseId));

        Assert.Contains("Course", exception.Message);
        Assert.Contains("not found", exception.Message);
    }

    [Fact]
    public void CreateEnrolment_ValidData_ReturnsEnrolmentResponse()
    {
        // Arrange
        var courseRepository = new InMemoryCourseRepository();
        var studentRepository = new InMemoryStudentRepository();
        var enrolmentRepository = new InMemoryEnrolmentRepository();
        var service = new EnrolmentService(enrolmentRepository, studentRepository, courseRepository);

        var studentId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"); // Alice Johnson
        var courseId = Guid.Parse("11111111-1111-1111-1111-111111111111"); // Introduction to React

        // Act
        var result = service.CreateEnrolment(studentId, courseId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(studentId, result.StudentId);
        Assert.Equal(courseId, result.CourseId);
        Assert.Equal("Alice Johnson", result.StudentName);
        Assert.Equal("Introduction to React", result.CourseTitle);
        Assert.True(result.EnrolledAt <= DateTime.UtcNow);
    }

    [Fact]
    public void CreateEnrolment_DuplicateEnrolment_ThrowsConflictException()
    {
        // Arrange
        var courseRepository = new InMemoryCourseRepository();
        var studentRepository = new InMemoryStudentRepository();
        var enrolmentRepository = new InMemoryEnrolmentRepository();
        var service = new EnrolmentService(enrolmentRepository, studentRepository, courseRepository);

        var studentId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"); // Alice Johnson
        var courseId = Guid.Parse("11111111-1111-1111-1111-111111111111"); // Introduction to React

        // Act - First enrolment should succeed
        var firstEnrolment = service.CreateEnrolment(studentId, courseId);
        Assert.NotNull(firstEnrolment);

        // Act & Assert - Second enrolment should throw ConflictException
        var exception = Assert.Throws<ConflictException>(() =>
            service.CreateEnrolment(studentId, courseId));

        Assert.Contains("already enrolled", exception.Message);
    }

    [Fact]
    public void GetAllEnrolments_FilterByCourseId_ReturnsOnlyEnrolmentsForThatCourse()
    {
        // Arrange
        var courseRepository = new InMemoryCourseRepository();
        var studentRepository = new InMemoryStudentRepository();
        var enrolmentRepository = new InMemoryEnrolmentRepository();
        var service = new EnrolmentService(enrolmentRepository, studentRepository, courseRepository);

        var student1Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        var student2Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
        var course1Id = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var course2Id = Guid.Parse("22222222-2222-2222-2222-222222222222");

        service.CreateEnrolment(student1Id, course1Id);
        service.CreateEnrolment(student2Id, course1Id);
        service.CreateEnrolment(student1Id, course2Id);

        // Act
        var course1Enrolments = service.GetAllEnrolments(courseId: course1Id);

        // Assert
        Assert.Equal(2, course1Enrolments.Count());
        Assert.All(course1Enrolments, e => Assert.Equal(course1Id, e.CourseId));
    }

    [Fact]
    public void GetAllEnrolments_FilterByStudentId_ReturnsOnlyEnrolmentsForThatStudent()
    {
        // Arrange
        var courseRepository = new InMemoryCourseRepository();
        var studentRepository = new InMemoryStudentRepository();
        var enrolmentRepository = new InMemoryEnrolmentRepository();
        var service = new EnrolmentService(enrolmentRepository, studentRepository, courseRepository);

        var student1Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        var student2Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
        var course1Id = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var course2Id = Guid.Parse("22222222-2222-2222-2222-222222222222");

        service.CreateEnrolment(student1Id, course1Id);
        service.CreateEnrolment(student1Id, course2Id);
        service.CreateEnrolment(student2Id, course1Id);

        // Act
        var student1Enrolments = service.GetAllEnrolments(studentId: student1Id);

        // Assert
        Assert.Equal(2, student1Enrolments.Count());
        Assert.All(student1Enrolments, e => Assert.Equal(student1Id, e.StudentId));
    }
}
