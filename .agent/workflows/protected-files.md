---
description: Protected/locked files that should NOT be modified without careful review
---

# Protected Files - DO NOT MODIFY

The following files are critical to the SMS purchase functionality and should NOT be modified casually.

## Locked Files

### 1. Service Mapping
- **File**: `src/lib/smspool_service_mapping.ts`
- **Purpose**: Static mapping of 1,327 service names to SMSPool service IDs
- **Risk**: Modifying this file incorrectly will break ALL service purchases
- **Last verified**: 2026-02-06

### 2. Buy API Route
- **File**: `src/app/api/buy/route.ts`
- **Purpose**: Core purchase flow - user auth, balance check, SMSPool purchase, order creation
- **Risk**: Any change could break purchases, cause double charges, or lose money

### 3. Cancel API Route
- **File**: `src/app/api/cancel/route.ts`
- **Purpose**: Order cancellation and refund logic
- **Risk**: Bugs could prevent refunds or cause double refunds

### 4. Check API Route
- **File**: `src/app/api/check/route.ts`
- **Purpose**: Polls SMSPool for incoming SMS codes
- **Risk**: Breaking this prevents users from receiving their verification codes

### 5. SMSPool Client
- **File**: `src/lib/providers/SMSPoolClient.ts`
- **Purpose**: Low-level SMSPool API integration
- **Risk**: Any change affects all SMS operations

### 6. Dashboard Main Page
- **File**: `src/app/dashboard/page.tsx`
- **Purpose**: Core user dashboard, order management, service selection
- **Risk**: Changes here can break the entire user experience

### 7. Verification Modal
- **File**: `src/components/VerificationModal.tsx`
- **Purpose**: Displays SMS code and timer. Core value delivery UI.
- **Risk**: Bugs here mean users can't see their codes

### 8. Deposit Section
- **File**: `src/components/DepositSection.tsx`
- **Purpose**: Crypto payment UI
- **Risk**: Breaking this blocks revenue

### 9. Service Data
- **File**: `src/app/dashboard/services_data.ts`
- **Purpose**: Service prices and metadata
- **Risk**: Incorrect prices or IDs break purchases

## Before Modifying Any Protected File

1. **Make a backup first**: `cp file.ts file.ts.backup`
2. **Test in development**: Verify purchases still work
3. **Get approval**: Review changes carefully before deploying
4. **Document changes**: Add comments explaining what and why

## Regenerating Service Mapping

If you need to update the service mapping:
```bash
node scripts/generate_smspool_mapping.mjs > src/lib/smspool_service_mapping.ts
```
Then manually clean up the console log lines at the top of the file.
