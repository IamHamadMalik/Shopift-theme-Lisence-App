import { json } from "@remix-run/node";
import prisma from "../db.server";

export async function loader({ request }) {
  const url = new URL(request.url);
  const domain = url.searchParams.get("domain");

  if (!domain) {
    return json(
      { 
        success: false, 
        activated: false,
        error: "Domain is required" 
      },
      { 
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        }
      }
    );
  }

  try {
    // Check if any license is activated for this domain
    const activation = await prisma.licenseActivation.findFirst({
      where: {
        domain: domain,
        isActive: true
      }
    });

    if (activation) {
      return json({
        success: true,
        activated: true,
        domain: activation.domain,
        activatedAt: activation.activatedAt,
        licenseKey: activation.licenseKey
      }, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        }
      });
    }

    return json({
      success: true,
      activated: false
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      }
    });

  } catch (error) {
    console.error("License check error:", error);
    return json(
      { 
        success: false, 
        activated: false,
        error: "Internal server error" 
      },
      { 
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        }
      }
    );
  }
}
