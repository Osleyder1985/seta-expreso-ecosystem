using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;

public class PocApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient client;

    public PocApiTests(WebApplicationFactory<Program> factory)
    {
        client = factory.CreateClient();
    }

    [Fact]
    public async Task Health_endpoint_is_available()
    {
        var response = await client.GetAsync("/health");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Crud_and_validation_contract()
    {
        var create = await client.PostAsJsonAsync("/packages", new
        {
            house = "POC-" + Guid.NewGuid().ToString("N"),
            weightKg = 2.5,
            recipientAddress = "Camagüey"
        });
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);

        var package = await create.Content.ReadFromJsonAsync<PackageResponse>();
        Assert.NotNull(package);

        var get = await client.GetAsync("/packages/" + package!.Id);
        Assert.Equal(HttpStatusCode.OK, get.StatusCode);

        var update = await client.PatchAsJsonAsync("/packages/" + package.Id, new { weightKg = 3.0 });
        Assert.Equal(HttpStatusCode.OK, update.StatusCode);

        var list = await client.GetAsync("/packages");
        Assert.Equal(HttpStatusCode.OK, list.StatusCode);

        var delete = await client.DeleteAsync("/packages/" + package.Id);
        Assert.Equal(HttpStatusCode.OK, delete.StatusCode);

        var invalid = await client.PostAsJsonAsync("/packages", new { house = "", weightKg = -1, recipientAddress = "" });
        Assert.Equal(HttpStatusCode.BadRequest, invalid.StatusCode);
        var body = await invalid.Content.ReadFromJsonAsync<ErrorEnvelope>();
        Assert.Equal("VALIDATION_ERROR", body!.Error.Code);
    }

    private sealed record PackageResponse(long Id, string House, double WeightKg, string RecipientAddress, DateTime CreatedAt, DateTime UpdatedAt);
    private sealed record ErrorEnvelope(ErrorBody Error);
    private sealed record ErrorBody(string Code, string Message);
}