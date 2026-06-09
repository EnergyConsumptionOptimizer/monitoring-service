import { Logger } from "pino";

import { createApp } from "./app";
import { InfluxMonitoringRepository } from "@infrastructure/persistence/influxDB/InfluxMonitoringRepository";
import { HouseholdUserService } from "@application/outbound/HouseholdUserService";
import { HTTPHouseholdUserService } from "@infrastructure/adapters/HTTPHouseholdUserService";
import { MapService } from "@application/outbound/MapService";
import { HTTPMapService } from "@infrastructure/adapters/HTTPMapService";
import { HTTPSmartFurnitureHookupService } from "@infrastructure/adapters/HTTPSmartFurnitureHookupService";
import { MonitoringRepository } from "@domain/ports/MonitoringRepository";
import { IngestingServiceImpl } from "@application/IngestingServiceImpl";
import { MonitoringServiceImpl } from "@application/MonitoringServiceImpl";
import { MeasurementMaintenanceServiceImpl } from "@application/MeasurementMaintenanceServiceImpl";
import { config } from "@bootstrap/config";
import { SmartFurnitureHookupService } from "@application/outbound/SmartFurnitureHookupService";
import { router } from "@presentation/rest/routes/router";
import { IngestingController } from "@presentation/rest/controllers/IngestingController";
import { MeasurementMaintenanceController } from "@presentation/rest/controllers/MeasurementMaintenanceController";
import { MonitoringController } from "@presentation/rest/controllers/MonitoringController";
import { IngestingService } from "@application/inbound/IngestingService";
import { MonitoringService } from "@application/inbound/MonitoringService";
import { MeasurementMaintenanceService } from "@application/inbound/MeasurementMaintenanceService";
import { SocketAuthMiddleware } from "@presentation/web-sockets/middleware/SocketAuthMiddleware";
import { ActiveSmartFurnitureHookupsHandler } from "@presentation/web-sockets/handlers/ActiveSmartFurnitureHookupsHandler";
import { UtilityMetersHandler } from "@presentation/web-sockets/handlers/UtilityMetersHandler";
import { UtilityConsumptionsHandler } from "@presentation/web-sockets/handlers/UtilityConsumptionsHandler";
import { namespaces } from "@presentation/web-sockets/MainSocket";
import { getInfluxDBClientInstance } from "@bootstrap/InfluxInstance";
import http from "http";
import { Server } from "socket.io";
import { SocketsNamespaceManager } from "@presentation/web-sockets/SocketsNamespaceManager";
import { InfluxDBClient } from "@infrastructure/persistence/influxDB/InfluxDBClient";
import { RedisHouseholdUserService } from "@infrastructure/adapters/RedisHouseholdUserService";
import { RedisReadModelStore } from "@infrastructure/persistence/redis/RedisReadModelStore";
import { getRedisInstance } from "@bootstrap/RedisInstance";
import { HttpReadModelService } from "@infrastructure/persistence/redis/HTTPReadModelService";
import { ReadModelSynchronizer } from "@infrastructure/persistence/redis/ReadModelSynchronizer";
import { HouseholdUserServiceFailoverProxy } from "@infrastructure/HouseholdUserServiceFailoverProxy";
import { KafkaHealthMonitor } from "@infrastructure/messaging/KafkaHealthMonitor";
import { RedisSmartFurnitureHookupService } from "@infrastructure/adapters/RedisSmartFurnitureHookupService";
import { SmartFurnitureHookupServiceFailoverProxy } from "@infrastructure/SmartFurnitureHookupServiceFailoverProxy";
import { RedisMapService } from "@infrastructure/adapters/RedisMapService";
import { MapServiceFailoverProxy } from "@infrastructure/MapServiceFailoverProxy";
import { KafkaDlqPublisher } from "@infrastructure/messaging/KafkaDlqPublisher";
import { MongoInboxRepository } from "@infrastructure/persistence/mongo/MongoInboxRepository";
import { ReadModelMessageHandler } from "@presentation/event/handlers/ReadModelMessageHandler";
import { KafkaReadModelConsumer } from "@presentation/event/KafkaReadModelConsumer";
import { UserMessageHandler } from "@presentation/event/handlers/UserMessageHandler";
import { KafkaUserConsumer } from "@presentation/event/KafkaUserConsumer";
import { DlqPublisher } from "@infrastructure/messaging/DlqPublisher";
import { retryForever } from "@bootstrap/retryForever";
import { ZoneMessageHandler } from "@presentation/event/handlers/ZoneMessageHandler";
import { KafkaZoneConsumer } from "@presentation/event/KafkaZoneConsumer";
import type { Server as HttpServer } from "node:http";

