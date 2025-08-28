import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { RegisterEventDto } from './dto/register-event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(createEventDto: CreateEventDto, userId: string) {
    const event = await this.prisma.event.create({
      data: {
        ...createEventDto,
        startDate: new Date(createEventDto.startDate),
        endDate: createEventDto.endDate ? new Date(createEventDto.endDate) : null,
        registrationDeadline: createEventDto.registrationDeadline 
          ? new Date(createEventDto.registrationDeadline) 
          : null,
        createdBy: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    return event;
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    tags?: string;
    location?: string;
  }) {
    const { page = 1, limit = 10, status, search, tags, location } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { organizer: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tags) {
      where.tags = {
        hasSome: tags.split(','),
      };
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take: limit,
        include: {
          creator: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          _count: {
            select: {
              registrations: true,
            },
          },
        },
        orderBy: {
          startDate: 'desc',
        },
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      data: events,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
        registrations: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            registeredAt: 'desc',
          },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    const existingEvent = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      throw new NotFoundException('Event not found');
    }

    const updateData: any = { ...updateEventDto };

    if ((updateEventDto as any).startDate) {
      updateData.startDate = new Date((updateEventDto as any).startDate);
    }

    if ((updateEventDto as any).endDate) {
      updateData.endDate = new Date((updateEventDto as any).endDate);
    }

    if ((updateEventDto as any).registrationDeadline) {
      updateData.registrationDeadline = new Date((updateEventDto as any).registrationDeadline);
    }

    const event = await this.prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    return event;
  }

  async remove(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event._count.registrations > 0) {
      throw new BadRequestException('Cannot delete event with registrations');
    }

    await this.prisma.event.delete({
      where: { id },
    });

    return { message: 'Event deleted successfully' };
  }

  async register(eventId: string, userId: string, registerDto: RegisterEventDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (!event.requiresRegistration) {
      throw new BadRequestException('This event does not require registration');
    }

    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      throw new BadRequestException('Registration deadline has passed');
    }

    if (event.maxAttendees && event._count.registrations >= event.maxAttendees) {
      throw new BadRequestException('Event is full');
    }

    // Check if user is already registered
    const existingRegistration = await this.prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (existingRegistration) {
      throw new BadRequestException('User is already registered for this event');
    }

    const registration = await this.prisma.eventRegistration.create({
      data: {
        eventId,
        userId,
        ...registerDto,
      },
      include: {
        event: {
          select: {
            title: true,
            startDate: true,
          },
        },
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    // Update attendees count
    await this.prisma.event.update({
      where: { id: eventId },
      data: {
        attendeesCount: {
          increment: 1,
        },
      },
    });

    return registration;
  }

  async unregister(eventId: string, userId: string) {
    const registration = await this.prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    await this.prisma.eventRegistration.delete({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    // Update attendees count
    await this.prisma.event.update({
      where: { id: eventId },
      data: {
        attendeesCount: {
          decrement: 1,
        },
      },
    });

    return { message: 'Successfully unregistered from event' };
  }

  async getRegistrations(eventId: string, query: {
    page?: number;
    limit?: number;
    paymentStatus?: string;
  }) {
    const { page = 1, limit = 10, paymentStatus } = query;
    const skip = (page - 1) * limit;

    const where: any = { eventId };

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    const [registrations, total] = await Promise.all([
      this.prisma.eventRegistration.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          registeredAt: 'desc',
        },
      }),
      this.prisma.eventRegistration.count({ where }),
    ]);

    return {
      registrations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updatePaymentStatus(registrationId: string, paymentStatus: string) {
    const registration = await this.prisma.eventRegistration.findUnique({
      where: { id: registrationId },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    const updatedRegistration = await this.prisma.eventRegistration.update({
      where: { id: registrationId },
      data: { paymentStatus: paymentStatus as any },
      include: {
        event: {
          select: {
            title: true,
          },
        },
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    return updatedRegistration;
  }

  async getStats() {
    const [totalEvents, upcomingEvents, ongoingEvents, completedEvents, totalRegistrations] = await Promise.all([
      this.prisma.event.count(),
      this.prisma.event.count({ where: { status: 'UPCOMING' } }),
      this.prisma.event.count({ where: { status: 'ONGOING' } }),
      this.prisma.event.count({ where: { status: 'COMPLETED' } }),
      this.prisma.eventRegistration.count(),
    ]);

    return {
      totalEvents,
      upcomingEvents,
      ongoingEvents,
      completedEvents,
      totalRegistrations,
    };
  }
}
