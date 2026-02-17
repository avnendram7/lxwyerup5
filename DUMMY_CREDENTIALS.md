# Lxwyer Up - Test Credentials

## 🔐 Login Credentials

### Law Firms (Login as Law Firm)
| Firm Name | Email | Password |
|-----------|-------|----------|
| Shah & Associates | contact@shahandassociates.com | LawFirm@123 |
| Mehta Legal Solutions | info@mehtalegal.com | LawFirm@123 |
| Reddy & Partners | contact@reddypartners.com | LawFirm@123 |
| Kumar Law Chambers | info@kumarlawchambers.com | LawFirm@123 |
| Patel & Co Legal Advisors | contact@patellegal.com | LawFirm@123 |

### Independent Lawyers (Login as Lawyer)
| Name | Email | Password |
|------|-------|----------|
| Adv. Priya Sharma | priya.sharma@shahandassociates.com | Lawyer@123 |
| Adv. Rajesh Verma | rajesh.verma@mehtalegal.com | Lawyer@123 |
| Adv. Sanjay Reddy | sanjay.reddy@reddypartners.com | Lawyer@123 |
| Adv. Anita Kumar | anita.kumar@kumarlawchambers.com | Lawyer@123 |
| Adv. Vikram Patel | vikram.patel@patellegal.com | Lawyer@123 |
| Adv. Meera Desai | meera.desai@shahandassociates.com | Lawyer@123 |
| Adv. Arjun Nair | arjun.nair@mehtalegal.com | Lawyer@123 |

### Firm Lawyers (Login as Lawyer - works at a law firm)
| Name | Firm | Email | Password |
|------|------|-------|----------|
| Adv. Neha Gupta | Shah & Associates | neha.gupta@shahandassociates.com | FirmLawyer@123 |
| Adv. Rahul Singh | Mehta Legal Solutions | rahul.singh@mehtalegal.com | FirmLawyer@123 |
| Adv. Kavya Krishnan | Reddy & Partners | kavya.krishnan@reddypartners.com | FirmLawyer@123 |
| Adv. Amit Joshi | Kumar Law Chambers | amit.joshi@kumarlawchambers.com | FirmLawyer@123 |
| Adv. Pooja Shah | Patel & Co Legal Advisors | pooja.shah@patellegal.com | FirmLawyer@123 |

### Clients (Login as User)
| Name | Email | Password | Assigned Firm | Assigned Lawyer |
|------|-------|----------|---------------|-----------------|
| Rajesh Kumar | rajesh.kumar@example.com | Client@123 | Shah & Associates | Adv. Neha Gupta |
| Sunita Devi | sunita.devi@example.com | Client@123 | Mehta Legal Solutions | Adv. Rahul Singh |
| Amit Patel | amit.patel@example.com | Client@123 | Reddy & Partners | Adv. Kavya Krishnan |
| Priya Reddy | priya.reddy@example.com | Client@123 | Kumar Law Chambers | Adv. Amit Joshi |
| Vikram Singh | vikram.singh@example.com | Client@123 | Patel & Co Legal Advisors | Adv. Pooja Shah |
### Law Firm Clients (Login as Firm Client - via /firm-client-login)
|| Name | Email | Password | Firm |
||------|-------|----------|------|
|| Test Client | testclient@example.com | Test@123 | Test Firm |

### Firm Lawyers (Login as Firm Lawyer - via /login or /firm-lawyer-login)
|| Name | Email | Password | Firm |
||------|-------|----------|------|
|| Adv. Rahul Verma | firmlawyer@test.com | Test@123 | Shah & Associates |

## 🧪 Testing Instructions

### Test Login Flow:
1. Go to http://localhost:3000/login
2. Select your role (User, Lawyer, or Law Firm)
3. Enter email and password from the table above
4. Click "Login" button
5. You should be redirected to the appropriate dashboard

### Test Registration/Application Flow:
1. Go to http://localhost:3000/role-selection
2. Click "GET STARTED" for your desired role
3. Follow the multi-step forms to complete registration/application

### Quick Test Commands:

**Test Client Login:**
```bash
curl -X POST "$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2)/api/auth/login" \
-H "Content-Type: application/json" \
-d '{"email":"rajesh.kumar@example.com","password":"Client@123","user_type":"client"}'
```

**Test Lawyer Login:**
```bash
curl -X POST "$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2)/api/auth/login" \
-H "Content-Type: application/json" \
-d '{"email":"priya.sharma@shahandassociates.com","password":"Lawyer@123","user_type":"lawyer"}'
```

**Test Law Firm Login:**
```bash
curl -X POST "$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2)/api/auth/login" \
-H "Content-Type: application/json" \
-d '{"email":"contact@shahandassociates.com","password":"LawFirm@123","user_type":"law_firm"}'
```

**Test Firm Client Login:**
```bash
curl -X POST "$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2)/api/firm-clients/login" \
-H "Content-Type: application/json" \
-d '{"email":"testclient@example.com","password":"Test@123"}'
```

## 📝 Notes:
- All passwords follow the format: `[RoleType]@123`
- Backend API is at: `${REACT_APP_BACKEND_URL}/api`
- Frontend is at: `http://localhost:3000`

## Admin Credentials
| Email | Password |
|-------|----------|
| admin@lxwyerup.com | admin123 |

## Law Firm Client Login Flow
Law firm clients must be approved by admin before they can login:
1. Client signs up via "Join Firm" page (/join-firm/{firmId})
2. Client's status is set to `pending_approval`
3. Admin approves via Admin Dashboard → Firm Clients tab
4. Client can now login at /firm-client-login
