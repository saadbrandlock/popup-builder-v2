import { AxiosInstance } from "axios";
import { BaseAPI } from "./BaseAPI";
import { Device } from "@/types";

export class DevicesAPI extends BaseAPI {
  private readonly BASE_ENDPOINT = '/template-builder/devices';

  constructor(apiClient: AxiosInstance) {
    super(apiClient);
  }

  async getDevices(): Promise<Device[]> {
    return this.get<Device[]>(this.BASE_ENDPOINT);
  }
}