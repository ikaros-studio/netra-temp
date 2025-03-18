import { useRuntimeConfig } from '#imports';

// Parse Perplexity API response to extract individual profiles
const parseIndividualResults = (content: string, searchQuery: any, images: any[] = []) => {
  try {
    // Look for a pattern that might be JSON
    const jsonMatch = content.match(/```json([\s\S]*?)```/) || content.match(/\[([\s\S]*?)\]/) || content.match(/\{([\s\S]*?)\}/);
    
    if (jsonMatch) {
      // Try to parse the matched JSON
      const jsonStr = jsonMatch[0].replace(/```json|```/g, '');
      const parsedData = JSON.parse(jsonStr);
      
      if (Array.isArray(parsedData)) {
        // Add images from the API response to the parsed data if available
        return parsedData.map((person, index) => ({
          first_name: person.first_name || '',
          last_name: person.last_name || '',
          birth_date: person.birth_date || person.dob || '',
          country: person.country || person.nationality || '',
          profile_image_url: 
            person.profile_image_url || 
            person.image_url || 
            person.photo_url || 
            (images[index] ? images[index].url : '') || 
            '',
          source_url: person.source_url || person.url || person.link || '',
        }));
      } else if (typeof parsedData === 'object') {
        return [{
          first_name: parsedData.first_name || '',
          last_name: parsedData.last_name || '',
          birth_date: parsedData.birth_date || parsedData.dob || '',
          country: parsedData.country || parsedData.nationality || '',
          profile_image_url: 
            parsedData.profile_image_url || 
            parsedData.image_url || 
            parsedData.photo_url || 
            (images[0] ? images[0].url : '') || 
            '',
          source_url: parsedData.source_url || parsedData.url || parsedData.link || '',
        }];
      }
    }
    
    // If no JSON found, check if there's a "no information available" message
    if (content.toLowerCase().includes('no information available') || 
        content.toLowerCase().includes('could not find') ||
        content.toLowerCase().includes('no results found')) {
      return [];
    }
    
    // Look for possible image URLs in the raw content or use images from response
    const imageUrlMatches = content.match(/https?:\/\/\S+\.(jpg|jpeg|png|gif|webp)/gi) || [];
    const extractedUrls = imageUrlMatches.slice(0, 3); // Get up to 3 image URLs
    
    // Create imageUrls array, prioritizing images from the Perplexity response
    const imageUrls = images.length > 0 
      ? images.map(img => img.url) 
      : extractedUrls;
    
    // Extract website URLs that might be sources
    const websiteUrlMatches = content.match(/https?:\/\/\S+/gi) || [];
    const websiteUrls = websiteUrlMatches
      .filter(url => !url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) // Filter out image URLs
      .slice(0, 3); // Get up to 3 website URLs
    
    // Try to extract structured information from text
    const lines = content.split('\n');
    const extractedPersons = [];
    let currentPerson = null;
    
    for (const line of lines) {
      if (line.toLowerCase().includes('name:') || line.match(/^\d+\.\s/)) {
        // Start a new person
        if (currentPerson && Object.keys(currentPerson).length > 1) {
          extractedPersons.push(currentPerson);
        }
        
        currentPerson = {
          first_name: '',
          last_name: '',
          birth_date: '',
          country: '',
          profile_image_url: '',
          source_url: ''
        };
        
        // Try to extract name
        const nameMatch = line.match(/name:\s*(.+)/i) || line.match(/^\d+\.\s*(.+)/);
        if (nameMatch && nameMatch[1]) {
          const nameParts = nameMatch[1].split(' ');
          currentPerson.first_name = nameParts[0] || '';
          currentPerson.last_name = nameParts.slice(1).join(' ') || '';
        }
      } else if (currentPerson) {
        // Extract other details for current person
        if (line.toLowerCase().includes('birth') || line.toLowerCase().includes('born')) {
          const dateMatch = line.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})|(\d{4}-\d{2}-\d{2})|(\w+\s+\d{1,2},\s*\d{4})/);
          if (dateMatch) {
            currentPerson.birth_date = dateMatch[0];
          }
        }
        
        if (line.toLowerCase().includes('country') || line.toLowerCase().includes('nationality')) {
          const countryMatch = line.match(/country:\s*(.+)/i) || line.match(/nationality:\s*(.+)/i);
          if (countryMatch && countryMatch[1]) {
            currentPerson.country = countryMatch[1].trim();
          }
        }
        
        // Extract source URL
        const urlMatch = line.match(/(https?:\/\/\S+)/);
        if (urlMatch && urlMatch[1]) {
          currentPerson.source_url = urlMatch[1];
        }
      }
    }
    
    // Add the last person
    if (currentPerson && Object.keys(currentPerson).length > 1) {
      extractedPersons.push(currentPerson);
    }
    
    // If we extracted any structured data, return it
    if (extractedPersons.length > 0) {
      // Assign images to each person
      extractedPersons.forEach((person, index) => {
        if (!person.profile_image_url && imageUrls[index]) {
          person.profile_image_url = imageUrls[index];
        }
        if (!person.source_url && websiteUrls[index]) {
          person.source_url = websiteUrls[index];
        }
      });
      
      return extractedPersons;
    }
    
    // Fallback: Create a structured result based on the text content
    const nameParts = searchQuery.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // At this point, we couldn't extract structured data, but we might have found some info
    // Return a basic result with whatever we found
    return [
      {
        first_name: firstName,
        last_name: lastName,
        birth_date: searchQuery.birth_date || '',
        country: searchQuery.country || '',
        profile_image_url: imageUrls[0] || '',
        source_url: websiteUrls[0] || ''
      }
    ];
  } catch (error) {
    console.error("Error parsing individual results:", error);
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
  if (!body.name) {
    throw createError({
      statusCode: 400,
      message: 'Name is required',
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
        max_tokens: 800,
        return_images: true
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
    console.log("Perplexity API response:", JSON.stringify(data, null, 2));
    
    // Extract images from the response if they exist
    const images = data.images || [];
    const content = data.choices[0].message.content;
    
    // Parse the response to extract structured data
    const results = parseIndividualResults(content, body, images);
    
    if (results.length === 0) {
      return { message: 'No results found', results: [] };
    }
    
    return { results };
  } catch (error: any) {
    console.error('Failed to search individuals:', error);
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to search individuals',
    });
  }
});

