import { Controller, Get, Post, Body } from '@nestjs/common';

@Controller('test')
export class TestController {
  @Get()
  test() {
    return { 
      message: 'Test API is working!', 
      timestamp: new Date().toISOString(),
      status: 'success'
    };
  }

  @Post('categories')
  testCreateCategory(@Body() data: any) {
    console.log('Test create category data:', data);
    return {
      message: 'Test create category received',
      data,
      timestamp: new Date().toISOString(),
      status: 'success'
    };
  }
}


