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
} from '@nestjs/common';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { CreateMentoringDto } from './dto/create-mentoring.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('members')
@UseGuards(JwtAuthGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  create(@Body() createMemberDto: CreateMemberDto) {
    return this.membersService.create(createMemberDto);
  }

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('expertise') expertise?: string,
    @Query('isExpert') isExpert?: string,
    @Query('isActive') isActive?: string,
    @Query('location') location?: string,
  ) {
    return this.membersService.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      expertise,
      isExpert: isExpert === 'true' ? true : isExpert === 'false' ? false : undefined,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      location,
    });
  }

  @Get('stats')
  getStats() {
    return this.membersService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.membersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto) {
    return this.membersService.update(id, updateMemberDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.membersService.remove(id);
  }

  @Post(':id/mentoring')
  createMentoringSession(
    @Param('id') memberId: string,
    @Body() createMentoringDto: CreateMentoringDto,
  ) {
    return this.membersService.createMentoringSession(memberId, createMentoringDto);
  }

  @Get(':id/mentoring')
  getMentoringHistory(
    @Param('id') memberId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.membersService.getMentoringHistory(memberId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status,
    });
  }

  @Patch('mentoring/:id/status')
  updateMentoringStatus(
    @Param('id') sessionId: string,
    @Body('status') status: string,
  ) {
    return this.membersService.updateMentoringStatus(sessionId, status);
  }

  @Post(':id/sync-crm')
  syncWithCRM(@Param('id') memberId: string, @Body() crmData: any) {
    return this.membersService.syncWithCRM(memberId, crmData);
  }
}