function buildPrompt(body: any) {
  // Extract search parameters
  const { name, birth_date, country } = body;
  
  // Build prompt with the available parameters
  let prompt = `Return ONLY real individual profiles found on the web as a JSON array with first_name, last_name, birth_date, country, and profile_image_url fields. `;
  prompt += `IMPORTANT: Compile DISTINCT individuals - do not include the same person multiple times, instead combine information from different sources about the same person. `;
  prompt += `If multiple different people match this name, provide up to 5 distinct individuals. `;
  prompt += `Do not invent or fabricate data. `;
  
  // Add search details to prompt
  prompt += `\n\nSearch for: ${name}`;
  if (birth_date) prompt += `, born ${birth_date}`;
  if (country) prompt += `, from ${country}`;
  
  // System message to ensure factual information
  const systemMessage = `You are an AI assistant that provides factual information about real individuals based on web searches. ` +
    `Never generate fictional individual profiles. ` +
    `Always compile distinct individuals - don't list the same person multiple times. ` +
    `Simply state "No information available" when you cannot find real information about a person. ` +
    `Return results in JSON format with fields: first_name, last_name, birth_date, country, and profile_image_url. ` +
    `For dates, use ISO format (YYYY-MM-DD) when possible. ` +
    `For profile_image_url, include direct links to real images of the person when available.`;
  
  return { prompt, systemMessage };
} 