-- Demo admin user (local dev only)
-- Email: admin@nourbeauty.com  |  Password: admin1234
-- Token columns must be '' not NULL or login fails (Go scan error).
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, role, aud,
  confirmation_token, recovery_token,
  email_change, email_change_token_new
) VALUES (
  'b0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'admin@nourbeauty.com',
  crypt('admin1234', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"provider":"email","providers":["email"]}', '{}',
  false, 'authenticated', 'authenticated',
  '', '',
  '', ''
);

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  created_at, updated_at, last_sign_in_at
) VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'admin@nourbeauty.com',
  jsonb_build_object('sub', 'b0000000-0000-0000-0000-000000000001', 'email', 'admin@nourbeauty.com'),
  'email',
  NOW(), NOW(), NOW()
);
