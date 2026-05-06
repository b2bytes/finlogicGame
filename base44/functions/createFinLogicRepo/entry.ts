import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('github');

    const repoPayload = {
      name: 'finlogic',
      description: 'FinLogic — Sistema operativo financiero del pueblo de Chile. Plataforma agéntica de inclusión financiera con IA regulatoria (CMF, SERNAC, SII).',
      homepage: 'https://finlogic.one',
      private: false,
      has_issues: true,
      has_projects: true,
      has_wiki: false,
      auto_init: true,
      gitignore_template: 'Node',
      license_template: 'mit',
    };

    const ghRes = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
        'User-Agent': 'FinLogic-Base44',
      },
      body: JSON.stringify(repoPayload),
    });

    const data = await ghRes.json();

    if (!ghRes.ok) {
      console.error('GitHub API error:', ghRes.status, data);
      return Response.json({
        error: 'GitHub API error',
        status: ghRes.status,
        details: data,
      }, { status: ghRes.status });
    }

    return Response.json({
      success: true,
      repo: {
        name: data.name,
        full_name: data.full_name,
        html_url: data.html_url,
        clone_url: data.clone_url,
        ssh_url: data.ssh_url,
        default_branch: data.default_branch,
        private: data.private,
        owner: data.owner?.login,
      },
    });
  } catch (error) {
    console.error('Error creating repo:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});