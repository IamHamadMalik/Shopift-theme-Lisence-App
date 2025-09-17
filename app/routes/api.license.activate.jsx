import { json } from "@remix-run/node";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";

export async function action({ request }) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { admin } = await authenticate.admin(request);
    const formData = await request.formData();
    const licenseKey = formData.get("licenseKey");
    const domain = formData.get("domain");
    const themeId = formData.get("themeId");

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
        isActive: true,
        themeId: themeId || null
      },
      create: {
        licenseKey,
        domain,
        themeId: themeId || null,
        isActive: true
      }
    });

    // Update license record
    await prisma.license.update({
      where: { licenseKey },
      data: {
        domain,
        isActive: true,
        activatedAt: new Date(),
        themeId: themeId || null
      }
    });

    // Store activation in theme metafields
    try {
      const shopDomain = domain.replace('.myshopify.com', '');
      
      // Create metafield for license activation
      const metafieldData = {
        metafield: {
          namespace: "theme_license",
          key: "activation_status",
          value: JSON.stringify({
            activated: true,
            licenseKey,
            activatedAt: new Date().toISOString(),
            domain
          }),
          type: "json"
        }
      };

      // If themeId is provided, attach to specific theme
      if (themeId) {
        await admin.rest.resources.Metafield.save({
          session: admin.session,
          owner_resource: "theme",
          owner_id: themeId,
          ...metafieldData
        });
      } else {
        // Store as shop metafield if no specific theme
        await admin.rest.resources.Metafield.save({
          session: admin.session,
          ...metafieldData
        });
      }

    } catch (metafieldError) {
      console.error("Metafield creation error:", metafieldError);
      // Don't fail the activation if metafield creation fails
    }

    return json({
      success: true,
      message: "License activated successfully",
      activation: {
        licenseKey,
        domain,
        activatedAt: activation.activatedAt,
        themeId
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
