// Web search utility - supports Brave or Serper API

export async function searchWeb(query: string): Promise<string[]> {
  const braveApiKey = process.env.BRAVE_API_KEY;
  const serperApiKey = process.env.SERPER_API_KEY;

  try {
    if (braveApiKey) {
      return await searchBrave(query, braveApiKey);
    } else if (serperApiKey) {
      return await searchSerper(query, serperApiKey);
    } else {
      console.warn('No search API key configured');
      return [];
    }
  } catch (error) {
    console.error('Web search error:', error);
    return [];
  }
}

async function searchBrave(query: string, apiKey: string): Promise<string[]> {
  const response = await fetch(
    `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}`,
    {
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': apiKey,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Brave API error: ${response.statusText}`);
  }

  const data = await response.json();
  const results = data.web?.results || [];
  return results.slice(0, 3).map((r: any) => r.url);
}

async function searchSerper(query: string, apiKey: string): Promise<string[]> {
  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: query }),
  });

  if (!response.ok) {
    throw new Error(`Serper API error: ${response.statusText}`);
  }

  const data = await response.json();
  const results = data.organic || [];
  return results.slice(0, 3).map((r: any) => r.link);
}
