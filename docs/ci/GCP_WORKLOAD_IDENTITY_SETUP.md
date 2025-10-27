# GCP Workload Identity Federation Setup for GitHub Actions

This guide provides step-by-step instructions to configure Google Cloud Workload Identity Federation (OIDC) for GitHub Actions CI/CD. This allows GitHub Actions workflows to authenticate to Google Cloud without using long-lived service account JSON keys.

## Overview

**What you'll accomplish:**
- Create a Workload Identity Pool in Google Cloud Console
- Create a Workload Identity Provider for GitHub OIDC
- Configure attribute mappings and conditions
- Grant the CI service account necessary IAM permissions
- Configure GitHub repository secrets

**Prerequisites:**
- Access to Google Cloud Console with permissions to manage Workload Identity and IAM
- Admin access to the GitHub repository settings
- A Google Cloud project (e.g., `bonnie-lass-florals`)

## Architecture

```
GitHub Actions Workflow
    ↓ (OIDC token)
GitHub OIDC Provider (in Workload Identity Pool)
    ↓ (federated identity)
Service Account (ci-github-sa)
    ↓ (authenticated calls)
Google Cloud APIs (Firebase, Storage, etc.)
```

## Step 1: Create a Workload Identity Pool

1. **Navigate to IAM & Admin** in Google Cloud Console
   - Go to [console.cloud.google.com](https://console.cloud.google.com)
   - Select your project (e.g., `bonnie-lass-florals`)
   - In the left sidebar, click **IAM & Admin** → **Workload Identity Federation**

2. **Create a new pool** (if not already created)
   - Click **Create Pool** button at the top
   - Enter pool details:
     - **Pool name:** `github-pool`
     - **Pool ID:** `github-pool` (auto-generated from name)
     - **Description:** `Workload Identity Pool for GitHub Actions OIDC authentication`
     - **Enable pool:** ✅ (checked)
   - Click **Continue**

3. **Save the Pool ID** for later use
   - After creation, note the full resource name (shown on the pool details page)
   - Format: `projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool`

## Step 2: Create a Workload Identity Provider

1. **Add a provider to the pool**
   - In the Workload Identity Federation page, click on your pool name (`github-pool`)
   - Click **Add Provider** button

2. **Configure the provider**
   - **Select provider type:** Select **OpenID Connect (OIDC)**
   - Click **Continue**

3. **Enter provider details:**
   - **Provider name:** `github-oidc-provider`
   - **Provider ID:** `github-oidc-provider` (auto-generated)
   - **Issuer (URL):** `https://token.actions.githubusercontent.com`
     - ⚠️ **Important:** Use exactly this URL (GitHub's OIDC issuer)
   - **Allowed audiences:** Leave as **Default audience** or specify `https://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/providers/github-oidc-provider`
     - The default audience is recommended for simplicity
   - Click **Continue**

## Step 3: Configure Attribute Mappings (CRITICAL)

**⚠️ IMPORTANT:** You **must** configure attribute mappings **before** adding attribute conditions. This is a common source of errors.

The error message "The attribute condition must reference one of the provider's claims" occurs when you try to use an attribute in a condition that hasn't been mapped yet.

1. **Add attribute mappings** (on the "Configure provider attributes" page):

   Click **Add Mapping** for each of the following:

   | Google Attribute | CEL Expression | Purpose |
   |------------------|----------------|---------|
   | `google.subject` | `assertion.sub` | Unique identifier for the GitHub workflow |
   | `attribute.repository` | `assertion.repository` | Maps to GitHub repository (e.g., `Kiyoshiakira/Bonnie-Lass-Florals`) |
   | `attribute.actor` | `assertion.actor` | Maps to the GitHub user who triggered the workflow |
   | `attribute.aud` | `assertion.aud` | Maps to the audience claim |

   **How to add each mapping:**
   - Click **Add Mapping**
   - Enter the **Google attribute** (e.g., `google.subject`)
   - Enter the **CEL expression** (e.g., `assertion.sub`)
   - Click outside the fields to save
   - Repeat for all mappings above

2. **Why these mappings matter:**
   - `google.subject`: Required by GCP to uniquely identify the federated identity
   - `attribute.repository`: Allows you to restrict access to specific GitHub repositories
   - `attribute.actor`: Allows you to track which GitHub user triggered the workflow
   - `attribute.aud`: Maps the audience for additional validation

3. **Click Continue** after adding all mappings

## Step 4: Configure Attribute Conditions

After mappings are configured, you can optionally add conditions to restrict which workflows can authenticate.

1. **Add attribute condition** (optional but recommended):
   ```
   assertion.repository == 'Kiyoshiakira/Bonnie-Lass-Florals'
   ```
   
   This ensures only workflows from your specific repository can authenticate.

2. **More restrictive condition examples** (optional):
   ```
   # Restrict to main branch only
   assertion.repository == 'Kiyoshiakira/Bonnie-Lass-Florals' && assertion.ref == 'refs/heads/main'
   
   # Restrict to specific workflow file
   assertion.repository == 'Kiyoshiakira/Bonnie-Lass-Florals' && assertion.workflow == 'CI with GCP OIDC Auth'
   ```

3. **Click Save** to create the provider

## Step 5: Create or Configure the Service Account

1. **Navigate to Service Accounts**
   - In Google Cloud Console, go to **IAM & Admin** → **Service Accounts**

2. **Create a new service account** (if not already created)
   - Click **Create Service Account**
   - **Service account name:** `ci-github-sa`
   - **Service account ID:** `ci-github-sa` (auto-generated)
   - **Description:** `Service account for GitHub Actions CI/CD with OIDC authentication`
   - Click **Create and Continue**

3. **Skip granting access** for now (we'll do this in the next step)
   - Click **Continue** → **Done**

4. **Note the service account email:**
   - Format: `ci-github-sa@PROJECT_ID.iam.gserviceaccount.com`
   - Example: `ci-github-sa@bonnie-lass-florals.iam.gserviceaccount.com`

## Step 6: Bind the Service Account to the Workload Identity Pool

This step allows the federated identity from GitHub to impersonate the service account.

1. **Grant the `Workload Identity User` role**
   - Still in the Service Accounts page, click on your service account (`ci-github-sa`)
   - Go to the **Permissions** tab
   - Click **Grant Access**

2. **Add the principal:**
   - In the "Add principals" field, enter the **principalSet**:
     ```
     principalSet://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/attribute.repository/Kiyoshiakira/Bonnie-Lass-Florals
     ```
     
     **Replace `PROJECT_NUMBER`** with your actual GCP project number (find this in the Console dashboard or project settings).
     
   - **How to find your project number:**
     1. Go to the [Cloud Console Home](https://console.cloud.google.com/home/dashboard)
     2. Your project number is shown on the dashboard (e.g., `123456789012`)

3. **Select the role:**
   - Click **Select a role**
   - Search for and select: **Service Account** → **Workload Identity User**
   - Role name: `roles/iam.workloadIdentityUser`

4. **Click Save**

## Step 7: Grant Service Account Permissions

Grant the service account the minimal IAM roles needed for CI operations.

1. **Navigate to IAM**
   - Go to **IAM & Admin** → **IAM**

2. **Grant permissions** to `ci-github-sa@PROJECT_ID.iam.gserviceaccount.com`:

   Click **Grant Access** and add these roles:

   **Recommended minimal roles for CI:**
   - `roles/firebase.admin` - Firebase Admin (if using Firebase services)
   - `roles/storage.objectViewer` - Storage Object Viewer (read Firebase Storage)
   - `roles/storage.objectCreator` - Storage Object Creator (upload test artifacts if needed)

   **Optional roles** (add as needed):
   - `roles/cloudbuild.builds.builder` - Cloud Build Service Account (if using Cloud Build)
   - `roles/cloudtrace.agent` - Cloud Trace Agent (if using Cloud Trace)
   - `roles/logging.logWriter` - Logs Writer (if writing custom logs)

   ⚠️ **Security Best Practice:** Grant only the minimum permissions required for your CI workflows.

3. **Click Save**

## Step 8: Configure GitHub Repository Secrets

1. **Navigate to your GitHub repository settings**
   - Go to your repository: `https://github.com/Kiyoshiakira/Bonnie-Lass-Florals`
   - Click **Settings** → **Secrets and variables** → **Actions**

2. **Add the following repository secrets:**

   Click **New repository secret** for each:

   **Secret 1: `GCP_WORKLOAD_IDENTITY_PROVIDER`**
   - Name: `GCP_WORKLOAD_IDENTITY_PROVIDER`
   - Value: Full provider resource name
     ```
     projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/providers/github-oidc-provider
     ```
     Replace `PROJECT_NUMBER` with your actual project number.

   **Secret 2: `GCP_SERVICE_ACCOUNT`**
   - Name: `GCP_SERVICE_ACCOUNT`
   - Value: Service account email
     ```
     ci-github-sa@PROJECT_ID.iam.gserviceaccount.com
     ```
     Replace `PROJECT_ID` with your actual GCP project ID (e.g., `bonnie-lass-florals`).

3. **Verify secrets are added**
   - Both secrets should appear in the repository secrets list

## Step 9: Test the Workflow

1. **Trigger the workflow**
   - Push a commit to the `main` or `develop` branch, or
   - Open a pull request targeting `main` or `develop`

2. **Monitor the workflow run**
   - Go to the **Actions** tab in your GitHub repository
   - Click on the latest workflow run
   - Check the **Authenticate to Google Cloud** step:
     - ✅ It should succeed and show "Successfully authenticated to GCP using Workload Identity Federation"
     - ❌ If it fails, see Troubleshooting below

3. **Verify authentication**
   - The **Verify GCP authentication** step should display the `GOOGLE_APPLICATION_CREDENTIALS` environment variable
   - This confirms the Firebase Admin SDK can use Application Default Credentials

## Troubleshooting

### Error: "The attribute condition must reference one of the provider's claims"

**Cause:** You tried to add attribute conditions before configuring attribute mappings.

**Solution:**
1. Go back to your provider settings in the Workload Identity Federation page
2. Click **Edit Provider**
3. Ensure all attribute mappings are configured (see Step 3)
4. Save the provider
5. Then add attribute conditions (see Step 4)

### Error: "Permission denied" or "Service account does not have required permissions"

**Cause:** The service account doesn't have the necessary IAM roles.

**Solution:**
1. Verify the service account has been granted the roles in Step 7
2. Check the specific GCP API/service that's failing and grant appropriate roles
3. Wait a few minutes for IAM changes to propagate

### Error: "Failed to generate OAuth token"

**Cause:** The Workload Identity binding is incorrect or missing.

**Solution:**
1. Verify the principalSet in Step 6 is correct
2. Ensure the project number (not project ID) is used
3. Check that the repository path matches exactly: `Kiyoshiakira/Bonnie-Lass-Florals`

### Error: "Token audience is invalid"

**Cause:** Audience mismatch between GitHub OIDC token and provider configuration.

**Solution:**
1. In the provider configuration, use the **Default audience** option
2. Or explicitly set the allowed audience to match the provider resource name

### Authentication step is skipped

**Cause:** Repository secrets are not configured or have incorrect names.

**Solution:**
1. Verify both secrets exist in GitHub repository settings
2. Ensure secret names are exactly: `GCP_WORKLOAD_IDENTITY_PROVIDER` and `GCP_SERVICE_ACCOUNT`
3. Check for typos in the secret values

## Additional Resources

- [Google Cloud Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)
- [GitHub Actions OIDC with GCP](https://cloud.google.com/blog/products/identity-security/enabling-keyless-authentication-from-github-actions)
- [google-github-actions/auth documentation](https://github.com/google-github-actions/auth)
- [GitHub OIDC Token Claims](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect#understanding-the-oidc-token)

## Security Considerations

1. **Principle of Least Privilege:** Only grant the service account the minimum permissions required
2. **Attribute Conditions:** Use attribute conditions to restrict which repositories/branches can authenticate
3. **Audit Logging:** Enable Cloud Audit Logs to track service account usage
4. **Regular Review:** Periodically review and rotate service account permissions
5. **No Long-Lived Keys:** With OIDC, you never need to generate or store service account JSON keys

## Benefits of OIDC over Service Account Keys

✅ **No secrets to store:** GitHub manages the OIDC tokens automatically  
✅ **Short-lived credentials:** Tokens expire after the workflow completes  
✅ **No key rotation:** No need to rotate service account keys  
✅ **Better security:** Eliminates risk of leaked service account JSON keys  
✅ **Audit trail:** Better tracking of which workflows accessed GCP resources  

## Next Steps

After completing this setup:
1. ✅ Your GitHub Actions workflows can authenticate to GCP using OIDC
2. ✅ Firebase Admin SDK will use Application Default Credentials automatically
3. ✅ No need to store `FIREBASE_SERVICE_ACCOUNT_JSON` secret anymore (for CI)
4. Consider removing the old `FIREBASE_SERVICE_ACCOUNT_JSON` secret from GitHub
5. Update other workflows to use the same OIDC authentication pattern

---

**Questions or Issues?**  
If you encounter problems not covered in this guide, please open an issue in the repository or consult the Google Cloud and GitHub Actions documentation.
