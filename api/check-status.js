export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
 res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
      'https://api.github.com/repos/DenisV2112/CUSTOM_GITHUB_OVERVIEW/actions/runs?per_page=10',
      {
        headers: {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GitHub API error:', response.status, errorText);
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Verificar que hay workflows
    if (!data.workflow_runs || data.workflow_runs.length === 0) {
      return res.status(200).json({
        status: 'not_found',
        conclusion: null,
        updated_at: null,
        html_url: null,
        is_completed: false,
        execution_id: execution_id,
        run_id: null,
        found: false,
        message: 'No workflow runs found'
      });
    }

    let targetRun = data.workflow_runs[0]; // Por defecto el más reciente
    let found = true;
    
    // Si tenemos execution_id, buscar el run específico
    if (execution_id) {
      console.log(`🔍 Searching for execution_id: ${execution_id}`);
      
      const specificRun = data.workflow_runs.find(run => {
        // Buscar en el commit message
        if (run.head_commit && run.head_commit.message) {
          return run.head_commit.message.includes(execution_id);
        }
        // Buscar en el display title
        if (run.display_title) {
          return run.display_title.includes(execution_id);
        }
        return false;
      });

      if (specificRun) {
        targetRun = specificRun;
        console.log(`✅ Found specific run: ${targetRun.id} with status: ${targetRun.status}`);
      } else {
        // Usar el más reciente que sea de nuestro workflow
        const ourWorkflowRuns = data.workflow_runs.filter(run => 
          run.name === 'Update README with Language' || 
          run.path === '.github/workflows/update-readme.yml'
        );
        
        if (ourWorkflowRuns.length > 0) {
          targetRun = ourWorkflowRuns[0];
          found = false;
          console.log(`⚠️ Specific run not found, using latest our workflow: ${targetRun.id}`);
        } else {
          targetRun = data.workflow_runs[0];
          found = false;
          console.log(`⚠️ No our workflow runs found, using latest: ${targetRun.id}`);
        }
      }
    }

    const result = {
      status: targetRun.status,
      conclusion: targetRun.conclusion,
      updated_at: targetRun.updated_at,
      html_url: targetRun.html_url,
      is_completed: targetRun.status === 'completed',
      execution_id: execution_id,
      run_id: targetRun.id,
      found: found,
      workflow_name: targetRun.name,
      message: found ? 'Specific run found' : 'Using latest run as fallback'
    };

    console.log(`📊 Returning status: ${result.status}, completed: ${result.is_completed}, found: ${result.found}`);

    res.status(200).json(result);

  } catch (error) {
    console.error('Error checking status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to check workflow status',
      details: error.message,
      execution_id: execution_id
    });
  }
}