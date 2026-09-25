const ALLOWED_SERVICES = new Set([
  "Consultoria Empresarial",
  "Gestão de Projetos",
  "Estruturação de Processos",
  "Pagamentos & Serviços Financeiros",
  "Outro assunto",
]);

function send(res, status, payload) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  return res.status(status).send(JSON.stringify(payload));
}

function text(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

module.exports = async function contact(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return send(res, 405, { error: "Método não permitido." });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return send(res, 400, { error: "Dados inválidos." });
    }
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return send(res, 400, { error: "Dados inválidos." });
  }

  // Honeypot: quietly accept automated submissions without storing them.
  if (text(body.website, 200)) return send(res, 200, { ok: true });

  const submission = {
    name: text(body.nome, 120),
    company: text(body.empresa, 120) || null,
    email: text(body.email, 254).toLowerCase(),
    phone: text(body.telefone, 40) || null,
    service: text(body.assunto, 80) || null,
    message: text(body.mensagem, 4000),
    privacy_consent: body.consentimento === "sim",
  };

  if (submission.name.length < 2) return send(res, 422, { error: "Informe seu nome." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submission.email)) {
    return send(res, 422, { error: "Informe um e-mail válido." });
  }
  if (submission.message.length < 10) {
    return send(res, 422, { error: "Conte um pouco mais sobre seu desafio." });
  }
  if (!submission.privacy_consent) {
    return send(res, 422, { error: "Autorize o uso dos dados para receber uma resposta." });
  }
  if (submission.service && !ALLOWED_SERVICES.has(submission.service)) {
    return send(res, 422, { error: "Selecione uma solução válida." });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabasePublishableKey =
    process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabasePublishableKey) {
    return send(res, 503, { error: "Contato ainda não configurado." });
  }

  try {
    const response = await fetch(
      `${supabaseUrl.replace(/\/+$/, "")}/rest/v1/contact_submissions`,
      {
        method: "POST",
        headers: {
          apikey: supabasePublishableKey,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(submission),
      },
    );

    if (!response.ok) {
      return send(res, 502, { error: "Não foi possível registrar a mensagem." });
    }
    return send(res, 200, { ok: true });
  } catch {
    return send(res, 502, { error: "Não foi possível registrar a mensagem." });
  }
};
