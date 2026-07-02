import { model, Schema, Types } from 'mongoose';

export interface IAssignmentSubmission {
  assignment: Types.ObjectId;
  student: Types.ObjectId;
  content?: string;
  fileUrl?: string;
  answers?: {
    question: Types.ObjectId;
    selectedOptionIndexes: number[];
  }[];
  quizScore?: number;
  quizTotalPoints?: number;
  score?: number;
  totalPoints?: number;
  passed: boolean;
  submittedAt: Date;
  gradedAt?: Date;
}

const assignmentSubmissionSchema = new Schema<IAssignmentSubmission>(
  {
    assignment: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, trim: true },
    fileUrl: { type: String, trim: true },
    answers: {
      type: [
        {
          question: { type: Schema.Types.ObjectId, required: true },
          selectedOptionIndexes: { type: [Number], default: [] }
        }
      ],
      default: []
    },
    quizScore: { type: Number, min: 0 },
    quizTotalPoints: { type: Number, min: 0 },
    score: { type: Number, min: 0 },
    totalPoints: { type: Number, min: 0 },
    passed: { type: Boolean, default: false },
    submittedAt: { type: Date, default: Date.now },
    gradedAt: { type: Date }
  },
  { timestamps: true, versionKey: false }
);

assignmentSubmissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

export const AssignmentSubmission = model<IAssignmentSubmission>(
  'AssignmentSubmission',
  assignmentSubmissionSchema
);
