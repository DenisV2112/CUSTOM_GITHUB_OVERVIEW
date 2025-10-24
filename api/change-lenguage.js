export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { language } = req.body;
  
  // Validar lenguaje
  if (!language || !['en', 'es'].includes(language)) {
    return res.status(400).json({ error: 'Invalid language' });
  }

  try {
    console.log(`🌍 Triggering language change to: ${language}`);
    
    const response = await fetch(
      'https://api.github.com/repos/DenisV2112/CUSTOM_GITHUB_OVERVIEW/dispatches',
      {
        method: 'POST',
        headers: {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: 'language-change',
          client_payload: {
            language: language,
            timestamp: new Date().toISOString(),
            source: 'web_trigger'
          }
        })
      }
    );

    console.log(`GitHub API response: ${response.status}`);

    if (response.status === 204) {
      res.status(200).json({ 
        success: true, 
        message: 'README update triggered successfully',
        language: language
      });
    } else {
      const errorText = await response.text();
      console.error('GitHub API error:', errorText);
      res.status(500).json({ 
        success: false, 
        error: `GitHub API error: ${response.status}` 
      });
    }
  } catch (error) {
    console.error('Network error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Network error' 
    });
  }
}