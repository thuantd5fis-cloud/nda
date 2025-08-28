import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { RegisterEventDto } from './dto/register-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(@Body() createEventDto: CreateEventDto, @Request() req: any) {
    return this.eventsService.create(createEventDto, req.user.id);
  }

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('tags') tags?: string,
    @Query('location') location?: string,
  ) {
    return this.eventsService.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status,
      search,
      tags,
      location,
    });
  }

  @Get('stats')
  getStats() {
    return this.eventsService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  @Post(':id/register')
  register(
    @Param('id') eventId: string,
    @Body() registerDto: RegisterEventDto,
    @Request() req: any,
  ) {
    return this.eventsService.register(eventId, req.user.id, registerDto);
  }

  @Delete(':id/register')
  unregister(@Param('id') eventId: string, @Request() req: any) {
    return this.eventsService.unregister(eventId, req.user.id);
  }

  @Get(':id/registrations')
  getRegistrations(
    @Param('id') eventId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('paymentStatus') paymentStatus?: string,
  ) {
    return this.eventsService.getRegistrations(eventId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      paymentStatus,
    });
  }

  @Patch('registrations/:id/payment')
  updatePaymentStatus(
    @Param('id') registrationId: string,
    @Body('paymentStatus') paymentStatus: string,
  ) {
    return this.eventsService.updatePaymentStatus(registrationId, paymentStatus);
  }
}
