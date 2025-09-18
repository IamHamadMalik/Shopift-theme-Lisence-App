import { json } from "@remix-run/node";
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

    // Check if license key already exists in the system
    const existingLicense = await prisma.license.findUnique({
      where: { licenseKey }
    });

    if (existingLicense) {
      return json({
        success: false,
        error: "This license key already exists. Please enter a unique license key."
      });
    }

    // Check if license key already exists in activations
    const existingActivation = await prisma.licenseActivation.findFirst({
      where: { licenseKey }
    });

    if (existingActivation) {
      return json({
        success: false,
        error: "This license key already exists. Please enter a unique license key."
      });
    }

    // Create new license record
    const license = await prisma.license.create({
      data: {
        licenseKey,
        domain,
        isActive: true,
        activatedAt: new Date()
      }
    });

    // Create new activation record
    const activation = await prisma.licenseActivation.create({
      data: {
        licenseKey,
        domain,
        isActive: true
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
