import { useRuntimeConfig } from '#imports';

// Parse Perplexity API response to extract company profiles
const parseCompanyResults = (content: string, searchQuery: any) => {
  try {
    // Look for a pattern that might be JSON
    const jsonMatch = content.match(/```json([\s\S]*?)```/) || content.match(/\[([\s\S]*?)\]/) || content.match(/\{([\s\S]*?)\}/);
    
    if (jsonMatch) {
      // Try to parse the matched JSON
      const jsonStr = jsonMatch[0].replace(/```json|```/g, '');
      const parsedData = JSON.parse(jsonStr);
      
      if (Array.isArray(parsedData)) {
        return parsedData.map(comp => ({
          company_name: comp.company_name || comp.name || '',
          company_registration_number: comp.company_registration_number || comp.registration_number || comp.reg_number || '',
          country: comp.country || comp.location || '',
          industry: comp.industry || comp.sector || '',
          website_url: comp.website_url || comp.website || comp.url || '',
          source_url: comp.source_url || comp.source || ''
        }));
      } else if (typeof parsedData === 'object') {
        return [{
          company_name: parsedData.company_name || parsedData.name || '',
          company_registration_number: parsedData.company_registration_number || parsedData.registration_number || parsedData.reg_number || '',
          country: parsedData.country || parsedData.location || '',
          industry: parsedData.industry || parsedData.sector || '',
          website_url: parsedData.website_url || parsedData.website || parsedData.url || '',
          source_url: parsedData.source_url || parsedData.source || ''
        }];
      }
    }
    
    // If no JSON found, check if there's a "no information available" message
    if (content.toLowerCase().includes('no information available') || 
        content.toLowerCase().includes('could not find') ||
        content.toLowerCase().includes('no results found')) {
      return [];
    }
    
    // Extract website URLs that might be sources
    const websiteUrlMatches = content.match(/https?:\/\/\S+/gi) || [];
    const websiteUrls = websiteUrlMatches.slice(0, 5); // Get up to 5 website URLs
    
    // Try to extract structured information from text
    const lines = content.split('\n');
    const extractedCompanies = [];
    let currentCompany = null;
    
    for (const line of lines) {
      if (line.toLowerCase().includes('name:') || line.toLowerCase().includes('company:') || line.match(/^\d+\.\s/)) {
        // Start a new company
        if (currentCompany && Object.keys(currentCompany).length > 1) {
          extractedCompanies.push(currentCompany);
        }
        
        currentCompany = {
          company_name: '',
          company_registration_number: '',
          country: '',
          industry: '',
          website_url: '',
          source_url: ''
        };
        
        // Try to extract name
        const nameMatch = line.match(/name:\s*(.+)/i) || line.match(/company:\s*(.+)/i) || line.match(/^\d+\.\s*(.+)/);
        if (nameMatch && nameMatch[1]) {
          currentCompany.company_name = nameMatch[1].trim();
        }
      } else if (currentCompany) {
        // Extract other details for current company
        if (line.toLowerCase().includes('registration') || line.toLowerCase().includes('reg')) {
          const regMatch = line.match(/registration.*?(\w+)/i) || line.match(/reg.*?:\s*(.+)/i);
          if (regMatch && regMatch[1]) {
            currentCompany.company_registration_number = regMatch[1].trim();
          }
        }
        
        if (line.toLowerCase().includes('country') || line.toLowerCase().includes('location')) {
          const countryMatch = line.match(/country:\s*(.+)/i) || line.match(/location:\s*(.+)/i);
          if (countryMatch && countryMatch[1]) {
            currentCompany.country = countryMatch[1].trim();
          }
        }
        
        if (line.toLowerCase().includes('industry') || line.toLowerCase().includes('sector')) {
          const industryMatch = line.match(/industry:\s*(.+)/i) || line.match(/sector:\s*(.+)/i);
          if (industryMatch && industryMatch[1]) {
            currentCompany.industry = industryMatch[1].trim();
          }
        }
        
        // Extract URLs
        const urlMatch = line.match(/(https?:\/\/\S+)/);
        if (urlMatch && urlMatch[1]) {
          if (line.toLowerCase().includes('website')) {
            currentCompany.website_url = urlMatch[1];
          } else if (line.toLowerCase().includes('source')) {
            currentCompany.source_url = urlMatch[1];
          } else if (!currentCompany.website_url) {
            currentCompany.website_url = urlMatch[1];
          }
        }
      }
    }
    
    // Add the last company
    if (currentCompany && Object.keys(currentCompany).length > 1 && currentCompany.company_name) {
      extractedCompanies.push(currentCompany);
    }
    
    // If we extracted any structured data, return it
    if (extractedCompanies.length > 0) {
      // Assign source URLs if missing
      extractedCompanies.forEach((company, index) => {
        if (!company.source_url && !company.website_url && websiteUrls[index]) {
          company.website_url = websiteUrls[index];
        }
      });
      
      return extractedCompanies;
    }
    
    // Return basic info if we couldn't extract structured data
    return [{
      company_name: searchQuery.company_name,
      company_registration_number: searchQuery.company_registration_number || '',
      country: searchQuery.country || '',
      industry: searchQuery.industry || '',
      website_url: websiteUrls[0] || '',
      source_url: websiteUrls[1] || ''
    }];
  } catch (error) {
    console.error("Error parsing company results:", error);
    return [];
  }
};

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);
  
  // Get API key with fallback
  const apiKey = config.PERPLEXITY_API_KEY || process.env.PERPLEXITY_API_KEY;
  
  // Debug the API key
  console.log("API Key available:", !!apiKey);
  console.log("API Key length:", apiKey?.length || 0);
  
  // Validate input
  if (!body.company_name) {
    throw createError({
      statusCode: 400,
      message: 'Company name is required',
    });
  }

  try {
    const { prompt, systemMessage } = buildPrompt(body);
    // Call Perplexity API
    console.log("Making Perplexity API request with prompt:", prompt);
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: systemMessage
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 800
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Perplexity API error status:", response.status);
      console.error("Perplexity API error details:", errorText);
      throw createError({
        statusCode: response.status,
        message: `Perplexity API error: ${response.statusText}. Details: ${errorText}`,
      });
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the response to extract structured data
    const results = parseCompanyResults(content, body);
    
    if (results.length === 0) {
      return { message: 'No results found', results: [] };
    }
    
    return { results };
  } catch (error: any) {
    console.error('Failed to search companies:', error);
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to search companies',
    });
  }
});

function buildPrompt(body: any) {
  // Extract search parameters
  const { company_name, company_registration_number, country, industry } = body;
  
  // Build prompt with the available parameters
  let prompt = `Return ONLY real company profiles found on the web, structured as a JSON array with company_name, company_registration_number, country, and industry fields. `;
  prompt += `IMPORTANT: Compile DISTINCT companies - do not include the same company multiple times, instead combine information from different sources about the same company. `;
  prompt += `If multiple different companies match this name, provide up to 5 distinct companies. `;
  prompt += `Do not invent or fabricate data.`;
  
  // Add search details to prompt
  prompt += `\n\nSearch for: ${company_name}`;
  if (company_registration_number) prompt += `, registration number ${company_registration_number}`;
  if (country) prompt += `, from ${country}`;
  if (industry) prompt += `, in the ${industry} industry`;
  
  // System message to ensure factual information
  const systemMessage = `You are an AI assistant that provides factual information about real companies based on web searches. ` +
    `Never generate fictional company profiles. ` +
    `Always compile distinct companies - don't list the same company multiple times. ` +
    `Simply state "No information available" when you cannot find real information about a company. ` +
    `Return results in JSON format with fields: company_name, company_registration_number, country, and industry.`;
  
  return { prompt, systemMessage };
} 