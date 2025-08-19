import { AxiosInstance } from "axios";
import { BaseAPI } from "./BaseAPI";
import { CBTemplateFieldContentIdMapping } from "@/types";

export class TemplateFieldsAPI extends BaseAPI {
  constructor(apiClient: AxiosInstance) {
    super(apiClient);
  }

  async getTemplateFields() {
     try {
          const response = await this.get<CBTemplateFieldContentIdMapping[]>(
            `/field-content-mappings`
          );
          return response
        } catch (error) {
          this.handleError(error, `get popup template fields`);
        }
  }
}