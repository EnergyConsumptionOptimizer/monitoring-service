# Monitoring Service
[![License: Apache License 2.0](https://img.shields.io/badge/license-Apache%20License%202.0-yellow)](https://www.apache.org/licenses/LICENSE-2.0)
![Version](https://img.shields.io/github/v/release/EnergyConsumptionOptimizer/monitorig-service)

The Monitoring Service is responsible for ingesting and queering utility consumptions from smart furniture hookups.

## Technologies Used
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/en/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
### Database
[![InfluxDB](https://img.shields.io/badge/InfluxDB-22ADF6?style=for-the-badge&logo=influxdb&logoColor=fff)](https://docs.influxdata.com/influxdb/v2/)
### Infrastructure
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
### DevOps
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com/features/actions)
[![Gradle](https://img.shields.io/badge/Gradle-02303A?style=for-the-badge&logo=gradle&logoColor=white)](https://gradle.org/)
[![Docker Hub](https://img.shields.io/badge/Docker_Hub-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://hub.docker.com/)
[![Semantic Release](https://img.shields.io/badge/Semantic_Release-494949?style=for-the-badge&logo=semantic-release&logoColor=white)](https://semantic-release.gitbook.io/)
[![Semantic Versioning](https://img.shields.io/badge/Semantic_Versioning-333333?style=for-the-badge&logo=semver&logoColor=white)](https://semver.org/)
[![Conventional Commits](https://img.shields.io/badge/Conventional_Commits-FE5196?style=for-the-badge&logo=conventionalcommits&logoColor=white)](https://www.conventionalcommits.org/en/v1.0.0/)
[![Renovate](https://img.shields.io/badge/Renovate-1A1F6C?style=for-the-badge&logo=renovate&logoColor=white)](https://renovatebot.com/)
[![SonarCloud](https://img.shields.io/badge/SonarCloud-F3702A?style=for-the-badge&logo=sonarcloud&logoColor=white)](https://sonarcloud.io/)

## REST API Endpoints
### Health
- `GET /health`

### Smart Furniture Hookup
- `POST /api/internal/registerSmartFurnitureHookup`
- `POST /api/internal/disconnectSmartFurnitureHookup`

### Measurements
- `GET /api/internal/measurements/{utilityType}`
- `POST /api/internal/measurements`
- `DELETE /api/internal/measurements/household-user-tags/{username}`
- `DELETE /api/internal/measurements/zone-tags/{zoneID}`

## SOCKET.IO COMMUNICATION

### Real-Time Socket
#### Client Emits
- `subscribeActiveSmartFurnitureHookups`
- `subscribeRealTimeUtilityMeters`
#### Server Emits
- `activeSmartFurnitureHookupsUpdate`
- `utilityMetersUpdate`

### Utility Consumptions Socket
#### Client Emits
- `subscribe(queries: UtilityConsumptionsQueryDTO[])`
- `editQuery(query: UtilityConsumptionsQueryDTO)`
#### Server Emits
- `utilityConsumptionsUpdate`
- `utilityConsumptionsQueryUpdate`

### Utility Meters Socket
#### Client Emits
- `subscribe(queries: UtilityMetersQueryDTO[], interval?: number)`
- `editQuery(query: UtilityMetersQueryDTO)`
- `deleteQuery(queryLabel: string)`
#### Server Emits
- `utilityMetersUpdate`
- `utilityMetersQueryUpdate`
    

    

    

## Documentation
Documentation of the typescript code base can be found at the [typedoc](https://energyconsumptionoptimizer.github.io/monitoring-service/).

## Authors
- Rares Vasiliu ([rares-vsl](https://github.com/rares-vsl))
- Salvatore Bennici ([SalvatoreBennici](https://github.com/SalvatoreBennici))