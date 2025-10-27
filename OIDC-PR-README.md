# OIDC Workload Identity Federation Setup Guide

This document provides step-by-step instructions for configuring OIDC-based authentication with Google Cloud Platform (GCP) for GitHub Actions CI/CD workflows.

## Why OIDC?

**Benefits of OIDC Workload Identity Federation:**
- ✅ **No long-lived credentials**: Eliminates the need to store and manage JSON service account keys
- ✅ **Enhanced security**: Tokens are short-lived and automatically rotated
- ✅ **Simplified key management**: No need to manually rotate or delete JSON keys
- ✅ **Better audit trail**: GCP logs show exactly which GitHub repository/workflow triggered actions
- ✅ **Principle of least privilege**: Fine-grained control over which repositories can access your service account

## Prerequisites Checklist

Before merging this PR, the maintainer **MUST** complete the following steps in GCP:

### 1. Create a Service Account

Create a dedicated service account for GitHub Actions:

```bash
# Set your project ID
export PROJECT_ID="your-project-id"

# Create service account
gcloud iam service-accounts create github-actions-ci \
    --project="${PROJECT_ID}" \
    --description="Service account for GitHub Actions CI/CD" \
    --display-name="GitHub Actions CI"

# Export the service account email for later use
export SERVICE_ACCOUNT="github-actions-ci@${PROJECT_ID}.iam.gserviceaccount.com"
```

### 2. Grant Minimal Required Roles

Grant only the minimum permissions needed for your CI/CD pipeline:

```bash
# For Firebase Admin SDK operations (adjust based on your needs)
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/firebase.admin"

# For Cloud Storage access (if needed)
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/storage.objectAdmin"

# For Firestore access (if needed)
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/datastore.user"
```

**⚠️ Security Note**: Review and adjust these roles based on your specific requirements. Only grant what's absolutely necessary.

### 3. Create Workload Identity Pool

```bash
# Get your project number
export PROJECT_NUMBER=$(gcloud projects describe ${PROJECT_ID} --format="value(projectNumber)")

# Create workload identity pool
gcloud iam workload-identity-pools create "github-actions-pool" \
    --project="${PROJECT_ID}" \
    --location="global" \
    --description="Workload Identity Pool for GitHub Actions" \
    --display-name="GitHub Actions Pool"
```

### 4. Create Workload Identity Provider

```bash
# Set your GitHub organization/user and repository name
export GITHUB_ORG="Kiyoshiakira"
export GITHUB_REPO="Bonnie-Lass-Florals"

# Create the OIDC provider
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
    --project="${PROJECT_ID}" \
    --location="global" \
    --workload-identity-pool="github-actions-pool" \
    --display-name="GitHub Provider" \
    --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
    --attribute-condition="assertion.repository_owner == '${GITHUB_ORG}'" \
    --issuer-uri="https://token.actions.githubusercontent.com"
```

### 5. Bind Service Account to Workload Identity

Grant the `roles/iam.workloadIdentityUser` role to allow the GitHub repository to impersonate the service account:

```bash
# Allow only the specific repository to use this service account
gcloud iam service-accounts add-iam-policy-binding "${SERVICE_ACCOUNT}" \
    --project="${PROJECT_ID}" \
    --role="roles/iam.workloadIdentityUser" \
    --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github-actions-pool/attribute.repository/${GITHUB_ORG}/${GITHUB_REPO}"
```

**🔐 Security**: This binding ensures that **only** your specific GitHub repository can authenticate as this service account.

### 6. Update Workflow File

Update the placeholder values in `.github/workflows/nodejs.yml`:

```yaml
- name: Authenticate to GCP via Workload Identity (OIDC)
  uses: google-github-actions/auth@v1
  with:
    workload_identity_provider: "projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions-pool/providers/github-provider"
    service_account: "github-actions-ci@PROJECT_ID.iam.gserviceaccount.com"
```

Replace:
- `PROJECT_NUMBER` with your GCP project number (from step 3)
- `PROJECT_ID` with your GCP project ID (your actual project ID, e.g., "bonnie-lass-florals")

To get these values:
```bash
echo "Project ID: ${PROJECT_ID}"
echo "Project Number: ${PROJECT_NUMBER}"
echo ""
echo "Full workload_identity_provider value:"
echo "projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github-actions-pool/providers/github-provider"
echo ""
echo "Full service_account value:"
echo "${SERVICE_ACCOUNT}"
```

## Verification Steps

### Verify Local Configuration

