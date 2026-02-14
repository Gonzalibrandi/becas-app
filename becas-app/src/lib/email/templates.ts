type Scholarship = {
  title: string;
  slug: string;
  country: string | null;
  deadline: Date | null;
  fundingType: string;
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://becasapp.com";

export function buildAlertEmailHtml(
  alertName: string,
  scholarships: Scholarship[]
): string {
  const scholarshipRows = scholarships
    .map(
      (s) => `
      <tr>
        <td style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
          <a href="${APP_URL}/scholarship/${s.slug}" 
             style="font-size: 16px; font-weight: 600; color: #065f46; text-decoration: none;">
            ${s.title}
          </a>
          <div style="margin-top: 6px; font-size: 13px; color: #6b7280;">
            📍 ${s.country || "Internacional"} · 
            ${s.deadline ? `📅 ${new Date(s.deadline).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}` : "Sin fecha límite"}
          </div>
        </td>
      </tr>
    `
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8" /></head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 32px 16px;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #059669, #0d9488); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
      <h1 style="color: white; font-size: 24px; margin: 0;">🎓 Nuevas Becas</h1>
      <p style="color: #a7f3d0; font-size: 14px; margin: 8px 0 0;">
        Alerta: ${alertName}
      </p>
    </div>
    
    <!-- Body -->
    <div style="background: white; border-radius: 0 0 16px 16px; padding: 24px;">
      <p style="color: #374151; font-size: 15px; margin: 0 0 16px;">
        Encontramos <strong>${scholarships.length}</strong> beca${scholarships.length !== 1 ? "s" : ""} nueva${scholarships.length !== 1 ? "s" : ""} que coincide${scholarships.length !== 1 ? "n" : ""} con tu alerta.
      </p>
      
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 12px;">
        ${scholarshipRows}
      </table>
      
      <div style="text-align: center; margin-top: 24px;">
        <a href="${APP_URL}" 
           style="display: inline-block; padding: 12px 32px; background: #059669; color: white; font-weight: 600; border-radius: 12px; text-decoration: none; font-size: 14px;">
          Ver todas las becas
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <p style="text-align: center; font-size: 12px; color: #9ca3af; margin-top: 24px;">
      Recibís este email porque configuraste una alerta en Becas App.
      <br />
      <a href="${APP_URL}/alerts" style="color: #059669;">Administrar mis alertas</a>
    </p>
  </div>
</body>
</html>
  `.trim();
}
