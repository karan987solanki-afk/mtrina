const API_URL = 'http://localhost:3001/api';

let authToken = localStorage.getItem('authToken');

function setAuthToken(token) {
  authToken = token;
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
}

function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    ...(authToken && { 'Authorization': `Bearer ${authToken}` })
  };
}

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
}

export const api = {
  async register(email, password) {
    const result = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setAuthToken(result.token);
    return result;
  },

  async login(email, password) {
    const result = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setAuthToken(result.token);
    return result;
  },

  async logout() {
    setAuthToken(null);
  },

  async getCurrentUser() {
    return await apiRequest('/auth/me');
  },

  async getLists() {
    const lists = await apiRequest('/lists');
    return lists.map(list => ({
      ...list,
      subscribers: [{ count: list.subscriber_count }]
    }));
  },

  async createList(listData) {
    return await apiRequest('/lists', {
      method: 'POST',
      body: JSON.stringify(listData)
    });
  },

  async getSubscribers(listId) {
    return await apiRequest(`/lists/${listId}/subscribers`);
  },

  async addSubscriber(subscriberData) {
    const { list_id } = subscriberData;
    return await apiRequest(`/lists/${list_id}/subscribers`, {
      method: 'POST',
      body: JSON.stringify(subscriberData)
    });
  },

  async importSubscribers(listId, subscribers) {
    const results = [];
    for (const sub of subscribers) {
      try {
        const result = await this.addSubscriber({
          list_id: listId,
          ...sub
        });
        results.push(result);
      } catch (error) {
        console.error(`Failed to import ${sub.email}:`, error.message);
      }
    }
    return results;
  },

  async getCampaigns() {
    const campaigns = await apiRequest('/campaigns');
    return campaigns.map(c => ({
      ...c,
      lists: { name: c.list_name }
    }));
  },

  async getCampaign(id) {
    const campaign = await apiRequest(`/campaigns/${id}`);
    return {
      ...campaign,
      lists: { name: campaign.list_name, id: campaign.list_id }
    };
  },

  async createCampaign(campaignData) {
    return await apiRequest('/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData)
    });
  },

  async updateCampaign(id, updates) {
    return await apiRequest(`/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteCampaign(id) {
    return await apiRequest(`/campaigns/${id}`, {
      method: 'DELETE'
    });
  },

  async sendCampaign(campaignId) {
    return await apiRequest(`/campaigns/${campaignId}/send`, {
      method: 'POST'
    });
  },

  async getCampaignStats(campaignId) {
    return {};
  },

  async getTemplates() {
    return [];
  },

  async createTemplate(templateData) {
    return {};
  },

  async getSMTPSettings() {
    return await apiRequest('/smtp-settings');
  },

  async saveSMTPSettings(settings) {
    return await apiRequest('/smtp-settings', {
      method: 'POST',
      body: JSON.stringify(settings)
    });
  },

  async getSMTPServers() {
    return await apiRequest('/smtp-servers');
  },

  async createSMTPServer(server) {
    return await apiRequest('/smtp-servers', {
      method: 'POST',
      body: JSON.stringify(server)
    });
  },

  async updateSMTPServer(id, updates) {
    return await apiRequest(`/smtp-servers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteSMTPServer(id) {
    return await apiRequest(`/smtp-servers/${id}`, {
      method: 'DELETE'
    });
  },

  async testSMTPServer(id, toEmail) {
    return await apiRequest(`/smtp-servers/${id}/test`, {
      method: 'POST',
      body: JSON.stringify({ to_email: toEmail })
    });
  },

  async getBlacklist() {
    return await apiRequest('/blacklist');
  },

  async addToBlacklist(email, reason) {
    return await apiRequest('/blacklist', {
      method: 'POST',
      body: JSON.stringify({ email, reason })
    });
  },

  async removeFromBlacklist(id) {
    return await apiRequest(`/blacklist/${id}`, {
      method: 'DELETE'
    });
  },

  async getUnsubscribeList() {
    return await apiRequest('/unsubscribe-list');
  },

  async addToUnsubscribeList(email, list_id, campaign_id, reason) {
    return await apiRequest('/unsubscribe-list', {
      method: 'POST',
      body: JSON.stringify({ email, list_id, campaign_id, reason })
    });
  },

  async removeFromUnsubscribeList(id) {
    return await apiRequest(`/unsubscribe-list/${id}`, {
      method: 'DELETE'
    });
  },

  async duplicateCampaign(campaignId) {
    return await apiRequest(`/campaigns/${campaignId}/duplicate`, {
      method: 'POST'
    });
  }
};

export { setAuthToken };
