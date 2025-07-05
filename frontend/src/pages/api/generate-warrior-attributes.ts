import { NextApiRequest, NextApiResponse } from 'next';
import { generateWarriorAttributes } from '../../../0G/demo-compute-flow';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required and must be a string' });
    }

    console.log('API: Generating warrior attributes for prompt:', prompt);
    
    // Call the 0G AI function
    const attributes = await generateWarriorAttributes(prompt);
    
    console.log('API: Generated attributes:', attributes);
    
    // Return the JSON response
    res.status(200).json({ 
      success: true, 
      attributes: attributes 
    });
    
  } catch (error) {
    console.error('API: Error generating warrior attributes:', error);
    
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
} 