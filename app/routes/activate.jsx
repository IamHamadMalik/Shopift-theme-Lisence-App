import { useState } from "react";

// This route only handles the UI - API logic moved to /api/activate

export default function ActivatePage() {
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

      const response = await fetch("/api/activate", {
        method: "POST",
        body: formData,
        headers: {
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setLicenseKey("");
        setDomain("");
        // Show success message
        alert("License activated successfully! You can now refresh your theme.");
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
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
      padding: "20px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      <div style={{ maxWidth: "500px", width: "100%" }}>
        <div style={{
          background: "white",
          borderRadius: "12px",
          padding: "40px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)"
        }}>
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <h1 style={{ 
              fontSize: "28px", 
              fontWeight: "600", 
              color: "#333", 
              margin: "0 0 10px 0" 
            }}>
              🔐 Theme License Activation
            </h1>
            <p style={{ 
              fontSize: "16px", 
              color: "#666", 
              margin: "0" 
            }}>
              Activate your premium theme license to unlock all features
            </p>
          </div>


          <form onSubmit={(e) => { e.preventDefault(); handleActivation(); }} method="post">
            <div style={{ marginBottom: "20px" }}>
              <label style={{ 
                display: "block", 
                fontSize: "14px", 
                fontWeight: "500", 
                color: "#333", 
                marginBottom: "8px" 
              }}>
                License Key
              </label>
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="TL-XXXXXXXX-XXXXXXXX"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "16px",
                  boxSizing: "border-box"
                }}
                required
              />
              <p style={{ 
                fontSize: "12px", 
                color: "#666", 
                margin: "4px 0 0 0" 
              }}>
                Enter the license key provided with your theme
              </p>
            </div>
            
            <div style={{ marginBottom: "30px" }}>
              <label style={{ 
                display: "block", 
                fontSize: "14px", 
                fontWeight: "500", 
                color: "#333", 
                marginBottom: "8px" 
              }}>
                Your Shop Domain
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="your-shop.myshopify.com"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "16px",
                  boxSizing: "border-box"
                }}
                required
              />
              <p style={{ 
                fontSize: "12px", 
                color: "#666", 
                margin: "4px 0 0 0" 
              }}>
                Enter your complete Shopify domain (including .myshopify.com)
              </p>
            </div>
            
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <button
                type="submit"
                disabled={!licenseKey || !domain || isActivating}
                style={{
                  background: "#007bff",
                  color: "white",
                  border: "none",
                  padding: "14px 28px",
                  borderRadius: "6px",
                  fontSize: "16px",
                  fontWeight: "500",
                  cursor: "pointer",
                  opacity: (!licenseKey || !domain || isActivating) ? 0.6 : 1
                }}
              >
                {isActivating ? "Activating..." : "Activate License"}
              </button>
            </div>
          </form>

          <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "30px 0" }} />

          <div style={{ textAlign: "center" }}>
            <p style={{ 
              fontSize: "14px", 
              color: "#666", 
              margin: "0" 
            }}>
              Need help? Contact support at{" "}
              <a href="mailto:support@yourthemestore.com" style={{ color: "#007bff" }}>
                support@yourthemestore.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
