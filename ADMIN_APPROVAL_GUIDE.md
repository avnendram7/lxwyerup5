# 🔐 Admin Dashboard - New Law Firm Approval Guide

## ✅ NEW LAW FIRM APPLICATION ADDED!

### 📋 Law Firm Details:
- **Firm Name:** Singh & Associates Legal Consultants
- **Email:** contact@singhassociates.com  
- **Password:** LawFirm@123
- **Location:** Gurugram, Haryana
- **Specialization:** Corporate Law, M&A, Contract Law, Banking Law
- **Established:** 2016
- **Total Lawyers:** 18
- **Bar Council Registration:** GGN/2016/88990
- **Status:** ⏳ Pending Approval

---

## 🔑 ADMIN LOGIN CREDENTIALS:

**Email:** admin@nyaaysathi.com  
**Password:** admin123

**Admin Dashboard URL:** `/admin-dashboard` or `/admin-login`

---

## 📝 STEP-BY-STEP APPROVAL PROCESS:

### Step 1: Login to Admin Dashboard
1. Go to: `https://legalflow-50.preview.emergentagent.com/admin-login`
2. Enter credentials:
   - Email: `admin@nyaaysathi.com`
   - Password: `admin123`
3. Click "Secure Login"

### Step 2: Navigate to Law Firms Section
1. Once logged in, you'll see the admin dashboard
2. Click on "Law Firms" tab in the navigation
3. You'll see all law firm applications

### Step 3: Find the New Application
Look for:
- **Firm Name:** Singh & Associates Legal Consultants
- **Status:** Pending (will be highlighted in yellow/amber)
- **Email:** contact@singhassociates.com

### Step 4: Review Details
- Click on the application to view full details
- Review:
  - Firm information
  - Specialization areas
  - Bar Council registration
  - Established year
  - Total lawyers

### Step 5: Approve the Application
1. Click the "Approve" button (green button)
2. Confirmation message will appear
3. The firm will be moved to approved list
4. A user account will be created automatically

### Step 6: Law Firm Can Now Login!
After approval, the law firm can login at:
- **URL:** `/lawfirm-login`
- **Email:** contact@singhassociates.com
- **Password:** LawFirm@123

---

## 🎯 TESTING THE COMPLETE WORKFLOW:

### Test 1: Admin Approval
```bash
1. Admin Login → Law Firms Tab → Find Application → Approve
```

### Test 2: Law Firm Login (After Approval)
```bash
1. Go to /lawfirm-login
2. Email: contact@singhassociates.com
3. Password: LawFirm@123
4. Access Law Firm Dashboard
```

---

## 📊 ALL ADMIN CREDENTIALS:

### Admin Access:
- Email: admin@nyaaysathi.com
- Password: admin123

### New Law Firm (After Approval):
- Email: contact@singhassociates.com
- Password: LawFirm@123

---

## 🔄 TO ADD MORE LAW FIRMS:

Run the script again with different firm details:
```bash
cd /app/backend
python add_pending_lawfirm.py
```

Or manually insert into `lawfirm_applications` collection with status: "pending"

---

## ⚠️ IMPORTANT NOTES:

1. **Admin password is:** `admin123` (not Admin@123)
2. **Application must be in:** `lawfirm_applications` collection
3. **Status must be:** "pending" for it to appear in pending list
4. **After approval:** User is created in `users` collection with `user_type: 'law_firm'`
5. **Law firm can login at:** `/lawfirm-login` route

---

## 🗄️ DATABASE COLLECTIONS:

- **lawfirm_applications** - Pending applications
- **users** - Approved law firms (user_type: 'law_firm')

---

**Last Updated:** January 22, 2026  
**Application Status:** Ready for Admin Approval ✅
