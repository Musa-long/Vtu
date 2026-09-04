# Quicktopup Communication v2

Next-version front-end prototype with:
- Customer registration and login
- Customer wallet balance
- Wallet funding/deposit requests
- Transaction history
- Airtime/data purchase flow
- Admin login and dashboard
- Customer list
- Deposit approval/rejection
- Admin-editable deposit settings
- Admin-editable selling prices

## Demo admin
Email: admin@quicktopup.local
Password: admin123

## Important
This version stores data in browser localStorage so it is suitable for demonstration only. It is NOT safe for real customer money.

For production, move authentication, wallet balances, transactions and admin actions to a server/database; hash passwords server-side; add role-based access control, CSRF protection, rate limiting, server-side validation, audit logs, payment gateway/webhooks and the VTU provider API. Never put secret API keys in browser code.
