import type { APIGatewayProxyHandler } from 'aws-lambda'
import { randomUUID } from 'node:crypto'
import { S3Client } from '@aws-sdk/client-s3'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import { handleError, parseBody, principalFrom, response } from '../shared/http'
import { uploadSchema } from '../shared/schemas'

const s3 = new S3Client({})
const bucket = process.env.UPLOADS_BUCKET
if (!bucket) throw new Error('UPLOADS_BUCKET is required')

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const principal = principalFrom(event)
    const input = parseBody(event, uploadSchema)
    const extension = input.fileName.toLowerCase().match(/\.(jpg|jpeg|png|webp|pdf)$/)?.[1] ?? 'bin'
    const key = `${input.purpose}/${principal.userId}/${randomUUID()}.${extension}`
    const upload = await createPresignedPost(s3, {
      Bucket: bucket,
      Key: key,
      Expires: 300,
      Fields: { 'Content-Type': input.contentType },
      Conditions: [
        ['content-length-range', 1, input.size],
        ['eq', '$Content-Type', input.contentType],
      ],
    })
    return response(200, { ...upload, key, expiresIn: 300 })
  } catch (error) { return handleError(error) }
}
