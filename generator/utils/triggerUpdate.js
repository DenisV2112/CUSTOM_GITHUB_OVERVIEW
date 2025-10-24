import fetch from 'node-fetch';

export async function triggerLanguageUpdate(language, githubToken) {
  const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
  
  console.log(`🔧 Triggering language update to: ${language}`);
  
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/dispatches`,
      {
        method: 'POST',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
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

    if (response.status === 204) {
      console.log(`✅ Successfully triggered language change to: ${language}`);
      return true;
    } else {
      const errorText = await response.text();
      console.error(`❌ Failed to trigger: ${response.status} - ${errorText}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Network error triggering update:', error.message);
    return false;
  }
}   