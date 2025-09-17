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

    if (!licenseKey) {
      return json(
        { 
          success: false, 
          error: "License key is required" 
        },
        { status: 400 }
      );
    }

    // Delete all activation records for this license
    await prisma.licenseActivation.deleteMany({
      where: {
        licenseKey
      }
    });

    // Delete the main license record
    await prisma.license.delete({
      where: {
        licenseKey
      }
    });

    return json({
      success: true,
      message: "License deleted permanently",
      deletedLicense: {
        licenseKey
      }
    });

  } catch (error) {
    console.error("License deletion error:", error);
    return json(
      { 
        success: false, 
        error: "Internal server error" 
      },
      { status: 500 }
    );
  }
}
