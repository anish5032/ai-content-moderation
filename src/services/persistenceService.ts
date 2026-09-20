import { getSupabaseClient } from '../lib/supabase';
import type { Database } from '../lib/supabase.types';

type Tables = Database['public']['Tables'];
type VideoInsert = Tables['videos']['Insert'];
type ModerationResultInsert = Tables['moderation_results']['Insert'];
type ModerationEventInsert = Tables['moderation_events']['Insert'];
type ReviewTaskInsert = Tables['review_tasks']['Insert'];
type ModelVersionInsert = Tables['model_versions']['Insert'];

function requireData<T>(data: T | null, error: { message: string } | null): T {
  if (error) throw new Error(error.message);
  if (data === null) throw new Error('Supabase returned no record.');
  return data;
}

export const persistenceService = {
  async listVideos() {
    const { data, error } = await getSupabaseClient().from('videos').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  },

  async createVideo(record: VideoInsert) {
    const { data, error } = await getSupabaseClient().from('videos').insert(record).select().single();
    return requireData(data, error);
  },

  async createModerationResult(record: ModerationResultInsert) {
    const { data, error } = await getSupabaseClient().from('moderation_results').insert(record).select().single();
    return requireData(data, error);
  },

  async createModerationEvent(record: ModerationEventInsert) {
    const { data, error } = await getSupabaseClient().from('moderation_events').insert(record).select().single();
    return requireData(data, error);
  },

  async listReviewTasks() {
    const { data, error } = await getSupabaseClient().from('review_tasks').select('*').order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    return data;
  },

  async createReviewTask(record: ReviewTaskInsert) {
    const { data, error } = await getSupabaseClient().from('review_tasks').insert(record).select().single();
    return requireData(data, error);
  },

  async updateReviewTask(id: string, update: Tables['review_tasks']['Update']) {
    const { data, error } = await getSupabaseClient().from('review_tasks').update(update).eq('id', id).select().single();
    return requireData(data, error);
  },

  async listModelVersions() {
    const { data, error } = await getSupabaseClient().from('model_versions').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  },

  async createModelVersion(record: ModelVersionInsert) {
    const { data, error } = await getSupabaseClient().from('model_versions').insert(record).select().single();
    return requireData(data, error);
  }
};