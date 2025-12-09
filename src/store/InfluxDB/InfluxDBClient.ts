import {
  InfluxDB,
  Point,
  QueryApi,
  WriteApi,
} from "@influxdata/influxdb-client";
import { DeleteAPI } from "@influxdata/influxdb-client-apis";
import { influxDBClient } from "@interfaces/dependencies";
import { MeasurementTag } from "./MeasurementTag";

export class InfluxDBClient {
  private readonly influxDB: InfluxDB;
  private readonly bucket: string;
  private readonly org: string;

  constructor(url: string, token: string, org: string, bucket: string) {
    this.bucket = bucket;
    this.org = org;
    this.influxDB = new InfluxDB({ url, token });
  }

  getWriteApi(): WriteApi {
    return this.influxDB.getWriteApi(this.org, this.bucket, "ms", {
      flushInterval: 1000,
    });
  }

  getQueryApi(): QueryApi {
    return this.influxDB.getQueryApi(this.org);
  }

  getDeleteApi() {
    return new DeleteAPI(influxDBClient.getInfluxDB());
  }

  async writePoint(point: Point): Promise<void> {
    const writeApi = this.getWriteApi();

    writeApi.writePoint(point);
    await writeApi.close();
  }

  async queryAsync<T = unknown>(fluxQuery: string): Promise<T[]> {
    const queryApi = this.getQueryApi();

    try {
      return queryApi.collectRows<T>(fluxQuery);
    } catch (error) {
      throw new Error(
        `Query failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async deleteAsync(tag: MeasurementTag, value: string): Promise<void> {
    try {
      return this.getDeleteApi().postDelete({
        org: this.org,
        bucket: this.bucket,
        body: {
          start: "1970-01-01T00:00:00Z",
          stop: new Date().toISOString(),
          predicate: `${tag}="${value}"`,
        },
      });
    } catch (error) {
      throw new Error(
        `Query failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  getInfluxDB(): InfluxDB {
    return this.influxDB;
  }

  getBucket(): string {
    return this.bucket;
  }

  async checkConnection(): Promise<boolean> {
    try {
      const queryApi = this.getQueryApi();
      await queryApi.collectRows("buckets() |> limit(n: 0)");
      return true;
    } catch (error) {
      console.error("InfluxDB connection failed:", error);
      return false;
    }
  }
}
