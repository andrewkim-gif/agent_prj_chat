import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const uri = 'mongodb://ara:dkfkakstp~!23@10.100.100.10:3004/test?authSource=admin'

export async function GET() {
  const client = new MongoClient(uri)

  try {
    await client.connect()
    const db = client.db('trend')
    const collection = db.collection('da')

    // Get sample documents with all fields
    const sampleDocs = await collection.find({}).limit(5).toArray()

    // Get field analysis
    const fieldAnalysis = await collection.aggregate([
      { $project: {
        title: 1,
        channel: 1,
        location: 1,
        createdat: 1,
        sentiment: 1,
        harm: 1,
        isscript: 1,
        // Try to see what other fields exist
        allFields: { $objectToArray: "$$ROOT" }
      }},
      { $limit: 3 }
    ]).toArray()

    return NextResponse.json({
      success: true,
      data: {
        sampleCount: sampleDocs.length,
        sampleDocs: sampleDocs.map(doc => ({
          _id: doc._id,
          title: doc.title,
          channel: doc.channel,
          location: doc.location,
          createdat: doc.createdat,
          sentiment: doc.sentiment,
          harm: doc.harm,
          isscript: doc.isscript,
          // Include any other fields that exist
          otherFields: Object.keys(doc).filter(key =>
            !['_id', 'title', 'channel', 'location', 'createdat', 'sentiment', 'harm', 'isscript'].includes(key)
          )
        })),
        allFieldsAnalysis: fieldAnalysis
      }
    })

  } catch (error) {
    console.error('Sample data error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sample data' },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}