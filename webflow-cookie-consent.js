document.addEventListener("DOMContentLoaded", function () {
  const banner = document.getElementById("cookie-banner");
  const acceptAllBtn = document.getElementById("accept-all-cookies");
  const rejectAllBtn = document.getElementById("reject-all-cookies");
  const saveBtn = document.getElementById("save-selection-cookies");
  const editConsentBtn = document.getElementById("edit-consent");

  function getAllConsentCheckboxes() {
    return document.querySelectorAll('[data-cookie-name][data-cookie-script]');
  }

  function getConsentFromCheckboxes() {
    const checkboxes = getAllConsentCheckboxes();
    const consent = { necessary: true };
    checkboxes.forEach(cb => {
      const name = cb.getAttribute("data-cookie-name");
      consent[name] = cb.checked;
    });
    return consent;
  }

  function applyConsent(consent) {
    const checkboxes = getAllConsentCheckboxes();
    checkboxes.forEach(cb => {
      const name = cb.getAttribute("data-cookie-name");
      const script = cb.getAttribute("data-cookie-script");
      if (consent[name] && script) {
        if (!document.querySelector(`script[data-loaded="${name}"]`)) {
          if (script.trim().startsWith("http")) {
            const s = document.createElement("script");
            s.src = script;
            s.async = true;
            s.setAttribute("data-loaded", name);
            document.head.appendChild(s);
          } else {
            const inline = document.createElement("script");
            inline.innerText = script;
            inline.setAttribute("data-loaded", name);
            document.head.appendChild(inline);
          }
        }
      }
    });
  }

  function saveConsent(consent) {
    localStorage.setItem("cookieConsent", JSON.stringify(consent));
  }

  function loadConsent() {
    const saved = localStorage.getItem("cookieConsent");
    return saved ? JSON.parse(saved) : null;
  }

  function updateCheckboxes(consent) {
    if (!consent) return;
    const checkboxes = getAllConsentCheckboxes();
    checkboxes.forEach(cb => {
      const name = cb.getAttribute("data-cookie-name");
      if (consent[name]) {
        cb.checked = true;
        cb.closest("label")?.click(); // Webflow custom checkbox trigger
      }
    });
  }

  function acceptAll() {
    const checkboxes = getAllConsentCheckboxes();
    const consent = { necessary: true };
    checkboxes.forEach(cb => {
      const name = cb.getAttribute("data-cookie-name");
      consent[name] = true;
    });
    saveConsent(consent);
    applyConsent(consent);
    banner.style.display = "none";
  }

  function rejectAll() {
    const checkboxes = getAllConsentCheckboxes();
    const consent = { necessary: true };
    checkboxes.forEach(cb => {
      const name = cb.getAttribute("data-cookie-name");
      consent[name] = false;
    });
    saveConsent(consent);
    banner.style.display = "none";
  }

  function saveCustomConsent() {
    const consent = getConsentFromCheckboxes();
    saveConsent(consent);
    applyConsent(consent);
    banner.style.display = "none";
  }

  if (acceptAllBtn) acceptAllBtn.addEventListener("click", acceptAll);
  if (rejectAllBtn) rejectAllBtn.addEventListener("click", rejectAll);
  if (saveBtn) saveBtn.addEventListener("click", saveCustomConsent);

  if (editConsentBtn) {
    editConsentBtn.addEventListener("click", function () {
      const saved = loadConsent();
      updateCheckboxes(saved);
      banner.style.display = "block";
    });
  }

  // Initial check
  const savedConsent = loadConsent();
  if (!savedConsent) {
    banner.style.display = "block";
  } else {
    updateCheckboxes(savedConsent);
    applyConsent(savedConsent);
  }
});
