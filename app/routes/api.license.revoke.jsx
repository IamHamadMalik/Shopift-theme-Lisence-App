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

    // Delete the license activation
    await prisma.licenseActivation.deleteMany({
      where: {
        licenseKey,
        domain
      }
    });

    // Update the main license record to inactive
    await prisma.license.updateMany({
      where: {
        licenseKey,
        domain
      },
      data: {
        isActive: false,
        domain: null,
        activatedAt: null
      }
    });

    return json({
      success: true,
      message: "License revoked successfully",
      revokedLicense: {
        licenseKey,
        domain
      }
    });

  } catch (error) {
    console.error("License revocation error:", error);
    return json(
      { 
        success: false, 
        error: "Internal server error" 
      },
      { status: 500 }
    );
  }
}
