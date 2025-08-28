import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { DigitalEraService } from './digital-era.service';
import { CreateDigitalEraDto } from './dto/create-digital-era.dto';
import { UpdateDigitalEraDto } from './dto/update-digital-era.dto';
import { ReorderDigitalEraDto } from './dto/reorder-digital-era.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Digital Era Quotes')
@Controller('digital-era')
export class DigitalEraController {
  constructor(private readonly digitalEraService: DigitalEraService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new digital era quote' })
  @ApiResponse({ status: 201, description: 'Quote created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createDigitalEraDto: CreateDigitalEraDto) {
    return this.digitalEraService.create(createDigitalEraDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active digital era quotes (public)' })
  @ApiResponse({ status: 200, description: 'List of active quotes' })
  findAll() {
    return this.digitalEraService.findAll();
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all digital era quotes for admin (including inactive)' })
  @ApiResponse({ status: 200, description: 'List of all quotes' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAllAdmin() {
    return this.digitalEraService.findAllAdmin();
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get digital era quotes statistics' })
  @ApiResponse({ status: 200, description: 'Statistics data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getStats() {
    return this.digitalEraService.getStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a digital era quote by ID' })
  @ApiParam({ name: 'id', description: 'Quote UUID' })
  @ApiResponse({ status: 200, description: 'Quote details' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.digitalEraService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a digital era quote' })
  @ApiParam({ name: 'id', description: 'Quote UUID' })
  @ApiResponse({ status: 200, description: 'Quote updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(@Param('id') id: string, @Body() updateDigitalEraDto: UpdateDigitalEraDto) {
    return this.digitalEraService.update(id, updateDigitalEraDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a digital era quote' })
  @ApiParam({ name: 'id', description: 'Quote UUID' })
  @ApiResponse({ status: 204, description: 'Quote deleted successfully' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.digitalEraService.remove(id);
  }

  @Post('reorder')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reorder digital era quotes' })
  @ApiResponse({ status: 200, description: 'Quotes reordered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  reorder(@Body() reorderDto: ReorderDigitalEraDto) {
    return this.digitalEraService.reorder(reorderDto.ids);
  }
}
