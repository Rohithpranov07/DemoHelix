import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    // For demo purposes, we are querying the local sqlite users table directly
    const user = db.prepare('SELECT id, email, password_hash FROM users WHERE email = ?').get(email) as any;
    
    if (!user) {
      return NextResponse.json({ error: 'Login failed. User not found in demo database.' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    return NextResponse.json({ id: user.id, email: user.email });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}