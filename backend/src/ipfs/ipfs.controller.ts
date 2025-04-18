import { Controller, Get } from "@nestjs/common";
import { IPFSService } from "./ipfs.service.js";

@Controller("ipfs")
export class IPFSController {
  constructor(private readonly ipfsService: IPFSService) {}

  @Get()
  async getAddr() {
    return await this.ipfsService.getAddr();
  }
}
