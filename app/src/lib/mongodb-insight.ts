import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = 'mongodb://ara:dkfkakstp~!23@10.100.100.10:3004/test?authSource=admin';

let client: MongoClient | null = null;
let trendDb: Db | null = null;

export async function connectToTrendDatabase() {
  try {
    if (!client) {
      client = new MongoClient(MONGODB_URI);
      await client.connect();
    }

    if (!trendDb) {
      trendDb = client.db('trend');
    }

    return trendDb;
  } catch (error) {
    console.error('Failed to connect to trend database:', error);
    throw new Error('Database connection failed');
  }
}

export async function getVideoCollection() {
  const db = await connectToTrendDatabase();
  return db.collection('da');
}

export async function getDailyInsightsCollection() {
  const db = await connectToTrendDatabase();
  return db.collection('daily');
}

export async function disconnectFromTrendDatabase() {
  if (client) {
    await client.close();
    client = null;
    trendDb = null;
  }
}

// Database query helpers
export class InsightQueries {
  static async getDashboardMetrics(languages?: string[], dateRange?: { start: Date; end: Date }) {
    const videoCollection = await getVideoCollection();

    let matchQuery: any = {};

    // Support both legacy location field and new lang field
    if (languages && languages.length > 0) {
      matchQuery.$or = [
        { lang: { $in: languages } },
        { location: { $in: languages } } // Backward compatibility
      ];
    }

    if (dateRange) {
      // Database stores dates as ISO strings, so compare as strings
      matchQuery.createdat = {
        $gte: dateRange.start.toISOString(),
        $lte: dateRange.end.toISOString()
      };
    }

    const [metrics] = await videoCollection.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalVideos: { $sum: 1 },
          uniqueChannels: { $addToSet: '$channel' },
          uniqueCreators: { $addToSet: '$streamer_nickname' },
          avgSentiment: { $avg: '$sentiment' },
          avgHarm: { $avg: '$harm' },
          scriptsAvailable: { $sum: { $cond: ['$isscript', 1, 0] } },
          languages: { $addToSet: { $ifNull: ['$lang', '$location'] } },
          // New social media metrics
          totalViews: { $sum: { $ifNull: ['$views', 0] } },
          totalLikes: { $sum: { $ifNull: ['$likes', 0] } },
          totalComments: { $sum: { $ifNull: ['$comment', 0] } }
        }
      },
      {
        $project: {
          totalVideos: 1,
          totalChannels: { $size: '$uniqueChannels' },
          totalCreators: { $size: '$uniqueCreators' },
          avgSentiment: { $round: ['$avgSentiment', 2] },
          harmContentPercentage: { $round: [{ $multiply: ['$avgHarm', 100] }, 1] },
          scriptsAvailable: 1,
          topLanguages: '$languages',
          // New social media metrics
          totalViews: 1,
          totalLikes: 1,
          totalComments: 1,
          avgEngagementRate: {
            $round: [{
              $cond: [
                { $gt: ['$totalViews', 0] },
                { $multiply: [{ $divide: [{ $add: ['$totalLikes', '$totalComments'] }, '$totalViews'] }, 100] },
                0
              ]
            }, 2]
          }
        }
      }
    ]).toArray();

    return metrics || {
      totalVideos: 0,
      totalChannels: 0,
      totalCreators: 0,
      avgSentiment: 0,
      harmContentPercentage: 0,
      scriptsAvailable: 0,
      topLanguages: [],
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      avgEngagementRate: 0
    };
  }

  static async getTrendData(languages?: string[], days: number = 14) {
    const videoCollection = await getVideoCollection();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let matchQuery: any = {
      createdat: { $gte: startDate.toISOString() }
    };

    // Support both new lang field and legacy location field
    if (languages && languages.length > 0) {
      matchQuery.$or = [
        { lang: { $in: languages } },
        { location: { $in: languages } } // Backward compatibility
      ];
    }

    const trendData = await videoCollection.aggregate([
      { $match: matchQuery },
      {
        $addFields: {
          // 날짜를 단순하게 문자열로 처리 (createdat이 이미 ISO string 형태일 경우)
          dateOnly: {
            $substr: ['$createdat', 0, 10] // "2024-01-15T10:30:00.000Z" → "2024-01-15"
          }
        }
      },
      {
        $group: {
          _id: '$dateOnly',
          videoCount: { $sum: 1 },
          avgSentiment: { $avg: '$sentiment' },
          // 더 단순하고 정확한 harmful content 계산
          harmContent: { $sum: { $cond: [{ $gt: ['$harm', 0.1] }, 1, 0] } },
          // 디버깅을 위한 추가 정보
          maxHarm: { $max: '$harm' },
          minHarm: { $min: '$harm' },
          totalHarmful: { $sum: { $cond: [{ $gt: ['$harm', 0] }, 1, 0] } }
        }
      },
      {
        $project: {
          date: '$_id',
          videoCount: 1,
          sentiment: { $round: ['$avgSentiment', 3] },
          harmContent: 1,
          maxHarm: { $round: ['$maxHarm', 3] },
          minHarm: { $round: ['$minHarm', 3] },
          totalHarmful: 1
        }
      },
      { $sort: { date: 1 } }
    ]).toArray();

    // 디버깅을 위해 console.log 추가
    console.log('Trend Data Debug:', trendData.slice(0, 3));

    return trendData.map(item => ({
      date: item.date,
      sentiment: item.sentiment || 0,
      videoCount: item.videoCount || 0,
      harmContent: item.harmContent || 0,
      // 디버깅 정보 임시 추가
      debug: {
        maxHarm: item.maxHarm,
        minHarm: item.minHarm,
        totalHarmful: item.totalHarmful
      }
    }));
  }

  static async getLocationStats(dateRange?: { start: Date; end: Date }) {
    const videoCollection = await getVideoCollection();

    let matchQuery: any = {};
    if (dateRange) {
      // Database stores dates as ISO strings, so compare as strings
      matchQuery.createdat = {
        $gte: dateRange.start.toISOString(),
        $lte: dateRange.end.toISOString()
      };
    }

    const locationStats = await videoCollection.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$location',
          videoCount: { $sum: 1 },
          avgSentiment: { $avg: '$sentiment' },
          harmContent: { $sum: { $cond: [{ $gt: ['$harm', 0.1] }, 1, 0] } },
          channels: { $addToSet: '$channel' }
        }
      },
      {
        $project: {
          location: '$_id',
          videoCount: 1,
          avgSentiment: { $round: ['$avgSentiment', 2] },
          harmContent: 1,
          topChannels: { $slice: ['$channels', 5] }
        }
      },
      { $sort: { videoCount: -1 } }
    ]).toArray();

    return locationStats.map(stat => ({
      location: stat.location,
      videoCount: stat.videoCount,
      avgSentiment: stat.avgSentiment,
      harmContent: stat.harmContent,
      topChannels: stat.topChannels
    }));
  }

  static async getLanguageStats(dateRange?: { start: Date; end: Date }) {
    const videoCollection = await getVideoCollection();

    let matchQuery: any = {};
    if (dateRange) {
      // Database stores dates as ISO strings, so compare as strings
      matchQuery.createdat = {
        $gte: dateRange.start.toISOString(),
        $lte: dateRange.end.toISOString()
      };
    }

    const languageStats = await videoCollection.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $ifNull: ['$lang', '$location'] }, // Use lang if available, fallback to location
          videoCount: { $sum: 1 },
          avgSentiment: { $avg: '$sentiment' },
          harmContent: { $sum: { $cond: [{ $gt: ['$harm', 0.1] }, 1, 0] } },
          channels: { $addToSet: '$channel' },
          streamers: { $addToSet: '$streamer_nickname' },
          // New social media metrics
          totalViews: { $sum: { $ifNull: ['$views', 0] } },
          totalLikes: { $sum: { $ifNull: ['$likes', 0] } },
          totalComments: { $sum: { $ifNull: ['$comment', 0] } }
        }
      },
      {
        $project: {
          lang: '$_id',
          videoCount: 1,
          avgSentiment: { $round: ['$avgSentiment', 2] },
          harmContent: 1,
          topChannels: { $slice: ['$channels', 5] },
          topStreamers: { $slice: ['$streamers', 5] },
          totalViews: 1,
          totalLikes: 1,
          totalComments: 1,
          avgEngagementRate: {
            $round: [{
              $cond: [
                { $gt: ['$totalViews', 0] },
                { $multiply: [{ $divide: [{ $add: ['$totalLikes', '$totalComments'] }, '$totalViews'] }, 100] },
                0
              ]
            }, 2]
          }
        }
      },
      { $sort: { videoCount: -1 } }
    ]).toArray();

    return languageStats.map(stat => ({
      lang: stat.lang,
      videoCount: stat.videoCount,
      avgSentiment: stat.avgSentiment,
      harmContent: stat.harmContent,
      topChannels: stat.topChannels,
      topStreamers: stat.topStreamers,
      totalViews: stat.totalViews,
      totalLikes: stat.totalLikes,
      totalComments: stat.totalComments,
      avgEngagementRate: stat.avgEngagementRate
    }));
  }

  static async getRecentVideos(limit: number = 10, locations?: string[]) {
    const videoCollection = await getVideoCollection();

    let matchQuery: any = {};
    if (locations && locations.length > 0) {
      matchQuery.location = { $in: locations };
    }

    return await videoCollection
      .find(matchQuery)
      .sort({ createdat: -1 })
      .limit(limit)
      .toArray();
  }

  static async getDailyInsights(locations?: string[], limit: number = 7) {
    const dailyCollection = await getDailyInsightsCollection();
    const videoCollection = await getVideoCollection();

    let matchQuery: any = {};
    if (locations && locations.length > 0) {
      // Handle locations that might be comma-separated strings
      matchQuery.$or = [
        { location: { $in: locations } },
        { location: { $regex: locations.join('|'), $options: 'i' } }
      ];
    }

    const dailyInsights = await dailyCollection
      .find(matchQuery)
      .sort({ date: -1 })
      .limit(limit)
      .toArray();

    // 각 daily insight에 대해 실제 활성 채널 수 계산 및 비디오 컨텐츠 추가
    for (const insight of dailyInsights) {
      const startDate = new Date(insight.date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      let videoMatchQuery: any = {
        createdat: {
          $gte: startDate.toISOString(),
          $lt: endDate.toISOString()
        }
      };

      // 실제 활성 채널 수 계산
      if (!insight.totalActiveChannels) {
        const uniqueChannels = await videoCollection.distinct('channel', videoMatchQuery);
        insight.totalActiveChannels = uniqueChannels.length;
      }

      // 해당 날짜의 비디오 컨텐츠 가져오기 (da 컬렉션에서 직접)
      const videoContent = await videoCollection
        .find(videoMatchQuery, {
          projection: {
            title: 1,
            channel: 1,
            streamer_nickname: 1,
            url: 1,
            views: 1,
            likes: 1,
            comment: 1,
            sentiment: 1,
            harm: 1,
            createdat: 1,
            relevance: 1,
            summary: 1, // 비디오 요약
            description: 1, // 비디오 설명
            thumbnail_url: 1, // 썸네일 URL
            script: 1, // 스크립트
            script_kr: 1 // 한국어 스크립트
          }
        })
        .sort({ relevance: -1, views: -1 }) // 관련도 높은 순, 조회수 높은 순
        .limit(20)
        .toArray();

      insight.videoContent = videoContent;

      // totalVideos를 실제 비디오 컨텐츠 배열 길이와 일치시키거나,
      // 실제 총 비디오 수를 별도로 계산
      const actualTotalVideos = await videoCollection.countDocuments(videoMatchQuery);

      // totalVideos는 실제 총 개수, displayedVideos는 화면에 보여지는 개수로 분리
      insight.totalVideos = actualTotalVideos;
      insight.displayedVideos = videoContent.length;
    }

    return dailyInsights;
  }

  static async getTopChannels(languages?: string[], limit: number = 10) {
    const videoCollection = await getVideoCollection();

    let matchQuery: any = {};
    if (languages && languages.length > 0) {
      matchQuery.$or = [
        { lang: { $in: languages } },
        { location: { $in: languages } } // Backward compatibility
      ];
    }

    const topChannels = await videoCollection.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$channel',
          videoCount: { $sum: 1 },
          avgSentiment: { $avg: '$sentiment' },
          avgRelevance: { $avg: '$relevance' },
          totalHarm: { $sum: '$harm' },
          totalViews: { $sum: { $ifNull: ['$views', 0] } },
          totalLikes: { $sum: { $ifNull: ['$likes', 0] } }
        }
      },
      {
        $project: {
          channel: '$_id',
          videoCount: 1,
          avgSentiment: { $round: ['$avgSentiment', 2] },
          avgRelevance: { $round: ['$avgRelevance', 2] },
          totalHarm: 1,
          totalViews: 1,
          totalLikes: 1,
          avgEngagementRate: {
            $round: [{
              $cond: [
                { $gt: ['$totalViews', 0] },
                { $multiply: [{ $divide: ['$totalLikes', '$totalViews'] }, 100] },
                0
              ]
            }, 2]
          }
        }
      },
      { $sort: { videoCount: -1 } },
      { $limit: limit }
    ]).toArray();

    return topChannels.map(channel => ({
      name: channel.channel,
      videoCount: channel.videoCount,
      avgSentiment: channel.avgSentiment,
      avgRelevance: channel.avgRelevance,
      totalHarm: channel.totalHarm,
      totalViews: channel.totalViews,
      totalLikes: channel.totalLikes,
      avgEngagementRate: channel.avgEngagementRate
    }));
  }

  // New methods for social media analytics
  static async getSocialMediaMetrics(languages?: string[], dateRange?: { start: Date; end: Date }) {
    const videoCollection = await getVideoCollection();

    let matchQuery: any = {};
    if (languages && languages.length > 0) {
      matchQuery.$or = [
        { lang: { $in: languages } },
        { location: { $in: languages } }
      ];
    }

    if (dateRange) {
      matchQuery.createdat = {
        $gte: dateRange.start.toISOString(),
        $lte: dateRange.end.toISOString()
      };
    }

    const [metrics] = await videoCollection.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalViews: { $sum: { $ifNull: ['$views', 0] } },
          totalLikes: { $sum: { $ifNull: ['$likes', 0] } },
          totalComments: { $sum: { $ifNull: ['$comment', 0] } },
          videoCount: { $sum: 1 }
        }
      },
      {
        $project: {
          totalViews: 1,
          totalLikes: 1,
          totalComments: 1,
          avgEngagementRate: {
            $round: [{
              $cond: [
                { $gt: ['$totalViews', 0] },
                { $multiply: [{ $divide: [{ $add: ['$totalLikes', '$totalComments'] }, '$totalViews'] }, 100] },
                0
              ]
            }, 2]
          },
          avgViewsPerVideo: { $round: [{ $divide: ['$totalViews', '$videoCount'] }, 0] },
          avgLikesPerVideo: { $round: [{ $divide: ['$totalLikes', '$videoCount'] }, 0] },
          avgCommentsPerVideo: { $round: [{ $divide: ['$totalComments', '$videoCount'] }, 0] }
        }
      }
    ]).toArray();

    // Get top performing videos
    const topVideos = await videoCollection.aggregate([
      { $match: matchQuery },
      {
        $project: {
          title: 1,
          views: { $ifNull: ['$views', 0] },
          likes: { $ifNull: ['$likes', 0] },
          comments: { $ifNull: ['$comment', 0] },
          engagementRate: {
            $round: [{
              $cond: [
                { $gt: [{ $ifNull: ['$views', 0] }, 0] },
                { $multiply: [{ $divide: [{ $add: [{ $ifNull: ['$likes', 0] }, { $ifNull: ['$comment', 0] }] }, { $ifNull: ['$views', 1] }] }, 100] },
                0
              ]
            }, 2]
          }
        }
      },
      { $sort: { engagementRate: -1 } },
      { $limit: 5 }
    ]).toArray();

    return {
      ...(metrics || {
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        avgEngagementRate: 0,
        avgViewsPerVideo: 0,
        avgLikesPerVideo: 0,
        avgCommentsPerVideo: 0
      }),
      topPerformingVideos: topVideos.map(video => ({
        title: video.title,
        views: video.views,
        likes: video.likes,
        engagementRate: video.engagementRate
      }))
    };
  }

  static async getCreatorAnalytics(languages?: string[], dateRange?: { start: Date; end: Date }) {
    const videoCollection = await getVideoCollection();

    let matchQuery: any = {
      streamer_nickname: { $exists: true, $ne: null, $ne: '' }
    };

    if (languages && languages.length > 0) {
      matchQuery.$or = [
        { lang: { $in: languages } },
        { location: { $in: languages } }
      ];
    }

    if (dateRange) {
      matchQuery.createdat = {
        $gte: dateRange.start.toISOString(),
        $lte: dateRange.end.toISOString()
      };
    }

    const topCreators = await videoCollection.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$streamer_nickname',
          videoCount: { $sum: 1 },
          avgSentiment: { $avg: '$sentiment' },
          totalViews: { $sum: { $ifNull: ['$views', 0] } },
          totalLikes: { $sum: { $ifNull: ['$likes', 0] } },
          totalComments: { $sum: { $ifNull: ['$comment', 0] } },
          languages: { $addToSet: { $ifNull: ['$lang', '$location'] } }
        }
      },
      {
        $project: {
          name: '$_id',
          videoCount: 1,
          avgSentiment: { $round: ['$avgSentiment', 2] },
          totalViews: 1,
          totalLikes: 1,
          avgEngagementRate: {
            $round: [{
              $cond: [
                { $gt: ['$totalViews', 0] },
                { $multiply: [{ $divide: [{ $add: ['$totalLikes', '$totalComments'] }, '$totalViews'] }, 100] },
                0
              ]
            }, 2]
          },
          languages: 1
        }
      },
      { $sort: { totalViews: -1 } },
      { $limit: 10 }
    ]).toArray();

    // Get creators by language
    const creatorsByLanguage = await videoCollection.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $ifNull: ['$lang', '$location'] },
          creators: { $addToSet: '$streamer_nickname' },
          totalViews: { $sum: { $ifNull: ['$views', 0] } }
        }
      },
      {
        $project: {
          lang: '$_id',
          creatorCount: { $size: '$creators' },
          avgViewsPerCreator: {
            $round: [{
              $cond: [
                { $gt: [{ $size: '$creators' }, 0] },
                { $divide: ['$totalViews', { $size: '$creators' }] },
                0
              ]
            }, 0]
          }
        }
      },
      { $sort: { creatorCount: -1 } }
    ]).toArray();

    return {
      totalCreators: topCreators.length,
      topCreators: topCreators,
      creatorsByLanguage: creatorsByLanguage
    };
  }

  static async getEngagementAnalytics(languages?: string[], dateRange?: { start: Date; end: Date }) {
    const videoCollection = await getVideoCollection();

    let matchQuery: any = {};
    if (languages && languages.length > 0) {
      matchQuery.$or = [
        { lang: { $in: languages } },
        { location: { $in: languages } }
      ];
    }

    if (dateRange) {
      matchQuery.createdat = {
        $gte: dateRange.start.toISOString(),
        $lte: dateRange.end.toISOString()
      };
    }

    // Get engagement trends over time
    const engagementTrends = await videoCollection.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdat'
              }
            }
          },
          totalViews: { $sum: { $ifNull: ['$views', 0] } },
          totalLikes: { $sum: { $ifNull: ['$likes', 0] } },
          totalComments: { $sum: { $ifNull: ['$comment', 0] } }
        }
      },
      {
        $project: {
          date: '$_id.date',
          avgEngagementRate: {
            $round: [{
              $cond: [
                { $gt: ['$totalViews', 0] },
                { $multiply: [{ $divide: [{ $add: ['$totalLikes', '$totalComments'] }, '$totalViews'] }, 100] },
                0
              ]
            }, 2]
          }
        }
      },
      { $sort: { date: 1 } }
    ]).toArray();

    // Get top engagement videos
    const topEngagementVideos = await videoCollection.aggregate([
      { $match: matchQuery },
      {
        $project: {
          title: 1,
          views: { $ifNull: ['$views', 0] },
          likes: { $ifNull: ['$likes', 0] },
          comments: { $ifNull: ['$comment', 0] },
          engagementRate: {
            $round: [{
              $cond: [
                { $gt: [{ $ifNull: ['$views', 0] }, 0] },
                { $multiply: [{ $divide: [{ $add: [{ $ifNull: ['$likes', 0] }, { $ifNull: ['$comment', 0] }] }, { $ifNull: ['$views', 1] }] }, 100] },
                0
              ]
            }, 2]
          }
        }
      },
      { $sort: { engagementRate: -1 } },
      { $limit: 10 }
    ]).toArray();

    return {
      engagementTrends: engagementTrends,
      topEngagementVideos: topEngagementVideos
    };
  }
}