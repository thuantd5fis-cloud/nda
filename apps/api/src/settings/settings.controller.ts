import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto, UpdateSingleSettingDto } from './dto/update-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Settings')
@Controller('settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all settings' })
  @ApiResponse({ status: 200, description: 'Settings retrieved successfully' })
  async getAllSettings() {
    return await this.settingsService.getAllSettings();
  }

  @Get(':category')
  @ApiOperation({ summary: 'Get settings by category' })
  @ApiResponse({ status: 200, description: 'Settings retrieved successfully' })
  async getSettingsByCategory(@Param('category') category: string) {
    return await this.settingsService.getSettingsByCategory(category);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Update multiple settings' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  async updateMultipleSettings(@Body() updateSettingsDto: UpdateSettingsDto) {
    return await this.settingsService.updateMultipleSettings(
      updateSettingsDto.category,
      updateSettingsDto.settings
    );
  }

  @Post('single')
  @ApiOperation({ summary: 'Update single setting' })
  @ApiResponse({ status: 200, description: 'Setting updated successfully' })
  async updateSingleSetting(@Body() updateSingleSettingDto: UpdateSingleSettingDto) {
    return await this.settingsService.updateSetting(
      updateSingleSettingDto.category,
      updateSingleSettingDto.key,
      updateSingleSettingDto.value
    );
  }

  @Get(':category/:key')
  @ApiOperation({ summary: 'Get single setting value' })
  @ApiResponse({ status: 200, description: 'Setting retrieved successfully' })
  async getSingleSetting(
    @Param('category') category: string,
    @Param('key') key: string
  ) {
    return await this.settingsService.getSetting(category, key);
  }

  @Delete(':category/:key')
  @ApiOperation({ summary: 'Delete setting' })
  @ApiResponse({ status: 200, description: 'Setting deleted successfully' })
  async deleteSetting(
    @Param('category') category: string,
    @Param('key') key: string
  ) {
    return await this.settingsService.deleteSetting(category, key);
  }
}
