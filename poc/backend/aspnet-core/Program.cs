using Npgsql;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddOpenApi();
builder.Services.AddHealthChecks();
builder.Services.AddSingleton<PackageStore>();

var app = builder.Build();

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(new { error = new { code = "INTERNAL_ERROR", message = "Internal server error" } });
    });
});

app.MapOpenApi();
app.MapHealthChecks("/health");

app.MapPost("/packages", async (CreatePackageDto dto, PackageStore s) =>
{
    var validation = Validate(dto);
    if (validation is not null) return validation;
    var p = await s.Create(dto);
    return Results.Created("/packages/" + p.Id, p);
});

app.MapGet("/packages", async (PackageStore s) => Results.Ok(await s.All()));
app.MapGet("/packages/{id:long}", async (long id, PackageStore s) =>
    await s.Get(id) is { } p
        ? Results.Ok(p)
        : NotFound("PACKAGE_NOT_FOUND", "Package not found"));

app.MapPatch("/packages/{id:long}", async (long id, UpdatePackageDto dto, PackageStore s) =>
{
    var validation = Validate(dto);
    if (validation is not null) return validation;
    return await s.Update(id, dto) is { } p
        ? Results.Ok(p)
        : NotFound("PACKAGE_NOT_FOUND", "Package not found");
});

app.MapDelete("/packages/{id:long}", async (long id, PackageStore s) =>
    await s.Delete(id)
        ? Results.Ok(new { deleted = true })
        : NotFound("PACKAGE_NOT_FOUND", "Package not found"));

app.Run();

static IResult? Validate(CreatePackageDto dto)
{
    if (string.IsNullOrWhiteSpace(dto.House) || dto.WeightKg < 0 || string.IsNullOrWhiteSpace(dto.RecipientAddress))
        return Results.BadRequest(new { error = new { code = "VALIDATION_ERROR", message = "Invalid package" } });
    return null;
}

static IResult? Validate(UpdatePackageDto dto)
{
    if ((dto.House is not null && string.IsNullOrWhiteSpace(dto.House)) ||
        dto.WeightKg is < 0 ||
        (dto.RecipientAddress is not null && string.IsNullOrWhiteSpace(dto.RecipientAddress)))
        return Results.BadRequest(new { error = new { code = "VALIDATION_ERROR", message = "Invalid package" } });
    return null;
}

static IResult NotFound(string code, string message) =>
    Results.NotFound(new { error = new { code, message } });

public partial class Program;

record CreatePackageDto(string House, double WeightKg, string RecipientAddress);
record UpdatePackageDto(string? House, double? WeightKg, string? RecipientAddress);
record Package(long Id, string House, double WeightKg, string RecipientAddress, DateTime CreatedAt, DateTime UpdatedAt);

sealed class PackageStore
{
    readonly string cs = Environment.GetEnvironmentVariable("DATABASE_URL")
        ?? "Host=localhost;Port=5432;Database=poc;Username=poc;Password=poc";

    public async Task<Package> Create(CreatePackageDto x)
    {
        await using var c = new NpgsqlConnection(cs);
        await c.OpenAsync();
        await using var tx = await c.BeginTransactionAsync();
        await using var cmd = new NpgsqlCommand(
            "INSERT INTO packages(house,weight_kg,recipient_address) VALUES($1,$2,$3) RETURNING id,house,weight_kg,recipient_address,created_at,updated_at",
            c, tx);
        cmd.Parameters.AddWithValue(x.House);
        cmd.Parameters.AddWithValue(x.WeightKg);
        cmd.Parameters.AddWithValue(x.RecipientAddress);
        await using var r = await cmd.ExecuteReaderAsync();
        await r.ReadAsync();
        var p = Read(r);
        await r.CloseAsync();
        await tx.CommitAsync();
        return p;
    }

    public async Task<List<Package>> All()
    {
        await using var c = new NpgsqlConnection(cs);
        await c.OpenAsync();
        await using var cmd = new NpgsqlCommand("SELECT id,house,weight_kg,recipient_address,created_at,updated_at FROM packages ORDER BY id", c);
        await using var r = await cmd.ExecuteReaderAsync();
        var a = new List<Package>();
        while (await r.ReadAsync()) a.Add(Read(r));
        return a;
    }

    public async Task<Package?> Get(long id)
    {
        await using var c = new NpgsqlConnection(cs);
        await c.OpenAsync();
        await using var cmd = new NpgsqlCommand("SELECT id,house,weight_kg,recipient_address,created_at,updated_at FROM packages WHERE id=$1", c);
        cmd.Parameters.AddWithValue(id);
        await using var r = await cmd.ExecuteReaderAsync();
        return await r.ReadAsync() ? Read(r) : null;
    }

    public async Task<Package?> Update(long id, UpdatePackageDto x)
    {
        await using var c = new NpgsqlConnection(cs);
        await c.OpenAsync();
        await using var cmd = new NpgsqlCommand(
            "UPDATE packages SET house=COALESCE($2,house),weight_kg=COALESCE($3,weight_kg),recipient_address=COALESCE($4,recipient_address),updated_at=now() WHERE id=$1 RETURNING id,house,weight_kg,recipient_address,created_at,updated_at",
            c);
        cmd.Parameters.AddWithValue(id);
        cmd.Parameters.AddWithValue((object?)x.House ?? DBNull.Value);
        cmd.Parameters.AddWithValue((object?)x.WeightKg ?? DBNull.Value);
        cmd.Parameters.AddWithValue((object?)x.RecipientAddress ?? DBNull.Value);
        await using var r = await cmd.ExecuteReaderAsync();
        return await r.ReadAsync() ? Read(r) : null;
    }

    public async Task<bool> Delete(long id)
    {
        await using var c = new NpgsqlConnection(cs);
        await c.OpenAsync();
        await using var cmd = new NpgsqlCommand("DELETE FROM packages WHERE id=$1", c);
        cmd.Parameters.AddWithValue(id);
        return await cmd.ExecuteNonQueryAsync() == 1;
    }

    static Package Read(NpgsqlDataReader r) =>
        new(r.GetInt64(0), r.GetString(1), r.GetDouble(2), r.GetString(3), r.GetDateTime(4), r.GetDateTime(5));
}