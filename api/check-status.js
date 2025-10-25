export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Obtener el último workflow run
    const response = await fetch(
      'https://api.github.com/repos/DenisV2112/CUSTOM_GITHUB_OVERVIEW/actions/runs?per_page=1',
      {
        headers: {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch workflow status');
    }

    const data = await response.json();
    const latestRun = data.workflow_runs[0];

    res.status(200).json({
      status: latestRun.status, // queued, in_progress, completed
      conclusion: latestRun.conclusion, // success, failure, cancelled
      updated_at: latestRun.updated_at,
      html_url: latestRun.html_url,
      is_completed: latestRun.status === 'completed'
    });

  } catch (error) {
    console.error('Error checking status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to check workflow status' 
    });
  }
}