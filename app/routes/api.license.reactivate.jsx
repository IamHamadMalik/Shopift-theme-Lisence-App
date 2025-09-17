import { json } from "@remix-run/node";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";

export async function action({ request }) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    await authenticate.admin(request);
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
      message: "License reactivated successfully!",
      activation: {
        licenseKey,
        domain,
        activatedAt: activation.activatedAt
      }
    });

  } catch (error) {
    console.error("License reactivation error:", error);
    return json(
      { 
        success: false, 
        error: "Internal server error" 
      },
      { status: 500 }
    );
  }
}
