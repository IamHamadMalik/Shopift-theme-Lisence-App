import { json } from "@remix-run/node";
import prisma from "../db.server";

export async function loader({ request }) {
  const url = new URL(request.url);
  const licenseKey = url.searchParams.get("license");
  const domain = url.searchParams.get("domain");

  if (!licenseKey || !domain) {
    return json(
      { 
        success: false, 
        error: "License key and domain are required" 
      },
      { status: 400 }
    );
  }

  try {
    // Check if license exists and is valid
    const license = await prisma.license.findUnique({
      where: { licenseKey }
    });

    if (!license) {
      return json({
        success: false,
        error: "Invalid license key"
      });
    }

    // Check if license is already activated for this domain
    const activation = await prisma.licenseActivation.findUnique({
      where: {
        licenseKey_domain: {
          licenseKey,
          domain
        }
      }
    });

    if (activation && activation.isActive) {
      return json({
        success: true,
        activated: true,
        domain: activation.domain,
        activatedAt: activation.activatedAt
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

    return json({
      success: true,
      activated: false,
      canActivate: true
    });

  } catch (error) {
    console.error("License validation error:", error);
    return json(
      { 
        success: false, 
        error: "Internal server error" 
      },
      { status: 500 }
    );
  }
}
