import axios from 'axios';

export interface YouTubeConfig {
  clientId: string;
  clientSecret: string;
}

export class YouTubeClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async uploadVideo(videoBuffer: Buffer, metadata: {
    title: string;
    description: string;
    privacyStatus?: 'public' | 'unlisted' | 'private';
  }) {
    // 1. Initialize resumable upload
    const initResponse = await axios.post(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
      {
        snippet: {
          title: metadata.title,
          description: metadata.description,
          categoryId: '22', // People & Blogs
        },
        status: {
          privacyStatus: metadata.privacyStatus || 'unlisted'
        }
      },
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'X-Upload-Content-Type': 'video/*',
        }
      }
    );

    const uploadUrl = initResponse.headers.location;

    // 2. Upload video content
    const uploadResponse = await axios.put(uploadUrl, videoBuffer, {
      headers: {
        'Content-Type': 'video/*',
      }
    });

    return {
      videoId: uploadResponse.data.id,
      url: `https://www.youtube.com/watch?v=${uploadResponse.data.id}`,
      embedUrl: `https://www.youtube.com/embed/${uploadResponse.data.id}`
    };
  }

  static async refreshAccessToken(config: YouTubeConfig, refreshToken: string) {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    });
    return response.data;
  }
}
