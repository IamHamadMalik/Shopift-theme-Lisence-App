import { useState } from "react";
import { json } from "@remix-run/node";
import { useLoaderData, useActionData, useSubmit, useNavigation } from "@remix-run/react";
import {
  Page,
  Card,
  FormLayout,
  TextField,
  Button,
  Banner,
  DataTable,
  Text,
  BlockStack,
  InlineStack,
  Divider,
  Badge
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export async function loader({ request }) {
  await authenticate.admin(request);

  // Get all licenses and activations
  const licenses = await prisma.license.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  const activations = await prisma.licenseActivation.findMany({
    where: { isActive: true },
    orderBy: { activatedAt: 'desc' },
    take: 50
  });

  return json({ licenses, activations });
}

export async function action({ request }) {
  const { admin } = await authenticate.admin(request);
  
  return null; // Actions handled by separate API routes
}

export default function LicensePage() {
  const { licenses, activations } = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();
  const navigation = useNavigation();
  
  const [licenseKey, setLicenseKey] = useState("");
  const [domain, setDomain] = useState("");
  const [themeId, setThemeId] = useState("");
  const [generateCount, setGenerateCount] = useState("1");
  const [activationResult, setActivationResult] = useState(null);
  const [isActivating, setIsActivating] = useState(false);

  const handleActivation = async () => {
    if (!licenseKey || !domain) {
      setActivationResult({
        success: false,
        error: "Please enter both license key and domain"
      });
      return;
    }

    setIsActivating(true);
    setActivationResult(null);

    try {
      const formData = new FormData();
      formData.append("licenseKey", licenseKey);
      formData.append("domain", domain);
      if (themeId) formData.append("themeId", themeId);

      const response = await fetch("/api/license/activate", {
        method: "POST",
        body: formData
      });

      const result = await response.json();
      setActivationResult(result);

      if (result.success) {
        setLicenseKey("");
        setDomain("");
        setThemeId("");
        // Refresh the page to show updated data
        window.location.reload();
      }
    } catch (error) {
      setActivationResult({
        success: false,
        error: "Network error occurred"
      });
    } finally {
      setIsActivating(false);
    }
  };

  const handleGenerateLicenses = async () => {
    try {
      const formData = new FormData();
      formData.append("count", generateCount);

      const response = await fetch("/api/license/create", {
        method: "POST",
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh the page to show new licenses
        window.location.reload();
      }
    } catch (error) {
      console.error("Error generating licenses:", error);
    }
  };

  // Prepare data for tables
  const licenseRows = licenses.map(license => [
    license.licenseKey,
    license.domain || "Not activated",
    license.isActive ? <Badge status="success">Active</Badge> : <Badge>Inactive</Badge>,
    new Date(license.createdAt).toLocaleDateString(),
    license.activatedAt ? new Date(license.activatedAt).toLocaleDateString() : "—"
  ]);

  const activationRows = activations.map(activation => [
    activation.licenseKey,
    activation.domain,
    activation.themeId || "—",
    new Date(activation.activatedAt).toLocaleDateString(),
    activation.isActive ? <Badge status="success">Active</Badge> : <Badge status="critical">Inactive</Badge>
  ]);

  return (
    <Page title="Theme License Management">
      <BlockStack gap="500">
        
        {/* License Activation Section */}
        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd">Activate License</Text>
            
            {activationResult && (
              <Banner
                status={activationResult.success ? "success" : "critical"}
                onDismiss={() => setActivationResult(null)}
              >
                {activationResult.success 
                  ? activationResult.message 
                  : activationResult.error}
              </Banner>
            )}

            <FormLayout>
              <TextField
                label="License Key"
                value={licenseKey}
                onChange={setLicenseKey}
                placeholder="TL-XXXXXXXX-XXXXXXXX"
                autoComplete="off"
              />
              
              <TextField
                label="Shop Domain"
                value={domain}
                onChange={setDomain}
                placeholder="your-shop.myshopify.com"
                helpText="Enter the full .myshopify.com domain"
              />
              
              <TextField
                label="Theme ID (Optional)"
                value={themeId}
                onChange={setThemeId}
                placeholder="123456789"
                helpText="Optional: Specific theme ID to attach license to"
              />
              
              <InlineStack align="start">
                <Button
                  variant="primary"
                  onClick={handleActivation}
                  loading={isActivating}
                >
                  Activate License
                </Button>
              </InlineStack>
            </FormLayout>
          </BlockStack>
        </Card>

        <Divider />

        {/* Generate Licenses Section */}
        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd">Generate New Licenses</Text>
            
            <FormLayout>
              <TextField
                label="Number of Licenses"
                type="number"
                value={generateCount}
                onChange={setGenerateCount}
                min="1"
                max="100"
              />
              
              <InlineStack align="start">
                <Button onClick={handleGenerateLicenses}>
                  Generate Licenses
                </Button>
              </InlineStack>
            </FormLayout>
          </BlockStack>
        </Card>

        <Divider />

        {/* All Licenses Table */}
        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd">All Licenses ({licenses.length})</Text>
            
            <DataTable
              columnContentTypes={['text', 'text', 'text', 'text', 'text']}
              headings={['License Key', 'Domain', 'Status', 'Created', 'Activated']}
              rows={licenseRows}
            />
          </BlockStack>
        </Card>

        {/* Active Activations Table */}
        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd">Active Activations ({activations.length})</Text>
            
            <DataTable
              columnContentTypes={['text', 'text', 'text', 'text', 'text']}
              headings={['License Key', 'Domain', 'Theme ID', 'Activated', 'Status']}
              rows={activationRows}
            />
          </BlockStack>
        </Card>

      </BlockStack>
    </Page>
  );
}
