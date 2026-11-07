# Neon migration

- [x] Connect the user's Neon database and inspect destination tables.
- [x] Inventory the current application data: profiles, draw history, catalog and catalog page queue.
- [ ] Copy and verify existing application data. Blocked: awaiting the user's database export from Lovable Cloud's Export data screen; do not recreate a full export with scripts or SQL tools.
- [ ] Switch application data access and catalog synchronization to the Neon connector after the copy is verified. Keep the current sign-in service and validate user ownership server-side.
- [ ] Test signed-in profile/history persistence, catalog filtering and catalog synchronization against Neon before reporting migration complete.

The app still uses its existing database. No source data or Neon Auth tables have been changed.