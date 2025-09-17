import { useState } from "react";
import { json } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import {
  Page,
  Card,
  FormLayout,
  TextField,
  Button,
  Banner,
  Text,
  BlockStack,
  InlineStack,
  Divider
} from "@shopify/polaris";
import prisma from "../db.server";

export async function action({ request }) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    const licenseKey = formData.get("licenseKey");
    const domain = formData.get("domain");

    if (!licenseKey || !domain) {
      return json(
        { 
          success: false, 
          error: "License key and domain are required" 
        },
        { status: 400 }
      );
    }

    // Validate domain format (.myshopify.com)
    if (!domain.endsWith('.myshopify.com')) {
      return json({
        success: false,
        error: "Domain must be a valid .myshopify.com domain"
      });
    }

    // Check if license exists
    const license = await prisma.license.findUnique({
      where: { licenseKey }
    });

    if (!license) {
      return json({
        success: false,
        error: "Invalid license key"
      });
    }

    // Check if license is already activated for a different domain
    const existingActivation = await prisma.licenseActivation.findFirst({
      where: {
        licenseKey,
        isActive: true
      }
    });

    if (existingActivation && existingActivation.domain !== domain) {
      return json({
        success: false,
        error: `License is already activated for domain: ${existingActivation.domain}`
      });
    }

    // Create or update activation
    const activation = await prisma.licenseActivation.upsert({
      where: {
        licenseKey_domain: {
          licenseKey,
          domain
        }
      },
      update: {
        isActive: true
      },
      create: {
        licenseKey,
        domain,
        isActive: true
      }
    });

    // Update license record
    await prisma.license.update({
      where: { licenseKey },
      data: {
        domain,
        isActive: true,
        activatedAt: new Date()
      }
    });

    return json({
      success: true,
      message: "License activated successfully! You can now refresh your theme.",
      activation: {
        licenseKey,
        domain,
        activatedAt: activation.activatedAt
      }
    });

  } catch (error) {
    console.error("License activation error:", error);
    return json(
      { 
        success: false, 
        error: "Internal server error" 
      },
      { status: 500 }
    );
  }
}

export default function ActivatePage() {
  const actionData = useActionData();
  const [licenseKey, setLicenseKey] = useState("");
  const [domain, setDomain] = useState("");
  const [isActivating, setIsActivating] = useState(false);

  const handleActivation = async () => {
    if (!licenseKey || !domain) {
      return;
    }

    setIsActivating(true);

    try {
      const formData = new FormData();
      formData.append("licenseKey", licenseKey);
      formData.append("domain", domain);

      const response = await fetch("/activate", {
        method: "POST",
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        setLicenseKey("");
        setDomain("");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{ maxWidth: "500px", width: "100%" }}>
        <Card>
          <BlockStack gap="500">
            <div style={{ textAlign: "center" }}>
              <Text variant="headingLg" as="h1">
                🔐 Theme License Activation
              </Text>
              <Text variant="bodyMd" color="subdued">
                Activate your premium theme license to unlock all features
              </Text>
            </div>

            {actionData && (
              <Banner
                status={actionData.success ? "success" : "critical"}
                onDismiss={() => {}}
              >
                {actionData.success 
                  ? actionData.message 
                  : actionData.error}
              </Banner>
            )}

            <FormLayout>
              <TextField
                label="License Key"
                value={licenseKey}
                onChange={setLicenseKey}
                placeholder="TL-XXXXXXXX-XXXXXXXX"
                autoComplete="off"
                helpText="Enter the license key provided with your theme"
              />
              
              <TextField
                label="Your Shop Domain"
                value={domain}
                onChange={setDomain}
                placeholder="your-shop.myshopify.com"
                helpText="Enter your complete Shopify domain (including .myshopify.com)"
              />
              
              <InlineStack align="center">
                <Button
                  variant="primary"
                  size="large"
                  onClick={handleActivation}
                  loading={isActivating}
                  disabled={!licenseKey || !domain}
                >
                  Activate License
                </Button>
              </InlineStack>
            </FormLayout>

            <Divider />

            <div style={{ textAlign: "center" }}>
              <Text variant="bodySm" color="subdued">
                Need help? Contact support at{" "}
                <a href="mailto:support@yourthemestore.com">
                  support@yourthemestore.com
                </a>
              </Text>
            </div>
          </BlockStack>
        </Card>
      </div>
    </div>
  );
}
