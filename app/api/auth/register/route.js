import connectMongo from '@/libs/mongoose';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  await connectMongo();
  try {
    const { name, email, password } = await req.json();
    // Check if user exists
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return Response.json(
        { success: false, message: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    return Response.json(
      { success: true, user: { id: user._id, email: user.email } },
      { status: 201 }
    );
    
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}