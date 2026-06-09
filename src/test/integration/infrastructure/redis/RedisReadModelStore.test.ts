import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { GenericContainer, StartedTestContainer } from "testcontainers";
import { Redis } from "ioredis";
import { RedisReadModelStore } from "@infrastructure/persistence/redis/RedisReadModelStore";

const ZONE_INDEX_KEY = (zoneId: string) =>
  `monitoring:readmodel:zone:${zoneId}`;

describe("RedisReadModelStore — integration", () => {
  let container: StartedTestContainer;
  let redis: Redis;
  let store: RedisReadModelStore;

  beforeAll(async () => {
    container = await new GenericContainer("redis:7")
      .withExposedPorts(6379)
      .start();

    redis = new Redis({
      host: container.getHost(),
      port: container.getMappedPort(6379),
    });

    store = new RedisReadModelStore(redis);
  }, 60_000);

  afterAll(async () => {
    await redis.quit();
    await container.stop();
  });

  afterEach(async () => {
    await redis.flushall();
  });

  describe("manage users", () => {
    it("stores a user and retrieves its id by username", async () => {
      await store.setUser({ id: "user-1", username: "john.doe" });

      const id = await store.getUserIdByUsername("john.doe");

      expect(id).toBe("user-1");
    });

    it("returns null for a username that was never stored", async () => {
      const id = await store.getUserIdByUsername("ghost");

      expect(id).toBeNull();
    });

    it("deletes a user so it is no longer retrievable", async () => {
      await store.setUser({ id: "user-1", username: "john.doe" });

      await store.deleteUser("john.doe");

      const id = await store.getUserIdByUsername("john.doe");
      expect(id).toBeNull();
    });

    it("overwriting a user updates the stored id", async () => {
      await store.setUser({ id: "user-1", username: "john.doe" });
      await store.setUser({ id: "user-2", username: "john.doe" });

      const id = await store.getUserIdByUsername("john.doe");

      expect(id).toBe("user-2");
    });
  });

  describe("manage hookups", () => {
    it("stores a hookup and retrieves it by id", async () => {
      await store.setSmartFurnitureHookup({
        id: "hookup-1",
        utilityType: "ELECTRICITY",
      });

      const hookup = await store.getSmartFurnitureHookupById("hookup-1");

      expect(hookup).toEqual({ id: "hookup-1", utilityType: "ELECTRICITY" });
    });

    it("returns null for an unknown hookup id", async () => {
      const hookup = await store.getSmartFurnitureHookupById("ghost");

      expect(hookup).toBeNull();
    });

    it("deletes a hookup so it is no longer retrievable", async () => {
      await store.setSmartFurnitureHookup({
        id: "hookup-1",
        utilityType: "ELECTRICITY",
      });

      await store.deleteSmartFurnitureHookup("hookup-1");

      expect(await store.getSmartFurnitureHookupById("hookup-1")).toBeNull();
    });

    it("deletes a hookup and removes it from the zone index", async () => {
      await store.setSmartFurnitureHookup({
        id: "hookup-1",
        utilityType: "ELECTRICITY",
      });
      await store.setSmartFurnitureHookupZone({
        hookupId: "hookup-1",
        zoneId: "zone-1",
      });

      await store.deleteSmartFurnitureHookup("hookup-1");

      const members = await redis.smembers(ZONE_INDEX_KEY("zone-1"));
      expect(members).not.toContain("hookup-1");
    });

    it("deletes a hookup and removes its zone association", async () => {
      await store.setSmartFurnitureHookup({
        id: "hookup-1",
        utilityType: "ELECTRICITY",
      });
      await store.setSmartFurnitureHookupZone({
        hookupId: "hookup-1",
        zoneId: "zone-1",
      });

      await store.deleteSmartFurnitureHookup("hookup-1");

      expect(
        await store.getSmartFurnitureHookupZoneByHookupId("hookup-1"),
      ).toBeNull();
    });
  });

  describe("manage zones", () => {
    it("stores a hookup zone association and adds it to the zone index", async () => {
      await store.setSmartFurnitureHookupZone({
        hookupId: "hookup-1",
        zoneId: "zone-1",
      });

      const zone =
        await store.getSmartFurnitureHookupZoneByHookupId("hookup-1");
      expect(zone).toEqual({ hookupId: "hookup-1", zoneId: "zone-1" });

      const members = await redis.smembers(ZONE_INDEX_KEY("zone-1"));
      expect(members).toContain("hookup-1");
    });

    it("moving a hookup to another zone updates both zone indexes", async () => {
      await store.setSmartFurnitureHookupZone({
        hookupId: "hookup-1",
        zoneId: "zone-1",
      });

      await store.setSmartFurnitureHookupZone({
        hookupId: "hookup-1",
        zoneId: "zone-2",
      });

      expect(await redis.smembers(ZONE_INDEX_KEY("zone-1"))).not.toContain(
        "hookup-1",
      );
      expect(await redis.smembers(ZONE_INDEX_KEY("zone-2"))).toContain(
        "hookup-1",
      );
    });

    it("setting zoneId to null removes hookup from zone index", async () => {
      await store.setSmartFurnitureHookupZone({
        hookupId: "hookup-1",
        zoneId: "zone-1",
      });

      await store.updateSmartFurnitureHookupZone("hookup-1", null);

      expect(await redis.smembers(ZONE_INDEX_KEY("zone-1"))).not.toContain(
        "hookup-1",
      );
    });

    it("deleting a zone clears the zone index", async () => {
      await store.setSmartFurnitureHookupZone({
        hookupId: "hookup-1",
        zoneId: "zone-1",
      });
      await store.setSmartFurnitureHookupZone({
        hookupId: "hookup-2",
        zoneId: "zone-1",
      });

      await store.deleteZone("zone-1");

      expect(await redis.smembers(ZONE_INDEX_KEY("zone-1"))).toHaveLength(0);
    });

    it("deleting a zone removes the zone association from all affected hookups", async () => {
      await store.setSmartFurnitureHookupZone({
        hookupId: "hookup-1",
        zoneId: "zone-1",
      });
      await store.setSmartFurnitureHookupZone({
        hookupId: "hookup-2",
        zoneId: "zone-1",
      });

      await store.deleteZone("zone-1");

      expect(
        await store.getSmartFurnitureHookupZoneByHookupId("hookup-1"),
      ).toBeNull();
      expect(
        await store.getSmartFurnitureHookupZoneByHookupId("hookup-2"),
      ).toBeNull();
    });
  });
});
