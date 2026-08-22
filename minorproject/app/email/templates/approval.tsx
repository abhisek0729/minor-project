interface ApprovalEmailTemplateProps {
  ownerName: string;
  businessName: string;
  businessType: "Hotel" | "Restaurant" | "Tour Guide";
  status: "approved" | "rejected";
  dashboardUrl: string;
}

export const approvalEmailTemplate = ({
  ownerName,
  businessName,
  businessType,
  status,
  dashboardUrl,
}: ApprovalEmailTemplateProps) => {
  const isApproved = status === "approved";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${isApproved ? "Workspace Application Approved" : "Workspace Application Update"} - TravelNepal</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
    
    <!-- Header Banner -->
    <div style="background: ${isApproved ? "linear-gradient(135deg, #059669 0%, #0d9488 100%)" : "linear-gradient(135deg, #e11d48 0%, #be123c 100%)"}; padding: 36px 30px; text-align: center; color: #ffffff;">
      <div style="font-size: 32px; margin-bottom: 8px;">${isApproved ? "🎉" : "📋"}</div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.02em;">
        ${isApproved ? "Workspace Approved & Live!" : "Workspace Application Update"}
      </h1>
      <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">
        TravelNepal Partner Program
      </p>
    </div>

    <!-- Main Content -->
    <div style="padding: 32px 30px;">
      <p style="margin: 0 0 16px; font-size: 16px; color: #1e293b; font-weight: 600;">
        Namaste, ${ownerName}!
      </p>

      ${
        isApproved
          ? `
      <p style="margin: 0 0 18px; font-size: 14px; color: #475569; line-height: 1.6;">
        We are thrilled to inform you that your registration for <strong style="color: #0f172a;">${businessName}</strong> as an official <strong style="color: #059669;">${businessType} Partner</strong> has been reviewed and <strong style="color: #059669;">APPROVED</strong> by our administration team!
      </p>

      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 18px; margin: 20px 0;">
        <h3 style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #166534;">
          ✨ What you can do right now:
        </h3>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #15803d; line-height: 1.6;">
          ${
            businessType === "Hotel"
              ? `
            <li>Add and manage your room categories & inventory suites</li>
            <li>Configure nightly pricing, capacities, and seasonal rates</li>
            <li>Accept instant guest bookings with Khalti digital checkout</li>
            <li>Update your interactive Google Maps location coordinates</li>
          `
              : businessType === "Restaurant"
              ? `
            <li>Upload your authentic Food & Drinks menu catalog with pricing</li>
            <li>Set real-time Open/Closed operating status and schedule</li>
            <li>Receive live food orders and table reservation requests</li>
            <li>Showcase your restaurant location and ambiance photos</li>
          `
              : `
            <li>Publish curated multi-day Himalayan tour & trek packages</li>
            <li>Set your daily guiding rates and active calendar availability</li>
            <li>Connect directly with travelers planning personalized treks</li>
          `
          }
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0 20px;">
        <a href="${dashboardUrl}" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 14px; font-weight: 700; border-radius: 50px; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.35);">
          Open My Workspace Dashboard →
        </a>
      </div>
      `
          : `
      <p style="margin: 0 0 18px; font-size: 14px; color: #475569; line-height: 1.6;">
        Thank you for submitting your application for <strong style="color: #0f172a;">${businessName}</strong> (${businessType}). After careful review by our administration team, your current submission could not be verified at this time.
      </p>

      <div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; padding: 18px; margin: 20px 0;">
        <p style="margin: 0; font-size: 13px; color: #9f1239; line-height: 1.6;">
          Please review your business details, licenses, and documentation from your dashboard to ensure all details match official municipal guidelines.
        </p>
      </div>

      <div style="text-align: center; margin: 30px 0 20px;">
        <a href="${dashboardUrl}" style="display: inline-block; background-color: #475569; color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 14px; font-weight: 700; border-radius: 50px;">
          View Application on Dashboard
        </a>
      </div>
      `
      }

      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 28px 0;" />

      <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5; text-align: center;">
        If you did not submit this application or have questions, please reach out to our team at support@travelnepal.com.<br />
        &copy; ${new Date().getFullYear()} TravelNepal Tourism Agent. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;
};
