# Permissions in Cardiophylla

## Some General Thoughts
- The admin is allowed to do anything
- Registered/invited users are allowed to perform some actions
- Guests might see some data but will probably have no further permissions.

## Permissions on Gardens
- Create
- Read
- Update
- Delete
- Grant read permission
- Grant update permission
- Grant delete permission
- Grant create plan permission

## Permissions on Garden Plans
- Create
- Read
- Update
- Delete
- Grant read permission
- Grant update permission
- Grant delete permission

## Permissions for Guests
- Read gardens if granted by a privileged user
- Read garden plans if granted by a privileged user

## Permissions for Registered Users
- Permissions for guests
- Create gardens
- All "permissions on gardens" for its creator
- The "permissions on gardens" as granted by a privileged user
- All "permissions on garden plans" for its creator
- The "permissions on garden plans" as granted by a privileged user
- Update user (only oneself)

## Permissions for Administrators
- All aforementioned permissions
- Invite users
- Update users (all users, except password change &rarr; reset via re-invitation)
- Deactivate users
