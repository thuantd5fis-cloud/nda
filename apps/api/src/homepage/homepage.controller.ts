import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HomepageService } from './homepage.service';

@ApiTags('Landing Page API')
@Controller('homepage')
export class HomepageController {
  constructor(private readonly homepageService: HomepageService) {}

  @Get()
  @ApiOperation({ summary: 'Public landing homepage data' })
  @ApiResponse({ status: 200, description: 'Composed homepage content' })
  async getHomepage() {
    return this.homepageService.getHomepageData();
  }


}


