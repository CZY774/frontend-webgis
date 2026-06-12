const CONTENT_URL = "data/site-content.json";

function safeHtml(value) {
  const normalized = value ?? "";
  if (typeof escapeHtml === "function") {
    return escapeHtml(String(normalized));
  }

  const div = document.createElement("div");
  div.textContent = normalized;
  return div.innerHTML;
}

function byId(id) {
  return document.getElementById(id);
}

function maxValue(items, key) {
  return Math.max(...items.map((item) => Number(item[key]) || 0), 1);
}

function setText(id, value) {
  const el = byId(id);
  if (el) el.textContent = value || "";
}

function renderParagraphs(containerId, paragraphs) {
  const el = byId(containerId);
  if (!el) return;

  el.innerHTML = paragraphs
    .map((paragraph) => `<p>${safeHtml(paragraph)}</p>`)
    .join("");
}

function renderMetricStrip(items) {
  const container = byId("populationSummary");
  if (!container) return;

  container.innerHTML = items
    .map(
      (item) => `
        <div class="metric-item">
          <span>${safeHtml(item.label)}</span>
          <strong>${safeHtml(item.display)}</strong>
        </div>
      `,
    )
    .join("");
}

function renderAgeChart(items) {
  const container = byId("ageChart");
  if (!container) return;

  const maxTotal = Math.max(
    ...items.map((item) => Number(item.male || 0) + Number(item.female || 0)),
    1,
  );

  container.innerHTML = items
    .map((item) => {
      const total = Number(item.male || 0) + Number(item.female || 0);
      const maleWidth = (Number(item.male || 0) / maxTotal) * 100;
      const femaleWidth = (Number(item.female || 0) / maxTotal) * 100;

      return `
        <div class="age-row">
          <div class="age-label">${safeHtml(item.range)}</div>
          <div class="age-bars" aria-label="${safeHtml(item.range)}">
            <span class="male-bar" style="width:${maleWidth}%"></span>
            <span class="female-bar" style="width:${femaleWidth}%"></span>
          </div>
          <div class="age-values">
            <span>${safeHtml(item.male_display)}</span>
            <span>${safeHtml(item.female_display)}</span>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderCompactTable(containerId, rows, columns) {
  const container = byId(containerId);
  if (!container) return;

  const body = rows
    .map(
      (row) => `
        <tr>
          ${columns
            .map((column) => `<td>${safeHtml(row[column.key] ?? "")}</td>`)
            .join("")}
        </tr>
      `,
    )
    .join("");

  container.innerHTML = `
    <table class="table table-sm align-middle">
      <thead>
        <tr>${columns.map((column) => `<th>${safeHtml(column.label)}</th>`).join("")}</tr>
      </thead>
      <tbody>${body}</tbody>
    </table>
  `;
}

function renderRankList(containerId, rows, labelKey, valueKey, displayKey) {
  const container = byId(containerId);
  if (!container) return;

  const max = maxValue(rows, valueKey);
  container.innerHTML = rows
    .map((row) => {
      const width = ((Number(row[valueKey]) || 0) / max) * 100;
      return `
        <div class="rank-row">
          <div class="rank-label">${safeHtml(row[labelKey])}</div>
          <div class="rank-track">
            <span style="width:${width}%"></span>
          </div>
          <div class="rank-value">${safeHtml(row[displayKey])}</div>
        </div>
      `;
    })
    .join("");
}

function renderDefinitionList(containerId, rows) {
  const container = byId(containerId);
  if (!container) return;

  container.innerHTML = rows
    .map(
      (row) => `
        <div>
          <dt>${safeHtml(row.component)}</dt>
          <dd>${safeHtml(row.value)}</dd>
        </div>
      `,
    )
    .join("");
}

function renderIndexList(rows) {
  const container = byId("idmIndices");
  if (!container) return;

  container.innerHTML = rows
    .map((row) => {
      const contribution = parseFloat(
        String(row.contribution).replace(",", "."),
      );
      const width = Number.isFinite(contribution)
        ? Math.min(contribution, 100)
        : row.contribution === "100%"
          ? 100
          : 0;

      return `
        <div class="rank-row">
          <div class="rank-label">${safeHtml(row.index)}</div>
          <div class="rank-track">
            <span style="width:${width}%"></span>
          </div>
          <div class="rank-value">${safeHtml(row.value)} / ${safeHtml(row.contribution)}</div>
        </div>
      `;
    })
    .join("");
}

function renderSimpleTable(containerId, rows, columns) {
  const container = byId(containerId);
  if (!container) return;

  container.innerHTML = `
    <table class="table table-hover align-middle data-table">
      <thead>
        <tr>
          ${columns.map((column) => `<th>${safeHtml(column.label)}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) => `
              <tr>
                ${columns
                  .map(
                    (column) => `<td>${safeHtml(row[column.key] ?? "")}</td>`,
                  )
                  .join("")}
              </tr>
            `,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function renderPotentialTable(containerId, rows, columns) {
  const container = byId(containerId);
  if (!container) return;

  const mobileRows = rows
    .map((row) => {
      const searchable = columns
        .map((column) => row[column.key] ?? "")
        .join(" ")
        .toLowerCase();
      const titleColumn =
        columns.find((column) => column.key === "Nama") || columns[0];
      const typeColumn = columns.find((column) => column.key === "Jenis");
      const detailColumns = columns.filter(
        (column) =>
          !["No", titleColumn.key, typeColumn?.key].includes(column.key),
      );

      return `
        <article class="mobile-record" data-search="${safeHtml(searchable)}">
          <div class="mobile-record-head">
            <strong>${safeHtml(row[titleColumn.key] ?? "")}</strong>
            ${
              typeColumn
                ? `<span>${safeHtml(row[typeColumn.key] ?? "")}</span>`
                : ""
            }
          </div>
          <dl>
            ${detailColumns
              .map(
                (column) => `
                  <div>
                    <dt>${safeHtml(column.label)}</dt>
                    <dd>${safeHtml(row[column.key] ?? "-")}</dd>
                  </div>
                `,
              )
              .join("")}
          </dl>
        </article>
      `;
    })
    .join("");

  const htmlRows = rows
    .map(
      (row) => `
        <tr>
          ${columns
            .map((column) => {
              const value = row[column.key] ?? "";
              const className = column.wide ? ' class="wide-cell"' : "";
              return `<td${className}>${safeHtml(value)}</td>`;
            })
            .join("")}
        </tr>
      `,
    )
    .join("");

  container.innerHTML = `
    <div class="desktop-table-view">
      <table class="table table-hover align-middle data-table searchable-table">
        <thead>
          <tr>
            ${columns.map((column) => `<th>${safeHtml(column.label)}</th>`).join("")}
          </tr>
        </thead>
        <tbody>${htmlRows}</tbody>
      </table>
    </div>
    <div class="mobile-record-list">${mobileRows}</div>
  `;
}

function bindTableSearch(inputId, tableId) {
  const input = byId(inputId);
  const tableContainer = byId(tableId);
  if (!input || !tableContainer) return;

  const toolbar = input.closest(".table-toolbar");
  const counter = document.createElement("span");
  counter.className = "table-count";
  if (toolbar) {
    toolbar.appendChild(counter);
  }

  const updateRows = () => {
    const query = input.value.trim().toLowerCase();
    const rows = tableContainer.querySelectorAll("tbody tr");
    const records = tableContainer.querySelectorAll(".mobile-record");
    let visible = 0;

    rows.forEach((row) => {
      const haystack = row.textContent.toLowerCase();
      const matched = haystack.includes(query);
      row.style.display = matched ? "" : "none";
      if (matched) visible += 1;
    });

    records.forEach((record) => {
      const haystack =
        record.dataset.search || record.textContent.toLowerCase();
      const matched = haystack.includes(query);
      record.style.display = matched ? "" : "none";
    });

    counter.textContent = `${visible} dari ${rows.length} data`;
  };

  input.addEventListener("input", updateRows);
  updateRows();
}

function setTabCount(tabId, count) {
  const tab = byId(tabId);
  if (!tab) return;

  const label = tab.textContent.trim();
  tab.innerHTML = `${safeHtml(label)} <span class="tab-count">${count}</span>`;
}

function renderHome(home) {
  const hero = byId("heroPhoto");
  if (hero && home.images?.[0]) hero.src = home.images[0];

  const secondary = byId("secondaryProfilePhoto");
  if (secondary && home.images?.[1]) secondary.src = home.images[1];

  setText("homeTitle", home.title);
  setText("homeTagline", home.tagline);
  setText("profileText", home.profile);
  setText("visionText", home.vision);

  const missionList = byId("missionList");
  if (missionList) {
    missionList.innerHTML = home.missions
      .map((mission) => `<li>${safeHtml(mission)}</li>`)
      .join("");
  }

  renderParagraphs("historyText", home.history);
}

function renderInfographics(infographics) {
  renderMetricStrip(infographics.summary);
  renderAgeChart(infographics.age);
  renderCompactTable("dusunTable", infographics.by_dusun, [
    { key: "dusun", label: "Dusun" },
    { key: "population_display", label: "Penduduk" },
  ]);
  renderRankList(
    "educationBars",
    infographics.education,
    "education",
    "population",
    "population_display",
  );
  renderRankList(
    "occupationBars",
    infographics.occupation,
    "occupation",
    "population",
    "population_display",
  );
  renderCompactTable("maritalTable", infographics.marital_status, [
    { key: "status", label: "Status" },
    { key: "population_display", label: "Jumlah" },
  ]);
  renderCompactTable("religionTable", infographics.religion, [
    { key: "religion", label: "Agama" },
    { key: "population_display", label: "Jumlah" },
  ]);
  renderSimpleTable("welfareTable", infographics.welfare, [
    { key: "category", label: "Kategori" },
    { key: "kk_display", label: "KK" },
    { key: "individuals_display", label: "Individu" },
  ]);
}

function renderIdm(idm) {
  setText("idmScore", idm.score);
  setText("idmStatus", idm.status);
  renderDefinitionList("idmGeneral", idm.general);
  renderIndexList(idm.indices);
  renderSimpleTable("idmPriorities", idm.priorities, [
    { key: "field", label: "Bidang" },
    { key: "problem", label: "Permasalahan Utama" },
  ]);
  renderSimpleTable("idmRecommendations", idm.recommendations, [
    { key: "section", label: "Dimensi" },
    { key: "dimension", label: "Indikator" },
    { key: "indicator", label: "Item" },
    { key: "value", label: "Nilai" },
  ]);
}

function renderPotentials(potentials) {
  setTabCount("facilities-tab", potentials.facilities.length);
  setTabCount("umkm-tab", potentials.umkm.length);
  setTabCount("tourism-tab", potentials.tourism.length);

  renderPotentialTable("facilitiesTable", potentials.facilities, [
    { key: "No", label: "No" },
    { key: "Nama", label: "Nama" },
    { key: "Jenis", label: "Jenis" },
    { key: "Deskripsi", label: "Deskripsi", wide: true },
    { key: "Lokasi", label: "Lokasi", wide: true },
    { key: "Jam Operasional", label: "Jam Operasional" },
    { key: "Fasilitas Pendukung", label: "Fasilitas Pendukung", wide: true },
  ]);

  renderPotentialTable("umkmTable", potentials.umkm, [
    { key: "No", label: "No" },
    { key: "Nama", label: "Nama" },
    { key: "Jenis", label: "Jenis" },
    { key: "Pemilik", label: "Pemilik" },
    { key: "Lokasi", label: "Lokasi", wide: true },
    { key: "Produk", label: "Produk", wide: true },
    { key: "Jam Operasional", label: "Jam Operasional" },
    { key: "Fasilitas Pendukung", label: "Fasilitas Pendukung", wide: true },
  ]);

  renderPotentialTable("tourismTable", potentials.tourism, [
    { key: "No", label: "No" },
    { key: "Nama", label: "Nama" },
    { key: "Jenis", label: "Jenis" },
    { key: "Deskripsi", label: "Deskripsi", wide: true },
    { key: "Cagar Budaya", label: "Cagar Budaya", wide: true },
    { key: "Lokasi", label: "Lokasi", wide: true },
    { key: "Tarif", label: "Tarif" },
    { key: "Fasilitas", label: "Fasilitas", wide: true },
  ]);

  bindTableSearch("facilitiesSearch", "facilitiesTable");
  bindTableSearch("umkmSearch", "umkmTable");
  bindTableSearch("tourismSearch", "tourismTable");
}

async function loadSiteContent() {
  try {
    const response = await fetch(CONTENT_URL);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const content = await response.json();
    renderHome(content.home);
    renderInfographics(content.infographics);
    renderIdm(content.idm);
    renderPotentials(content.potentials);
    document.dispatchEvent(new CustomEvent("prawoto:content-ready"));
  } catch (error) {
    console.error("Failed to load site content:", error);
  }
}

document.addEventListener("DOMContentLoaded", loadSiteContent);
