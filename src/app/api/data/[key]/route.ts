import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

const DB_NAME = 'scorecraft';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(key);
    
    // In our app, we store the entire array as one document or 
    // we manage it as multiple docs. 
    // To match the current 'fs' logic (which reads/writes whole arrays),
    // we'll store the data in a single document with { id: 'master_list', data: [...] }
    // OR we can just fetch all documents and return them as an array.
    
    // Fetching all documents in the collection and returning them as the array
    const data = await collection.find({}).toArray();
    
    // Remove MongoDB _id from results to keep it clean for our frontend
    const cleanedData = data.map(({ _id, ...rest }) => rest);
    
    return NextResponse.json(cleanedData);
  } catch (error) {
    console.error('MongoDB GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  
  try {
    const body = await request.json(); // This is the full array from our frontend
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(key);
    
    // Since our frontend sends the ENTIRE updated array, 
    // we clear the collection and insert the new array.
    // This perfectly mimics our 'fs' logic.
    await collection.deleteMany({});
    
    if (Array.isArray(body) && body.length > 0) {
      await collection.insertMany(body);
    } else if (!Array.isArray(body) && body) {
      await collection.insertOne(body);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('MongoDB POST Error:', error);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}
