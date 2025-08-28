import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getAllSettings() {
    const settings = await this.prisma.settings.findMany();
    
    // Convert to object format for easier frontend use
    const settingsObject: Record<string, any> = {};
    settings.forEach(setting => {
      settingsObject[setting.category] = setting.data;
    });
    
    return settingsObject;
  }

  async getSettingsByCategory(category: string) {
    const setting = await this.prisma.settings.findUnique({
      where: { category },
    });
    
    return setting ? setting.data : {};
  }

  async updateSetting(category: string, key: string, value: any) {
    // Get current settings for this category
    const currentSetting = await this.prisma.settings.findUnique({
      where: { category },
    });
    
    const currentData = currentSetting ? currentSetting.data as Record<string, any> : {};
    currentData[key] = value;
    
    return await this.prisma.settings.upsert({
      where: { category },
      update: { data: currentData },
      create: { 
        category, 
        data: currentData 
      },
    });
  }

  async updateMultipleSettings(category: string, settings: Record<string, any>) {
    return await this.prisma.settings.upsert({
      where: { category },
      update: { data: settings },
      create: { 
        category, 
        data: settings 
      },
    });
  }

  async deleteSetting(category: string, key: string) {
    const currentSetting = await this.prisma.settings.findUnique({
      where: { category },
    });
    
    if (!currentSetting) {
      throw new Error(`Settings category '${category}' not found`);
    }
    
    const currentData = currentSetting.data as Record<string, any>;
    delete currentData[key];
    
    return await this.prisma.settings.update({
      where: { category },
      data: { data: currentData },
    });
  }

  async getSetting(category: string, key: string, defaultValue: any = null) {
    const setting = await this.prisma.settings.findUnique({
      where: { category },
    });
    
    if (!setting) return defaultValue;
    
    const data = setting.data as Record<string, any>;
    return data[key] !== undefined ? data[key] : defaultValue;
  }
}
