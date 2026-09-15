/* ============================================
   app.js — motor do funil
   ============================================ */

(function () {
  "use strict";

  // ---------- Configuração de tracking ----------
  // Preencha os IDs quando quiser ligar analytics/pixel.
  // Enquanto vazios, os eventos só aparecem no console (F12).
  const TRACKING_CONFIG = {
    ga4_id: "",         // Ex: 'G-XXXXXXXXXX'
    meta_pixel_id: "",  // Ex: '1234567890'
    custom_webhook: FLOW_CONFIG.webhookUrl || "",
  };

  function trackEvent(eventName, data) {
    data = data || {};
    console.log("[TRACK] " + eventName, data);
    if (TRACKING_CONFIG.ga4_id && typeof window.gtag === "function") {
      window.gtag("event", eventName, data);
    }
    if (TRACKING_CONFIG.meta_pixel_id && typeof window.fbq === "function") {
      window.fbq("trackCustom", eventName, data);
    }
    if (TRACKING_CONFIG.custom_webhook && navigator.sendBeacon) {
      try {
        navigator.sendBeacon(
          TRACKING_CONFIG.custom_webhook,
          JSON.stringify({ event: eventName, ...data, timestamp: Date.now() })
        );
      } catch (e) { /* falha silenciosa de beacon não deve travar a página */ }
    }
  }

  trackEvent("page_view", {
    url: window.location.href,
    referrer: document.referrer,
  });

  // ---------- Elementos ----------
  const overlay = document.getElementById("modalOverlay");
  const modal = document.getElementById("modal");
  const closeBtn = document.getElementById("modalClose");
  const form = document.getElementById("leadForm");
  const submitBtn = document.getElementById("submitBtn");
  const errorsBox = document.getElementById("formErrors");
  const ctaButtons = document.querySelectorAll("[data-cta]");

  let lastFocusedEl = null;
  let popupOpenedAt = null;
  let hasStartedFilling = false;

  // ---------- Abrir / fechar modal ----------
  function openModal(sourceLabel) {
    lastFocusedEl = document.activeElement;
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    popupOpenedAt = Date.now();
    trackEvent("step_view", { step_id: "popup_lead", step_number: 1, step_title: "Captura de lead" });

    const firstField = form.querySelector("input");
    if (firstField) firstField.focus();

    document.addEventListener("keydown", onKeydown);
  }

  function closeModal() {
    overlay.hidden = true;
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKeydown);
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  function onKeydown(e) {
    if (e.key === "Escape") {
      closeModal();
      return;
    }
    if (e.key === "Tab") {
      // Focus trap simples: mantém o foco dentro do modal
      const focusables = modal.querySelectorAll(
        'button, input, a[href], [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  ctaButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      trackEvent("funnel_start", { source: btn.dataset.cta });
      openModal(btn.dataset.cta);
    });
  });

  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeModal();
  });

  form.addEventListener("input", function () {
    hasStartedFilling = true;
  }, { once: true });

  // ---------- Validação (só ao tentar avançar) ----------
  function validators(fieldId, value) {
    const v = value.trim();
    switch (fieldId) {
      case "nome":
        if (!v) return "Digite seu nome completo.";
        if (v.length < 3) return "Digite seu nome completo, com sobrenome.";
        return null;
      case "email":
        if (!v) return "Digite seu e-mail.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Digite um e-mail válido, como nome@exemplo.com.";
        return null;
      case "whatsapp":
        if (!v) return "Digite seu WhatsApp com DDD.";
        if (v.replace(/\D/g, "").length < 10) return "Digite um número válido com DDD, ex: (11) 98888-7777.";
        return null;
      default:
        return null;
    }
  }

  function validateForm() {
    const errors = [];
    FLOW_CONFIG.fields.forEach(function (field) {
      const input = document.getElementById("field" + capitalize(field.id));
      const errEl = document.getElementById("err" + capitalize(field.id));
      const fieldWrap = input.closest(".field");
      const message = validators(field.id, input.value);

      if (message) {
        errors.push({ id: field.id, message: message });
        fieldWrap.classList.add("has-error");
        errEl.textContent = "Erro: " + message;
        input.setAttribute("aria-invalid", "true");
      } else {
        fieldWrap.classList.remove("has-error");
        errEl.textContent = "";
        input.removeAttribute("aria-invalid");
      }
    });
    return errors;
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // ---------- Envio ----------
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const errors = validateForm();

    if (errors.length) {
      errorsBox.hidden = false;
      errorsBox.innerHTML =
        "Erro: verifique os campos destacados abaixo antes de continuar.";
      errorsBox.focus ? errorsBox.setAttribute("tabindex", "-1") : null;
      errorsBox.scrollIntoView({ behavior: "smooth", block: "start" });
      errorsBox.focus();

      errors.forEach(function (err) {
        trackEvent("field_error", { step_id: "popup_lead", field_id: err.id, error_type: err.message });
      });
      return;
    }

    errorsBox.hidden = true;

    const payload = {
      nome: document.getElementById("fieldNome").value.trim(),
      email: document.getElementById("fieldEmail").value.trim(),
      whatsapp: document.getElementById("fieldWhatsapp").value.trim(),
      capturedAt: new Date().toISOString(),
    };

    // Salva localmente (não perde o lead mesmo sem webhook configurado ainda)
    try {
      const existing = JSON.parse(sessionStorage.getItem("universo_lentes_leads") || "[]");
      existing.push(payload);
      sessionStorage.setItem("universo_lentes_leads", JSON.stringify(existing));
      sessionStorage.setItem("universo_lentes_last_lead", JSON.stringify(payload));
    } catch (e) {
      console.warn("Não foi possível salvar no sessionStorage:", e);
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando...";

    trackEvent("step_complete", {
      step_id: "popup_lead",
      step_number: 1,
      time_on_step: popupOpenedAt ? Date.now() - popupOpenedAt : null,
    });
    trackEvent("funnel_complete", { total_time: popupOpenedAt ? Date.now() - popupOpenedAt : null });

    // Envia para webhook, se configurado (não bloqueia o redirect)
    if (FLOW_CONFIG.webhookUrl) {
      try {
        navigator.sendBeacon(FLOW_CONFIG.webhookUrl, JSON.stringify(payload));
      } catch (e) { /* não bloquear o fluxo por causa do webhook */ }
    }

    setTimeout(function () {
      if (FLOW_CONFIG.checkoutUrl) {
        window.location.href = FLOW_CONFIG.checkoutUrl;
      } else {
        // Sem URL de checkout configurada ainda: mostra confirmação em vez de redirecionar.
        modal.innerHTML =
          '<h2 class="modal__title">Dados recebidos!</h2>' +
          '<p class="modal__sub">Assim que o link de pagamento estiver configurado, ' +
          "você será redirecionado automaticamente para o checkout. " +
          '<br><br><em>(Nota para o desenvolvedor: defina <code>checkoutUrl</code> em flow.js)</em></p>';
        submitBtn.disabled = false;
      }
    }, 500);
  });

  // ---------- Abandono ----------
  window.addEventListener("beforeunload", function () {
    if (popupOpenedAt && !overlay.hidden) {
      trackEvent("funnel_abandon", {
        last_step: "popup_lead",
        time_on_page: Date.now() - popupOpenedAt,
      });
    }
  });
})();
