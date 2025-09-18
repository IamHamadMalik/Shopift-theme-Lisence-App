// COMMENTED OUT: License generation is now handled by client using BIG Digital Downloads app
/*
import { json } from "@remix-run/node";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";
import crypto from "crypto";

export async function action({ request }) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    await authenticate.admin(request);
    const formData = await request.formData();
    const count = parseInt(formData.get("count")) || 1;

    if (count > 100) {
      return json({
        success: false,
        error: "Cannot generate more than 100 licenses at once"
      }, { status: 400 });
    }

    const licenses = [];

    for (let i = 0; i < count; i++) {
      // Generate unique license key
      const licenseKey = `TL-${crypto.randomBytes(8).toString('hex').toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
      
      const license = await prisma.license.create({
        data: {
          licenseKey,
          isActive: false
        }
      });

      licenses.push(license);
    }

    return json({
      success: true,
      message: `Generated ${count} license key${count > 1 ? 's' : ''}`,
      licenses: licenses.map(l => ({
        id: l.id,
        licenseKey: l.licenseKey,
        createdAt: l.createdAt
      }))
    });

  } catch (error) {
    console.error("License creation error:", error);
    return json(
      { 
        success: false, 
        error: "Internal server error" 
      },
      { status: 500 }
    );
  }
}
*/

// This endpoint is no longer used - license creation is handled externally
export async function action({ request }) {
  return new Response("License generation is handled externally", { status: 410 });
}
