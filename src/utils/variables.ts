import type { Environment } from '../types'

// Replace environment variables in a string
export function interpolateVariables(text: string, environment?: Environment): string {
  if (!environment || !text) return text
  
  let result = text
  
  // Replace {{variable}} syntax
  const regex = /\{\{([^}]+)\}\}/g
  result = result.replace(regex, (match, varName) => {
    const variable = environment.variables.find(v => v.key === varName.trim() && v.enabled)
    return variable ? variable.value : match
  })
  
  return result
}

// Extract variables from text
export function extractVariables(text: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g
  const variables: string[] = []
  let match
  
  while ((match = regex.exec(text)) !== null) {
    variables.push(match[1].trim())
  }
  
  return [...new Set(variables)]
}
