CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE "Manifest" (
  "id" UUID NOT NULL, "sourceFileName" TEXT NOT NULL, "sourceSha256" VARCHAR(64) NOT NULL,
  "sourceImportedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, "externalReference" TEXT,
  "status" TEXT NOT NULL DEFAULT 'IMPORTED', "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL, CONSTRAINT "Manifest_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Manifest_sourceSha256_idx" ON "Manifest" ("sourceSha256");

CREATE TABLE "TransportDocument" (
  "id" UUID NOT NULL, "manifestId" UUID NOT NULL, "documentNo" TEXT NOT NULL, "documentType" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "TransportDocument_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "TransportDocument_manifest_fkey" FOREIGN KEY ("manifestId") REFERENCES "Manifest"("id") ON DELETE RESTRICT,
  CONSTRAINT "TransportDocument_manifest_document_key" UNIQUE ("manifestId","documentType","documentNo")
);
CREATE INDEX "TransportDocument_documentNo_idx" ON "TransportDocument" ("documentNo");

CREATE TABLE "MasterAwb" (
  "id" UUID NOT NULL, "transportDocumentId" UUID NOT NULL, "awbNumber" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "MasterAwb_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MasterAwb_transportDocument_key" UNIQUE ("transportDocumentId"),
  CONSTRAINT "MasterAwb_awbNumber_key" UNIQUE ("awbNumber"),
  CONSTRAINT "MasterAwb_transportDocument_fkey" FOREIGN KEY ("transportDocumentId") REFERENCES "TransportDocument"("id") ON DELETE RESTRICT
);

CREATE TABLE "Person" (
  "id" UUID NOT NULL, "displayName" TEXT NOT NULL, "identityRef" TEXT,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Person_identityRef_idx" ON "Person" ("identityRef");

CREATE TABLE "Address" (
  "id" UUID NOT NULL, "originalText" TEXT NOT NULL, "normalizedText" TEXT,
  "validationStatus" TEXT NOT NULL DEFAULT 'UNVALIDATED', "countryCode" TEXT, "locality" TEXT,
  "province" TEXT, "postalCode" TEXT, "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL, CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Geolocation" (
  "id" UUID NOT NULL, "addressId" UUID NOT NULL, "provider" TEXT NOT NULL, "providerRef" TEXT,
  "latitude" DECIMAL(9,6) NOT NULL, "longitude" DECIMAL(9,6) NOT NULL, "confidence" DECIMAL(5,4),
  "resolvedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, "location" geography(Point,4326),
  CONSTRAINT "Geolocation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Geolocation_address_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT,
  CONSTRAINT "Geolocation_confidence_ck" CHECK ("confidence" IS NULL OR "confidence" BETWEEN 0 AND 1),
  CONSTRAINT "Geolocation_latitude_ck" CHECK ("latitude" BETWEEN -90 AND 90),
  CONSTRAINT "Geolocation_longitude_ck" CHECK ("longitude" BETWEEN -180 AND 180)
);
CREATE INDEX "Geolocation_address_resolved_idx" ON "Geolocation" ("addressId","resolvedAt");
CREATE INDEX "Geolocation_location_gist_idx" ON "Geolocation" USING GIST ("location");

CREATE TABLE "House" (
  "id" UUID NOT NULL, "manifestId" UUID NOT NULL, "masterAwbId" UUID NOT NULL, "houseNumber" TEXT NOT NULL,
  "senderPersonId" UUID, "recipientPersonId" UUID, "deliveryAddressId" UUID, "status" TEXT NOT NULL DEFAULT 'RECEIVED',
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "House_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "House_manifest_fkey" FOREIGN KEY ("manifestId") REFERENCES "Manifest"("id") ON DELETE RESTRICT,
  CONSTRAINT "House_masterAwb_fkey" FOREIGN KEY ("masterAwbId") REFERENCES "MasterAwb"("id") ON DELETE RESTRICT,
  CONSTRAINT "House_sender_fkey" FOREIGN KEY ("senderPersonId") REFERENCES "Person"("id") ON DELETE RESTRICT,
  CONSTRAINT "House_recipient_fkey" FOREIGN KEY ("recipientPersonId") REFERENCES "Person"("id") ON DELETE RESTRICT,
  CONSTRAINT "House_address_fkey" FOREIGN KEY ("deliveryAddressId") REFERENCES "Address"("id") ON DELETE RESTRICT,
  CONSTRAINT "House_manifest_house_key" UNIQUE ("manifestId","houseNumber")
);
CREATE INDEX "House_masterAwb_idx" ON "House" ("masterAwbId");
CREATE INDEX "House_deliveryAddress_idx" ON "House" ("deliveryAddressId");
CREATE INDEX "House_manifest_status_idx" ON "House" ("manifestId","status");

CREATE TABLE "PhysicalUnit" (
  "id" UUID NOT NULL, "houseId" UUID NOT NULL, "sequenceNo" INTEGER NOT NULL, "packageRef" TEXT,
  "declaredWeightKg" DECIMAL(10,3), "receivedWeightKg" DECIMAL(10,3), "status" TEXT NOT NULL DEFAULT 'MANIFESTED',
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "PhysicalUnit_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PhysicalUnit_house_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE RESTRICT,
  CONSTRAINT "PhysicalUnit_house_sequence_key" UNIQUE ("houseId","sequenceNo")
);
CREATE INDEX "PhysicalUnit_packageRef_idx" ON "PhysicalUnit" ("packageRef");

CREATE TABLE "StorageLocation" (
  "id" UUID NOT NULL, "code" TEXT NOT NULL, "description" TEXT, "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "StorageLocation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "StorageLocation_code_key" UNIQUE ("code")
);

CREATE TABLE "StorageMovement" (
  "id" UUID NOT NULL, "physicalUnitId" UUID NOT NULL, "fromLocationId" UUID, "toLocationId" UUID,
  "movementReason" TEXT NOT NULL, "referenceNo" TEXT, "occurredAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "actorSubject" TEXT, CONSTRAINT "StorageMovement_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "StorageMovement_from_fkey" FOREIGN KEY ("fromLocationId") REFERENCES "StorageLocation"("id") ON DELETE RESTRICT,
  CONSTRAINT "StorageMovement_to_fkey" FOREIGN KEY ("toLocationId") REFERENCES "StorageLocation"("id") ON DELETE RESTRICT
);
CREATE INDEX "StorageMovement_unit_time_idx" ON "StorageMovement" ("physicalUnitId","occurredAt");

CREATE TABLE "CustomsAction" (
  "id" UUID NOT NULL, "houseId" UUID, "actionType" TEXT NOT NULL, "authorityRef" TEXT, "result" TEXT,
  "evidenceRef" TEXT, "occurredAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, "actorSubject" TEXT,
  CONSTRAINT "CustomsAction_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CustomsAction_house_time_idx" ON "CustomsAction" ("houseId","occurredAt");
CREATE INDEX "CustomsAction_action_time_idx" ON "CustomsAction" ("actionType","occurredAt");

CREATE TABLE "AbandonmentRecord" (
  "id" UUID NOT NULL, "houseId" UUID NOT NULL, "legalType" TEXT NOT NULL, "authorityRef" TEXT NOT NULL,
  "resolutionRef" TEXT, "cause" TEXT, "occurredAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "evidenceRef" TEXT, CONSTRAINT "AbandonmentRecord_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AbandonmentRecord_house_time_idx" ON "AbandonmentRecord" ("houseId","occurredAt");

CREATE TABLE "Incident" (
  "id" UUID NOT NULL, "houseId" UUID, "physicalUnitId" UUID, "incidentType" TEXT NOT NULL,
  "description" TEXT, "resolution" TEXT, "evidenceRef" TEXT, "occurredAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "actorSubject" TEXT, CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Incident_house_time_idx" ON "Incident" ("houseId","occurredAt");
CREATE INDEX "Incident_unit_time_idx" ON "Incident" ("physicalUnitId","occurredAt");

CREATE TABLE "Route" (
  "id" UUID NOT NULL, "routeDate" DATE NOT NULL, "origin" TEXT NOT NULL, "destination" TEXT NOT NULL,
  "vehicleRef" TEXT, "driverRef" TEXT, "status" TEXT NOT NULL DEFAULT 'PLANNED',
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RouteStop" (
  "id" UUID NOT NULL, "routeId" UUID NOT NULL, "sequenceNo" INTEGER NOT NULL, "addressId" UUID,
  "latitude" DECIMAL(9,6), "longitude" DECIMAL(9,6), "arrivedAt" TIMESTAMPTZ(6),
  CONSTRAINT "RouteStop_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "RouteStop_route_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE,
  CONSTRAINT "RouteStop_route_sequence_key" UNIQUE ("routeId","sequenceNo")
);
CREATE INDEX "RouteStop_address_idx" ON "RouteStop" ("addressId");

CREATE TABLE "Delivery" (
  "id" UUID NOT NULL, "routeId" UUID, "status" TEXT NOT NULL DEFAULT 'PLANNED',
  "scheduledAt" TIMESTAMPTZ(6), "completedAt" TIMESTAMPTZ(6), "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Delivery_route_status_idx" ON "Delivery" ("routeId","status");

CREATE TABLE "DeliveryHouse" (
  "deliveryId" UUID NOT NULL, "houseId" UUID NOT NULL, "attachedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DeliveryHouse_pkey" PRIMARY KEY ("deliveryId","houseId"),
  CONSTRAINT "DeliveryHouse_delivery_fkey" FOREIGN KEY ("deliveryId") REFERENCES "Delivery"("id") ON DELETE CASCADE,
  CONSTRAINT "DeliveryHouse_house_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE RESTRICT
);
CREATE INDEX "DeliveryHouse_house_idx" ON "DeliveryHouse" ("houseId");

CREATE TABLE "DeliveryAttempt" (
  "id" UUID NOT NULL, "deliveryId" UUID NOT NULL, "attemptNo" INTEGER NOT NULL, "result" TEXT NOT NULL,
  "reason" TEXT, "occurredAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, "actorSubject" TEXT,
  CONSTRAINT "DeliveryAttempt_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "DeliveryAttempt_delivery_fkey" FOREIGN KEY ("deliveryId") REFERENCES "Delivery"("id") ON DELETE CASCADE,
  CONSTRAINT "DeliveryAttempt_delivery_attempt_key" UNIQUE ("deliveryId","attemptNo")
);

CREATE TABLE "AuditRecord" (
  "id" UUID NOT NULL, "actorSubject" TEXT, "action" TEXT NOT NULL, "resourceType" TEXT NOT NULL,
  "resourceId" TEXT NOT NULL, "outcome" TEXT NOT NULL, "reason" TEXT,
  "occurredAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, "metadataJson" JSONB,
  CONSTRAINT "AuditRecord_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AuditRecord_resource_time_idx" ON "AuditRecord" ("resourceType","resourceId","occurredAt");
CREATE INDEX "AuditRecord_actor_time_idx" ON "AuditRecord" ("actorSubject","occurredAt");
