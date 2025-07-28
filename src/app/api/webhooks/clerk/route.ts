import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ใช้ service role key
)

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.text()
  const body = JSON.parse(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '')

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    try {
      // สร้าง user ใน Supabase
      const { data, error } = await supabase
        .from('users')
        .insert({
          clerk_id: id, // เก็บ Clerk user ID ใน clerk_id column
          email: email_addresses[0]?.email_address,
          avatar_url: image_url,
          credits: 100, // เริ่มต้นด้วย 0 credits
          // id จะเป็น UUID auto-generate
          // created_at จะใช้ default value
        })

      if (error) {
        console.error('Error creating user in Supabase:', error)
        return new Response('Error creating user', { status: 500 })
      }

      console.log('User created successfully:', data)
    } catch (error) {
      console.error('Error processing webhook:', error)
      return new Response('Error processing webhook', { status: 500 })
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    try {
      // อัพเดท user ใน Supabase
      const { data, error } = await supabase
        .from('users')
        .update({
          email: email_addresses[0]?.email_address,
          avatar_url: image_url,
        })
        .eq('clerk_id', id) // ใช้ clerk_id ในการหา record

      if (error) {
        console.error('Error updating user in Supabase:', error)
        return new Response('Error updating user', { status: 500 })
      }

      console.log('User updated successfully:', data)
    } catch (error) {
      console.error('Error processing webhook:', error)
      return new Response('Error processing webhook', { status: 500 })
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data

    try {
      // ลบ user จาก Supabase (หรือทำ soft delete)
      const { data, error } = await supabase
        .from('users')
        .delete()
        .eq('clerk_id', id) // ใช้ clerk_id ในการหา record

      if (error) {
        console.error('Error deleting user in Supabase:', error)
        return new Response('Error deleting user', { status: 500 })
      }

      console.log('User deleted successfully:', data)
    } catch (error) {
      console.error('Error processing webhook:', error)
      return new Response('Error processing webhook', { status: 500 })
    }
  }

  return new Response('', { status: 200 })
}