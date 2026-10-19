// Legacy re-export for backward compatibility
// New code should import from '@/lib/questions' (the questions/ directory)
export type {
  Question,
  KesiapanSection,
  KesiapanQuestion,
  KepribadianQuestion,
  KepribadianSection
} from "./questions/types";
export { AKADEMIK_MTS } from "./questions/akademik-mts";
export { AKADEMIK_IL, AKADEMIK_MA } from "./questions/akademik-il-ma";
export { KEPRIBADIAN_QUESTIONS, KEPRIBADIAN_SECTIONS } from "./questions/kepribadian";
export { KESIAPAN_QUESTIONS } from "./questions/kesiapan";
