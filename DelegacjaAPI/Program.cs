using DelegacjaAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<TableStorageServices>();

// konfiguracja CORS 
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendClient", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173") // adres frontendu Vite
            .AllowAnyHeader()
            .AllowAnyMethod();
        
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// u¿ycie polityki CORS
app.UseCors("FrontendClient");

app.UseAuthorization();

app.MapControllers();

app.Run();