# GitHub Actions → Google Cloud Workload Identity Federation Setup Guide

This guide explains how to set up Workload Identity Federation (WIF) to enable GitHub Actions to authenticate to Google Cloud Platform (GCP) without using long-lived service account keys.

## Why Workload Identity Federation?

Workload Identity Federation provides a more secure way for GitHub Actions to authenticate to GCP by:
- **Eliminating long-lived credentials**: No need to manage and rotate service account JSON keys
- **Using short-lived tokens**: GitHub provides OIDC tokens that expire automatically
- **Following security best practices**: Recommended by Google Cloud for external workloads
- **Reducing security risks**: No risk of accidentally exposing service account keys in logs or code

## Prerequisites

- Google Cloud project (e.g., `bonnie-lass-florals`)
- Admin access to the GCP project
- Admin access to the GitHub repository
- `gcloud` CLI installed (for setup)

## Setup Steps

### 1. Enable Required Google Cloud APIs

```bash
gcloud services enable iamcredentials.googleapis.com \
    --project=bonnie-lass-florals

gcloud services enable sts.googleapis.com \
    --project=bonnie-lass-florals
```

### 2. Create a Workload Identity Pool

```bash
gcloud iam workload-identity-pools create "github-actions-pool" \
    --project="bonnie-lass-florals" \
    --location="global" \
    --display-name="GitHub Actions Pool"
```

### 3. Create a Workload Identity Provider

Replace `GITHUB_ORG` with your GitHub organization or username (e.g., `Kiyoshiakira`):

```bash
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
    --project="bonnie-lass-florals" \
    --location="global" \
    --workload-identity-pool="github-actions-pool" \
    --display-name="GitHub Provider" \
    --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
    --attribute-condition="assertion.repository_owner == 'GITHUB_ORG'" \
    --issuer-uri="https://token.actions.githubusercontent.com"
```

### 4. Create a Service Account (or use existing)

You may already have a service account for Firebase. If not, create one:

```bash
gcloud iam service-accounts create github-actions-sa \
    --project="bonnie-lass-florals" \
    --display-name="GitHub Actions Service Account"
```

Grant necessary permissions to the service account:

```bash
# For Firebase Hosting
gcloud projects add-iam-policy-binding bonnie-lass-florals \
    --member="serviceAccount:github-actions-sa@bonnie-lass-florals.iam.gserviceaccount.com" \
    --role="roles/firebase.admin"

# For Firebase Storage
gcloud projects add-iam-policy-binding bonnie-lass-florals \
    --member="serviceAccount:github-actions-sa@bonnie-lass-florals.iam.gserviceaccount.com" \
    --role="roles/storage.admin"
```

### 5. Allow the Workload Identity Pool to Impersonate the Service Account

Replace `GITHUB_ORG` and `REPO_NAME` with your values (e.g., `Kiyoshiakira/Bonnie-Lass-Florals`):

```bash
gcloud iam service-accounts add-iam-policy-binding \
    "github-actions-sa@bonnie-lass-florals.iam.gserviceaccount.com" \
    --project="bonnie-lass-florals" \
    --role="roles/iam.workloadIdentityUser" \
    --member="principalSet://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions-pool/attribute.repository/GITHUB_ORG/REPO_NAME"
```

**Note**: Get your `PROJECT_NUMBER` by running:
```bash
gcloud projects describe bonnie-lass-florals --format="value(projectNumber)"
```

### 6. Get the Workload Identity Provider Name

```bash
gcloud iam workload-identity-pools providers describe "github-provider" \
    --project="bonnie-lass-florals" \
    --location="global" \
    --workload-identity-pool="github-actions-pool" \
    --format="value(name)"
```

This will output something like:
```
projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions-pool/providers/github-provider
```

### 7. Add GitHub Repository Secrets

In your GitHub repository, go to Settings > Secrets and variables > Actions, and add:

1. **`WIF_PROVIDER`**: The full workload identity provider name from step 6
   ```
   projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions-pool/providers/github-provider
   ```

2. **`WIF_SERVICE_ACCOUNT`**: The service account email
   ```
   github-actions-sa@bonnie-lass-florals.iam.gserviceaccount.com
   ```

### 8. Keep Existing Secrets for Backward Compatibility (Optional)

You may want to keep the old `FIREBASE_SERVICE_ACCOUNT_BONNIE_LASS_FLORALS` secret as a fallback during the transition period. The workflows have been updated to use Workload Identity Federation, but the `firebaseServiceAccount` parameter is still provided for compatibility with the Firebase action.

## Verification

After setup, trigger a GitHub Actions workflow to verify the authentication works:

1. Push a commit to the repository
2. Check the workflow run in the Actions tab
3. Verify the "Authenticate to Google Cloud" step completes successfully
4. Confirm subsequent steps can access GCP resources

## Troubleshooting

### "Failed to generate Google Cloud access token"

- Verify the workload identity provider name is correct in `WIF_PROVIDER` secret
- Ensure the service account email is correct in `WIF_SERVICE_ACCOUNT` secret
- Check that the attribute condition in step 3 matches your GitHub organization

### "Permission denied" errors

- Verify the service account has the necessary IAM roles
- Check that the workload identity pool can impersonate the service account (step 5)

### "Invalid JWT" errors

- Ensure the workflow has `id-token: write` permission
- Verify the OIDC issuer URI is correct (`https://token.actions.githubusercontent.com`)

## Security Considerations

- **Repository Restriction**: The attribute condition restricts authentication to repositories owned by your GitHub organization/user
- **Branch Protection**: Consider restricting which branches can trigger deployments
- **Least Privilege**: Grant only the minimum required IAM roles to the service account
- **Audit Logs**: Monitor Cloud Audit Logs for service account usage

## Migration from Service Account Keys

Once Workload Identity Federation is verified to work:

1. Remove the old service account key secrets from GitHub:
   - `FIREBASE_SERVICE_ACCOUNT_JSON` (used in nodejs.yml)
   - Optionally keep `FIREBASE_SERVICE_ACCOUNT_BONNIE_LASS_FLORALS` if needed by Firebase action

2. Delete or disable the downloaded service account keys in GCP Console

3. Document the change in your team's runbooks

## References

- [Google Cloud Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)
- [GitHub Actions OIDC](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [google-github-actions/auth](https://github.com/google-github-actions/auth)
