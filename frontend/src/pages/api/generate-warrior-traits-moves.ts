import { NextApiRequest, NextApiResponse } from 'next';
import { generateWarriorTraitsAndMoves } from '../../../0G/demo-compute-flow';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { personalityAttributes } = req.body;

    if (!personalityAttributes || typeof personalityAttributes !== 'object') {
      return res.status(400).json({ error: 'personalityAttributes is required and must be an object' });
    }

    console.log('API: Generating warrior traits and moves for personality:', personalityAttributes);
    
    // Call the 0G AI function
    const traitsAndMoves = await generateWarriorTraitsAndMoves(personalityAttributes);
    
    console.log('API: Generated traits and moves:', traitsAndMoves);
    
    // Return the JSON response
    res.status(200).json({ 
      success: true, 
      traitsAndMoves: traitsAndMoves 
    });
    
  } catch (error) {
    console.error('API: Error generating warrior traits and moves:', error);
    
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
} 