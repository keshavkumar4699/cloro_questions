import mongoose from 'mongoose';
import User from '@/models/User'; // Adjust the path to your User model

export default async function handler(req, res) {
  const { userId } = req.query;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    // Fetch the user and populate the questions field
    const user = await User.findById(userId)
      .populate('questions') // Populates the entire question documents
      .exec();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return the populated questions array
    res.status(200).json({ questions: user.questions || [] });
  } catch (error) {
    console.error('Error fetching user questions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}