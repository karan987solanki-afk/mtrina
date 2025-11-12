import { supabase } from './supabase';

export const api = {
  async getLists() {
    const { data, error } = await supabase
      .from('lists')
      .select('*, subscribers(count)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createList(listData) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('lists')
      .insert([{ ...listData, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getSubscribers(listId) {
    const { data, error } = await supabase
      .from('subscribers')
      .select('*')
      .eq('list_id', listId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async addSubscriber(subscriberData) {
    const { data, error} = await supabase
      .from('subscribers')
      .insert([subscriberData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async importSubscribers(listId, subscribers) {
    const subscribersWithListId = subscribers.map(sub => ({
      ...sub,
      list_id: listId,
      status: 'active'
    }));

    const { data, error } = await supabase
      .from('subscribers')
      .upsert(subscribersWithListId, {
        onConflict: 'list_id,email',
        ignoreDuplicates: false
      })
      .select();

    if (error) throw error;
    return data;
  },

  async getCampaigns() {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*, lists(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getCampaign(id) {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*, lists(name, id)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createCampaign(campaignData) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('campaigns')
      .insert([{ ...campaignData, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCampaign(id, updates) {
    const { data, error } = await supabase
      .from('campaigns')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCampaign(id) {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async sendCampaign(campaignId) {
    const campaign = await this.getCampaign(campaignId);
    const subscribers = await this.getSubscribers(campaign.list_id);

    const activeSubscribers = subscribers.filter(s => s.status === 'active');

    await this.updateCampaign(campaignId, {
      status: 'sending',
      total_subscribers: activeSubscribers.length
    });

    const sends = activeSubscribers.map(subscriber => ({
      campaign_id: campaignId,
      subscriber_id: subscriber.id,
      status: 'pending'
    }));

    const { data, error } = await supabase
      .from('campaign_sends')
      .insert(sends)
      .select();

    if (error) throw error;

    await supabase.functions.invoke('send-campaign', {
      body: { campaignId }
    });

    return data;
  },

  async getCampaignStats(campaignId) {
    const { data: sends, error } = await supabase
      .from('campaign_sends')
      .select('status')
      .eq('campaign_id', campaignId);

    if (error) throw error;

    const stats = sends.reduce((acc, send) => {
      acc[send.status] = (acc[send.status] || 0) + 1;
      return acc;
    }, {});

    return stats;
  },

  async getTemplates() {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createTemplate(templateData) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('email_templates')
      .insert([{ ...templateData, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getSMTPSettings() {
    const { data, error } = await supabase
      .from('smtp_settings')
      .select('*')
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async saveSMTPSettings(settings) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('smtp_settings')
      .upsert([{ ...settings, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
