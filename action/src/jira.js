export async function fetchJiraTickets(ticketIds, jiraConfig) {
  const baseUrl = process.env.JIRA_BASE_URL;
  const email = process.env.JIRA_USER_EMAIL;
  const token = process.env.JIRA_API_TOKEN;

  if (!ticketIds.length || !token || !baseUrl) {
    if (!token || !baseUrl) console.log('Jira credentials not configured, skipping ticket fetch.');
    return [];
  }

  const auth = Buffer.from(`${email}:${token}`).toString('base64');
  const fields = (jiraConfig?.fields_to_fetch ?? ['summary', 'description', 'labels', 'priority', 'status']).join(',');
  const cap = jiraConfig?.max_tickets ?? 20;
  const results = [];

  for (const id of ticketIds.slice(0, cap)) {
    try {
      const url = `${baseUrl}/rest/api/3/issue/${id}?fields=${fields}`;
      const res = await fetch(url, {
        headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' },
      });

      if (!res.ok) {
        console.warn(`Jira ${id}: ${res.status}`);
        continue;
      }

      const data = await res.json();
      const f = data.fields ?? {};

      results.push({
        id,
        summary: f.summary ?? '',
        description: extractAdfText(f.description).slice(0, 1500),
        labels: f.labels ?? [],
        priority: f.priority?.name ?? 'Unknown',
        status: f.status?.name ?? 'Unknown',
      });
    } catch (err) {
      console.warn(`Jira ${id} error:`, err.message);
    }
  }

  return results;
}

function extractAdfText(node) {
  if (!node || typeof node !== 'object') return '';
  if (node.type === 'text') return node.text ?? '';
  if (Array.isArray(node.content)) return node.content.map(extractAdfText).join(' ');
  return '';
}
