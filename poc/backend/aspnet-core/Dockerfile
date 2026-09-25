FROM mcr.microsoft.com/dotnet/sdk:10.0@sha256:d818bb3014d94172e93820d985130135870bd1760f02588a61263a85c966860e AS build
WORKDIR /src
COPY . .
RUN dotnet publish -c Release -o /app/publish
FROM mcr.microsoft.com/dotnet/aspnet:10.0@sha256:f55cd506cfa556d8149bda22a4e121b57bb27474256a5714957c168e759626a3
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet","SetaExpreso.Poc.dll"]