export interface ComposedApp {
  readonly server: HttpServer;
  readonly consumers: {
    readModelConsumer: KafkaReadModelConsumer;
    userConsumer: KafkaUserConsumer;
    zoneConsumer: KafkaZoneConsumer;
  };
  readonly dlq: KafkaDlqPublisher;
  readonly readModelSynchronizer: ReadModelSynchronizer;
}

export function createApplicationLayer(
  repository: MonitoringRepository,
  smartFurnitureHookupService: SmartFurnitureHookupService,
  householdUserService: HouseholdUserService,
  mapService: MapService,
) {
  return {
    ingestingService: new IngestingServiceImpl(
      repository,
      smartFurnitureHookupService,
      householdUserService,
      mapService,
    ),
    monitoringService: new MonitoringServiceImpl(repository),
    measurementMaintenanceService: new MeasurementMaintenanceServiceImpl(
      repository,
    ),
  };
}

export function createInfrastructureLayer(
  logger: Logger,
  influx: InfluxDBClient,
) {
  const redis = getRedisInstance();
  const readModelStore = new RedisReadModelStore(redis, logger);
  const httpReadModelService = new HttpReadModelService(
    config.userServiceUrl,
    config.hookupServiceUrl,
    config.mapServiceUrl,
  );
  const readModelSynchronizer = new ReadModelSynchronizer(
    readModelStore,
    httpReadModelService,
    logger,
  );
  const healthMonitor = new KafkaHealthMonitor(logger);

  const httpHouseholdUserService = new HTTPHouseholdUserService(
    config.userServiceUrl,
    logger,
  );
  const httpSmartFurnitureHookupService = new HTTPSmartFurnitureHookupService(
    config.hookupServiceUrl,
    logger,
  );
  const httpMapService = new HTTPMapService(config.mapServiceUrl, logger);

  const redisHouseholdUserService = new RedisHouseholdUserService(
    readModelStore,
  );
  const redisSmartFurnitureHookupService = new RedisSmartFurnitureHookupService(
    readModelStore,
    readModelSynchronizer,
    logger,
  );
  const redisMapService = new RedisMapService(readModelStore);

  const householdUserServiceFailoverProxy =
    new HouseholdUserServiceFailoverProxy(
      redisHouseholdUserService,
      httpHouseholdUserService,
      healthMonitor,
    );
  const smartFurnitureHookupServiceFailoverProxy =
    new SmartFurnitureHookupServiceFailoverProxy(
      redisSmartFurnitureHookupService,
      httpSmartFurnitureHookupService,
      healthMonitor,
    );
  const mapServiceFailoverProxy = new MapServiceFailoverProxy(
    redisMapService,
    httpMapService,
    healthMonitor,
  );

  const dlq = new KafkaDlqPublisher(
    config.kafka.brokers,
    config.kafka.clientId,
    config.kafka.topics.dlq,
    logger,
  );

  return {
    repository: new InfluxMonitoringRepository(influx),
    readModelStore: readModelStore,
    readModelSynchronizer: readModelSynchronizer,
    householdUserService: householdUserServiceFailoverProxy,
    mapService: mapServiceFailoverProxy,
    smartFurnitureHookupService: smartFurnitureHookupServiceFailoverProxy,
    dlq: dlq,
    inbox: new MongoInboxRepository(logger),
    healthMonitor: healthMonitor,
  };
}

