-- Allow authenticated users to create a tenant (account setup flow).
-- The API ensures a user can only create one tenant (getTenantByUserId check).
create policy "authenticated can create tenant"
  on tenants for insert
  with check (auth.uid() is not null);

-- Allow users to link themselves to a tenant (insert own row in tenant_users).
create policy "user can insert own tenant link"
  on tenant_users for insert
  with check (user_id = auth.uid());
