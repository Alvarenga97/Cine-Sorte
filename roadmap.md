# Neon migration

- [x] Connect the user's Neon database and inspect destination tables.
- [x] Inventory the current application data: profiles, draw history, catalog and catalog page queue.
- [ ] Copy and verify the application data from the uploaded database export; exclude managed authentication tables and credentials.
- [ ] Switch application data access and catalog synchronization to the Neon connector after the copy is verified. Keep the current sign-in service and validate user ownership server-side.
- [ ] Test signed-in profile/history persistence, catalog filtering and catalog synchronization against Neon before reporting migration complete.

The uploaded export is available. Preserve the source database and Neon Auth tables throughout the migration.