```bash
# List workload identity pools
gcloud iam workload-identity-pools list \
    --location="global" \
    --project="${PROJECT_ID}"

# Describe your workload identity pool
gcloud iam workload-identity-pools describe "github-actions-pool" \
    --location="global" \
    --project="${PROJECT_ID}"

# List providers
gcloud iam workload-identity-pools providers list \
    --workload-identity-pool="github-actions-pool" \
    --location="global" \
    --project="${PROJECT_ID}"

# Verify service account IAM bindings
gcloud iam service-accounts get-iam-policy "${SERVICE_ACCOUNT}" \
    --project="${PROJECT_ID}"
```

### Verify CI Authentication

1. **Update the workflow file** with your actual PROJECT_NUMBER and PROJECT_ID values
2. **Commit and push** the changes to your repository
3. **Trigger the workflow** by pushing to the branch or creating a pull request
4. **Monitor the workflow run** in GitHub Actions:
   - Navigate to: `https://github.com/${GITHUB_ORG}/${GITHUB_REPO}/actions`
   - Check that the "Authenticate to GCP via Workload Identity (OIDC)" step succeeds
5. **Check GCP audit logs** to verify authentication:
   ```bash
   gcloud logging read "protoPayload.authenticationInfo.principalEmail=\"${SERVICE_ACCOUNT}\"" \
       --project="${PROJECT_ID}" \
       --limit=10 \
       --format=json
   ```

## Clean Up Old Credentials

After successfully verifying OIDC authentication:

### 1. Delete Old Service Account Keys

```bash
# List all keys for the service account (if any exist)
gcloud iam service-accounts keys list \
    --iam-account="${SERVICE_ACCOUNT}" \
    --project="${PROJECT_ID}"

# Delete specific keys (replace KEY_ID with actual key ID from list command)
gcloud iam service-accounts keys delete KEY_ID \
    --iam-account="${SERVICE_ACCOUNT}" \
    --project="${PROJECT_ID}"
```

### 2. Remove GitHub Secret

After confirming OIDC works:
1. Go to your GitHub repository settings: `https://github.com/${GITHUB_ORG}/${GITHUB_REPO}/settings/secrets/actions`
2. **Delete** the `FIREBASE_SERVICE_ACCOUNT_JSON` secret (it's no longer needed)

### 3. Revoke Old Service Account (if applicable)

If you were using a different service account with JSON keys:

```bash
# List service accounts to find the old one
gcloud iam service-accounts list --project="${PROJECT_ID}"

# Delete the old service account (replace OLD_SA_EMAIL with the old service account email)
gcloud iam service-accounts delete OLD_SA_EMAIL --project="${PROJECT_ID}"
```

## Troubleshooting

### Common Issues

**Problem**: "Error: google-github-actions/auth failed with: retry function failed after X attempts"

**Solution**: 
- Verify the workload identity provider path is correct
- Ensure the service account email is correct
- Check that the repository attribute condition matches your GitHub org/user

**Problem**: "Error: Permission denied"

**Solution**:
- Verify the service account has the necessary IAM roles
- Check the `roles/iam.workloadIdentityUser` binding is correctly set
- Ensure the `permissions` section in the workflow includes `id-token: write`

**Problem**: "The workflow must have write access to 'id-token'"

**Solution**:
- Add the `permissions:` section to your workflow job (already included in the updated workflow)

### Debug Commands

```bash
# Check if workload identity pool exists
gcloud iam workload-identity-pools describe github-actions-pool \
    --location=global \
    --project="${PROJECT_ID}"

# Check provider configuration
gcloud iam workload-identity-pools providers describe github-provider \
    --location=global \
    --workload-identity-pool=github-actions-pool \
    --project="${PROJECT_ID}"

# Verify service account permissions
gcloud projects get-iam-policy ${PROJECT_ID} \
    --flatten="bindings[].members" \
    --filter="bindings.members:serviceAccount:${SERVICE_ACCOUNT}"
```

## Security Best Practices

1. **Use attribute conditions**: Restrict which repositories can authenticate (already configured)
2. **Least privilege**: Grant only the minimum required IAM roles
3. **Monitor access**: Regularly review GCP audit logs for service account usage
4. **Separate environments**: Use different service accounts for dev/staging/production
5. **Regular audits**: Periodically review and rotate workload identity bindings

## Additional Resources

- [Google Cloud Workload Identity Federation Documentation](https://cloud.google.com/iam/docs/workload-identity-federation)
- [GitHub Actions OIDC Documentation](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [google-github-actions/auth Action](https://github.com/google-github-actions/auth)

## Support

For issues or questions:
- Check the [GitHub Actions logs](https://github.com/${GITHUB_ORG}/${GITHUB_REPO}/actions)
- Review [GCP audit logs](https://console.cloud.google.com/logs)
- Consult the [troubleshooting section](#troubleshooting) above

---

**Last Updated**: 2025-10-27
