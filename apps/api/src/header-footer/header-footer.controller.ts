import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HeaderFooterService } from './header-footer.service';

@ApiTags('Landing Page API')
@Controller('header-footer')
export class HeaderFooterController {
  constructor(private readonly headerFooterService: HeaderFooterService) {}

  @Get()
  @ApiOperation({ summary: 'Get header and footer configuration for landing page (Public)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Header and footer configuration data',
    schema: {
      type: 'object',
      properties: {
        header: {
          type: 'object',
          properties: {
            logo: { type: 'string' },
            logoFileId: { type: 'string' },
            menu: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string' },
                  url: { type: 'string' },
                  children: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        label: { type: 'string' },
                        url: { type: 'string' }
                      }
                    }
                  }
                }
              }
            },
            languages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  code: { type: 'string' },
                  label: { type: 'string' },
                  flag: { type: 'string' },
                  flagFileId: { type: 'string' }
                }
              }
            }
          }
        },
        footer: {
          type: 'object',
          properties: {
            logo: { type: 'string' },
            logoFileId: { type: 'string' },
            address: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string' },
            social: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  icon: { type: 'string' },
                  url: { type: 'string' }
                }
              }
            },
            legal: { type: 'string' }
          }
        }
      }
    }
  })
  async getHeaderFooterConfig() {
    return this.headerFooterService.getHeaderFooterConfig();
  }
}