export function createPresentationLayer(
  ingestingService: IngestingService,
  monitoringService: MonitoringService,
  measurementMaintenanceService: MeasurementMaintenanceService,
  readModelStore: RedisReadModelStore,
  dlq: DlqPublisher,
  inbox: MongoInboxRepository,
  kafkaHealthMonitor: KafkaHealthMonitor,
  logger: Logger,
) {
  const measurementMaintenanceController: MeasurementMaintenanceController =
    new MeasurementMaintenanceController(measurementMaintenanceService);
  const monitoringController: MonitoringController = new MonitoringController(
    monitoringService,
  );
  const ingestingController: IngestingController = new IngestingController(
    ingestingService,
  );

  const socketAuthMiddleware = new SocketAuthMiddleware();

  const activeSmartFurnitureHookupsHandler =
    new ActiveSmartFurnitureHookupsHandler(monitoringService);

  const utilityMetersHandler = new UtilityMetersHandler(monitoringService);
  const utilityConsumptionHandler = new UtilityConsumptionsHandler(
    monitoringService,
  );

  const readModelHandler = new ReadModelMessageHandler(
    readModelStore,
    dlq,
    logger,
  );
  const readModelConsumer = new KafkaReadModelConsumer(
    config.kafka.brokers,
    config.kafka.clientId,
    config.kafka.readModelGroupId,
    {
      userTopic: config.kafka.topics.user,
      hookupTopic: config.kafka.topics.hookup,
      zoneTopic: config.kafka.topics.map,
    },
    readModelHandler,
    kafkaHealthMonitor,
    retryForever,
    logger,
  );

  const userHandler = new UserMessageHandler(
    measurementMaintenanceService,
    inbox,
    dlq,
    logger,
  );

  const userConsumer = new KafkaUserConsumer(
    config.kafka.brokers,
    config.kafka.clientId,
    config.kafka.groupId,
    config.kafka.topics.user,
    userHandler,
    kafkaHealthMonitor,
    retryForever,
    logger,
  );

  const zoneHandler = new ZoneMessageHandler(
    measurementMaintenanceService,
    inbox,
    dlq,
    logger,
  );

  const zoneConsumer = new KafkaZoneConsumer(
    config.kafka.brokers,
    config.kafka.clientId,
    config.kafka.groupId,
    config.kafka.topics.map,
    zoneHandler,
    kafkaHealthMonitor,
    retryForever,
    logger,
  );

  return {
    mainRouter: router(
      ingestingController,
      measurementMaintenanceController,
      monitoringController,
    ),
    namespaces: namespaces(
      activeSmartFurnitureHookupsHandler,
      utilityMetersHandler,
      utilityConsumptionHandler,
      socketAuthMiddleware,
      logger,
    ),
    consumers: {
      readModelConsumer,
      userConsumer,
      zoneConsumer,
    },
  };
}

export async function composeServer(logger: Logger): Promise<ComposedApp> {
  const infra = createInfrastructureLayer(logger, getInfluxDBClientInstance());

  const application = createApplicationLayer(
    infra.repository,
    infra.smartFurnitureHookupService,
    infra.householdUserService,
    infra.mapService,
  );

  const presentation = createPresentationLayer(
    application.ingestingService,
    application.monitoringService,
    application.measurementMaintenanceService,
    infra.readModelStore,
    infra.dlq,
    infra.inbox,
    infra.healthMonitor,
    logger,
  );

  const app = createApp(presentation.mainRouter, logger);
  const server = http.createServer(app);

  const io: Server = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  const socketManager = new SocketsNamespaceManager(io);

  socketManager.registerNamespaces(presentation.namespaces);

  return {
    server: server,
    consumers: presentation.consumers,
    dlq: infra.dlq,
    readModelSynchronizer: infra.readModelSynchronizer,
  };
}
