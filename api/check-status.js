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

  const { execution_id } = req.query;

  try {
    // Obtener los últimos workflow runs
    const response = await fetch(
      'https://api.github.com/repos/DenisV2112/CUSTOM_GITHUB_OVERVIEW/actions/runs?per_page=5',
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
    
    let targetRun = data.workflow_runs[0]; // Por defecto el más reciente
    
    // Si tenemos execution_id, buscar el run específico
    if (execution_id) {
      targetRun = data.workflow_runs.find(run => 
        run.display_title.includes(execution_id) || 
        (run.head_commit && run.head_commit.message.includes(execution_id))
      ) || data.workflow_runs[0];
    }

    const result = {
      status: targetRun.status,
      conclusion: targetRun.conclusion,
      updated_at: targetRun.updated_at,
      html_url: targetRun.html_url,
      is_completed: targetRun.status === 'completed',
      execution_id: execution_id,
      run_id: targetRun.id
    };

    res.status(200).json(result);

  } catch (error) {
    console.error('Error checking status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to check workflow status' 
    });
  }
}