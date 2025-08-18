import { openai } from '@ai-sdk/openai';
import type { TranscriptionModel } from 'ai';
import { type BerrysModel, type BerrysProvider, providers } from '../providers';

type BerrysTranscriptionModel = BerrysModel & {
  providers: (BerrysProvider & {
    model: TranscriptionModel;
  })[];
};

export const transcriptionModels: Record<string, BerrysTranscriptionModel> = {
  'gpt-4o-mini-transcribe': {
    label: 'GPT-4o Mini Transcribe',
    chef: providers.openai,
    providers: [
      {
        ...providers.openai,
        model: openai.transcription('gpt-4o-mini-transcribe'),
      },
    ],
    default: true,
  },
  'whisper-1': {
    label: 'Whisper 1',
    chef: providers.openai,
    providers: [
      {
        ...providers.openai,
        model: openai.transcription('whisper-1'),
      },
    ],
  },
  'gpt-4o-transcribe': {
    label: 'GPT-4o Transcribe',
    chef: providers.openai,
    providers: [
      {
        ...providers.openai,
        model: openai.transcription('gpt-4o-transcribe'),
      },
    ],
  },
};
