import { getDB } from './db';
import { Lecture } from '../types';

export const lectureRepository = {
  async getAll(): Promise<Lecture[]> {
    const db = await getDB();
    const lectures = await db.getAllFromIndex('lectures', 'by-created');
    // return reverse chronological (newest first)
    return lectures.reverse();
  },

  async getById(id: string): Promise<Lecture | undefined> {
    const db = await getDB();
    return db.get('lectures', id);
  },

  async save(lecture: Lecture): Promise<void> {
    const db = await getDB();
    await db.put('lectures', lecture);
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('lectures', id);
  },

  async updateProgress(
    lectureId: string,
    updates: Partial<Pick<Lecture, 'flashcards' | 'quiz' | 'groundedQA' | 'summary' | 'topics'>>
  ): Promise<void> {
    const db = await getDB();
    const existing = await db.get('lectures', lectureId);
    if (existing) {
      const updated: Lecture = {
        ...existing,
        ...updates,
      };
      await db.put('lectures', updated);
    }
  },
};
