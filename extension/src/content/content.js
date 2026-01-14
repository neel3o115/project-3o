(() => {
  if (document.getElementById("project3o-widget")) return;

  const root = document.createElement("div");
  root.id = "project3o-widget";
  root.innerHTML = `
    <div class="p3o-card">
      <div class="p3o-title">project-3o</div>
      <div class="p3o-timer">00:00</div>
      <button class="p3o-btn">Start</button>
    </div>
  `;

  document.body.appendChild(root);
})();
