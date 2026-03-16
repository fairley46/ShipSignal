export interface TeamConfig {
  team: {
    name: string;
    jira_project_key?: string;
  };
  deploy_points: DeployPoint[];
  generation?: GenerationConfig;
  ai_provider: AIProviderConfig;
  jira?: JiraConfig;
  output?: OutputConfig;
}

export interface DeployPoint {
  environment: string;
  branch_pattern: string;
  description?: string;
  personas: string[];
}

export interface AIProviderConfig {
  type: 'anthropic' | 'github-copilot' | 'openai' | 'azure-openai';
  model: string;
  azure_endpoint?: string;
  azure_deployment?: string;
}

export interface GenerationConfig {
  min_diff_lines?: number;
  max_tokens?: number;
}

export interface JiraConfig {
  fetch_linked_tickets?: boolean;
  max_tickets?: number;
  fields_to_fetch?: string[];
}

export interface OutputConfig {
  base_path?: string;
  subfolder_by_environment?: boolean;
}

export interface JiraTicket {
  id: string;
  summary: string;
  description: string;
  labels: string[];
  priority: string;
  status: string;
}

export interface GitContext {
  diffSummary: string;
  diffLineCount: number;
  commitMessages: string;
  ticketIds: string[];
  sha: string;
  branch: string;
}

export interface GeneratedNote {
  personaName: string;
  content: string;
  deployEnv: string;
}

export interface PromptBuilderOptions {
  personaName: string;
  deployEnv: string;
  deployPoint: DeployPoint;
  gitContext: GitContext;
  prDescription: string;
  jiraTickets: JiraTicket[];
  config: TeamConfig;
}
