import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const uri = 'mongodb://ara:dkfkakstp~!23@10.100.100.10:3004/test?authSource=admin'

export async function GET() {
  const client = new MongoClient(uri)

  try {
    await client.connect()
    const db = client.db('trend')
    const dailyCollection = db.collection('daily')

    // 1. daily 컬렉션의 전체 데이터 샘플
    const sampleDaily = await dailyCollection.find({}).limit(10).toArray()

    // 2. daily 컬렉션의 스키마 분석
    const schemaAnalysis = await dailyCollection.aggregate([
      { $sample: { size: 100 } },
      {
        $project: {
          keys: { $objectToArray: "$$ROOT" }
        }
      },
      { $unwind: "$keys" },
      {
        $group: {
          _id: "$keys.k",
          count: { $sum: 1 },
          sampleValues: { $addToSet: "$keys.v" }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray()

    // 3. 데이터 개수 및 날짜 범위 확인
    const totalCount = await dailyCollection.countDocuments({})

    // 4. 날짜별 그룹핑 (만약 날짜 필드가 있다면)
    const dateFields = schemaAnalysis.filter(field =>
      field._id && (field._id.includes('date') || field._id.includes('time') || field._id.includes('created'))
    )

    let dateDistribution = null
    if (dateFields.length > 0) {
      const dateField = dateFields[0]._id
      dateDistribution = await dailyCollection.aggregate([
        {
          $group: {
            _id: `$${dateField}`,
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: -1 } },
        { $limit: 20 }
      ]).toArray()
    }

    return NextResponse.json({
      success: true,
      analysis: {
        totalDailyRecords: totalCount,
        sampleData: sampleDaily,
        schemaAnalysis: schemaAnalysis,
        dateDistribution: dateDistribution,
        availableFields: schemaAnalysis.map(field => ({
          field: field._id,
          frequency: field.count,
          sampleValue: Array.isArray(field.sampleValues) ? field.sampleValues[0] : field.sampleValues
        }))
      }
    })

  } catch (error) {
    console.error('Daily collection analysis error:', error)
    return NextResponse.json(
      { success: false, error: 'Analysis failed', details: error.message },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}