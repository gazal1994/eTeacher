using MiniLmsApi.Repositories;
using MiniLmsApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

// Register JsonDataLoader as Singleton
builder.Services.AddSingleton<JsonDataLoader>();

// Register repositories as Singletons (in-memory storage persists during app runtime)
builder.Services.AddSingleton<ICourseRepository, InMemoryCourseRepository>();
builder.Services.AddSingleton<IStudentRepository, InMemoryStudentRepository>();
builder.Services.AddSingleton<IEnrolmentRepository, InMemoryEnrolmentRepository>();

// Register services as Scoped
builder.Services.AddScoped<ICourseService, CourseService>();
builder.Services.AddScoped<IStudentService, StudentService>();
builder.Services.AddScoped<IEnrolmentService, EnrolmentService>();
builder.Services.AddScoped<IReportService, ReportService>();

// Add Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Mini LMS API",
        Version = "v1",
        Description = "API for managing courses, students, and enrolments in a Mini LMS"
    });
});

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001", "http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Load data from JSON files and seed repositories
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    
    try
    {
        logger.LogInformation("Loading data from JSON files...");
        
        var dataLoader = services.GetRequiredService<JsonDataLoader>();
        
        // Load all data from JSON files
        var courses = dataLoader.LoadCourses();
        var students = dataLoader.LoadStudents();
        var enrolments = dataLoader.LoadEnrolments();
        var courseDetails = dataLoader.LoadCourseDetails();
        
        // Seed repositories
        var courseRepo = services.GetRequiredService<ICourseRepository>() as InMemoryCourseRepository;
        var studentRepo = services.GetRequiredService<IStudentRepository>() as InMemoryStudentRepository;
        var enrolmentRepo = services.GetRequiredService<IEnrolmentRepository>() as InMemoryEnrolmentRepository;
        
        if (courseRepo != null)
        {
            foreach (var course in courses)
            {
                courseRepo.AddCourse(course);
            }
        }
        
        if (studentRepo != null)
        {
            foreach (var student in students)
            {
                studentRepo.AddStudent(student);
            }
        }
        
        if (enrolmentRepo != null)
        {
            foreach (var enrolment in enrolments)
            {
                enrolmentRepo.AddEnrolment(enrolment);
            }
        }
        
        logger.LogInformation($"Successfully loaded {courses.Count} courses, {students.Count} students, and {enrolments.Count} enrolments");
        logger.LogInformation($"Course details available for {courseDetails.Count} courses");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while loading data from JSON files");
    }
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Mini LMS API v1");
        options.RoutePrefix = string.Empty; // Serve Swagger UI at the app's root
    });
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();
