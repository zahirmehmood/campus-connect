export const env = {
  dataMode: import.meta.env.VITE_DATA_MODE ?? 'mock',
  awsRegion: import.meta.env.VITE_AWS_REGION ?? '',
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID ?? '',
  userPoolClientId: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID ?? '',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '',
  uploadBucketName: import.meta.env.VITE_UPLOAD_BUCKET_NAME ?? '',
} as const

export const isMockMode = env.dataMode !== 'aws'

export function assertAwsConfiguration() {
  const missing = [
    ['VITE_AWS_REGION', env.awsRegion],
    ['VITE_COGNITO_USER_POOL_ID', env.userPoolId],
    ['VITE_COGNITO_USER_POOL_CLIENT_ID', env.userPoolClientId],
    ['VITE_API_BASE_URL', env.apiBaseUrl],
  ].filter(([, value]) => !value).map(([key]) => key)

  if (missing.length) {
    throw new Error(`AWS mode is missing: ${missing.join(', ')}`)
  }
}
