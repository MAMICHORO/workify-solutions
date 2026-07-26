# Workify Solutions Final Frontend

This build provides a complete working frontend using browser localStorage.

## Working features
- Client enquiries save and appear in Admin
- Vacancies can be created, published, closed, or deleted
- Job applications save and appear in Admin
- Projects can be created, updated, and deleted
- Workers can be created and availability updated
- Admin search, tabs, statuses, and reset work
- Data persists in the same browser

## Run
```powershell
npm install
npm run dev
```

## Production note
To make this multi-user and internet-ready, replace localStorage with Supabase and add authentication, storage, email, and access controls. The visible frontend controls are operational now.
