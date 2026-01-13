import { Module } from '@nestjs/common';
import { AnswersController } from './answers.controller';
import { QuestionsModule } from '../questions/questions.module';

@Module({
  imports: [QuestionsModule],
  controllers: [AnswersController],
})
export class AnswersModule {}
