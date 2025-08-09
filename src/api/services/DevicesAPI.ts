import { AxiosInstance } from "axios";
import { BaseAPI } from "./BaseAPI";
import { Device } from "@/types";

export class DevicesAPI extends BaseAPI {
  constructor(apiClient: AxiosInstance) {
    super(apiClient);
  }

  async getDevices(): Promise<Device[]> {
    return await this.get<Device[]>(`/devices`);
  }
}