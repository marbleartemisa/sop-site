
"use strict";

/**
 * ARTEMISA RECEIVING
 * Historical search and message detail.
 */

const RECEIVING_CONFIG = {
  API_ENABLED: true,
  API_URL: "https://script.google.com/macros/s/AKfycby0y93mBO3FOi3O9XRX0FpBwMEo5A6ZvAJEs-PI56n4pQ-fLjSkIiuKnPFqEcNZYMG2/exec",
  PAGE_SIZE: 20
};

const RECEIVING_STATE = {
  results: [],
  totalMessages: 0,
  totalFiles: 0,
  offset: 0,
  query: "",
  filters: {},
  loading: false
};

const OUTGOING_STATE = {
  contacts: [],
  selectedContactIDs: [],
  contactsLoaded: false,
  saving: false,
  lastSavedMessage: null
};


const MATERIAL_RECEIVING_STATE = {
  selectedFiles: [],
  existingFiles: [],
  receiptId: null,
  saving: false,
  uploading: false
};


document.addEventListener("DOMContentLoaded", initializeReceiving);



/********************************************************
 * MATERIAL RECEIVING - FILE SELECTION
 ********************************************************/

function initializeMaterialFileSelection() {

  const input = document.getElementById('materialReceiptFiles');
  const dropzone = document.getElementById('materialFileDropzone');
  const selectedContainer = document.getElementById('materialSelectedFiles');

  if (!input || !dropzone || !selectedContainer) {
    console.warn('Material Receiving file elements not found.');
    return;
  }

  // Prevent duplicate event listeners
  if (input.dataset.initialized === 'true') return;

  input.dataset.initialized = 'true';

  input.addEventListener('change', function() {

    addMaterialFiles(Array.from(input.files || []));

    // Allow selecting the same file again
    input.value = '';

  });

  dropzone.addEventListener('dragover', function(event) {

    event.preventDefault();
    dropzone.classList.add('drag-over');

  });

  dropzone.addEventListener('dragleave', function(event) {

    event.preventDefault();
    dropzone.classList.remove('drag-over');

  });

  dropzone.addEventListener('drop', function(event) {

    event.preventDefault();
    dropzone.classList.remove('drag-over');

    const files = Array.from(
      event.dataTransfer.files || []
    );

    addMaterialFiles(files);

  });

  renderMaterialSelectedFiles();

}


/********************************************************
 * MATERIAL RECEIVING - DEFAULT DATE
 ********************************************************/

function initializeMaterialReceivedDate() {

  const receivedDate = document.getElementById('materialReceivedDate');

  if (!receivedDate || receivedDate.value) return;

  const today = new Date();

  const localDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0')
  ].join('-');

  receivedDate.value = localDate;

}



/********************************************************
 * ADD SELECTED FILES
 ********************************************************/

function addMaterialFiles(files) {

  files.forEach(function(file) {

    const alreadyAdded =
      MATERIAL_RECEIVING_STATE.selectedFiles.some(function(existing) {
        return existing.name === file.name &&
          existing.size === file.size &&
          existing.lastModified === file.lastModified;
      });

    if (!alreadyAdded) {
      MATERIAL_RECEIVING_STATE.selectedFiles.push(file);
    }

  });

  renderMaterialSelectedFiles();
}


/********************************************************
 * RENDER SELECTED FILES
 ********************************************************/


function getMaterialFileIcon(file) {

  const name = String(file.name || '').toLowerCase();
  const type = String(file.type || '').toLowerCase();

  if (type.startsWith('image/') ||
      /\.(jpg|jpeg|png|gif|webp|bmp|heic|heif)$/.test(name)) {
    return '🖼️';
  }

  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    return '📕';
  }

  if (/\.(doc|docx)$/.test(name)) return '📘';

  if (/\.(xls|xlsx|csv)$/.test(name)) return '📗';

  return '📎';
}


function renderMaterialSelectedFiles() {

  const container = document.getElementById('materialSelectedFiles');

  if (!container) return;

  const files = MATERIAL_RECEIVING_STATE.selectedFiles;

  if (!files.length) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <div class="selected-files-heading">
      Selected files (${files.length})
    </div>

    <div class="selected-files-list">

      ${files.map(function(file, index) {

        return `
          <div class="selected-file-item">

            <span class="selected-file-icon">
              ${getMaterialFileIcon(file)}
            </span>

            <div class="selected-file-info">
              <span class="selected-file-name">
                ${escapeMaterialHTML(file.name)}
              </span>

              <span class="selected-file-size">
                ${formatMaterialFileSize(file.size)}
              </span>
            </div>

            <button
              type="button"
              class="remove-material-file"
              data-index="${index}"
              aria-label="Remove ${escapeMaterialHTML(file.name)}"
              title="Remove file"
            >
              <svg viewBox="0 0 24 24"
                   width="17"
                   height="17"
                   fill="none"
                   stroke="currentColor"
                   stroke-width="1.8"
                   stroke-linecap="round"
                   stroke-linejoin="round"
                   aria-hidden="true">
                <path d="M3 6h18"/>
                <path d="M8 6V4h8v2"/>
                <path d="m19 6-1 14H6L5 6"/>
                <path d="M10 11v5M14 11v5"/>
              </svg>
            </button>

          </div>
        `;

      }).join('')}

    </div>
  `;

  container.querySelectorAll('.remove-material-file').forEach(function(button) {

    button.addEventListener('click', function() {

      const index = Number(button.dataset.index);

      MATERIAL_RECEIVING_STATE.selectedFiles.splice(index, 1);

      renderMaterialSelectedFiles();

    });

  });

}



/********************************************************
 * FILE HELPERS
 ********************************************************/

function formatMaterialFileSize(bytes) {

  if (bytes < 1024) return bytes + ' B';

  if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + ' KB';
  }

  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}


function escapeMaterialHTML(value) {

  return String(value).replace(/[&<>"']/g, function(char) {

    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char];

  });
}


function initializeMaterialItems() {

  const container = document.getElementById('materialItemsContainer');
  const addButton = document.getElementById('addMaterialItem');

  if (!container || !addButton) {
    console.warn('Material items editor elements not found.');
    return;
  }

  if (container.dataset.initialized === 'true') return;

  container.dataset.initialized = 'true';

  addButton.addEventListener('click', function () {
    addMaterialItemCard();
  });

  container.addEventListener('click', function (event) {

    const removeButton = event.target.closest('.remove-material-item');

    if (!removeButton) return;

    const cards = container.querySelectorAll('.material-item-card');

    if (cards.length <= 1) return;

    removeButton.closest('.material-item-card').remove();

    refreshMaterialItemCards();
  });

  refreshMaterialItemCards();
}


function addMaterialItemCard() {

  const container = document.getElementById('materialItemsContainer');

  if (!container) return;

  const firstCard = container.querySelector('.material-item-card');

  if (!firstCard) return;

  const newCard = firstCard.cloneNode(true);

  // Clear all fields in the new item
  newCard.querySelectorAll('[data-field]').forEach(function (field) {
    field.value = '';
  });

  container.appendChild(newCard);

  refreshMaterialItemCards();

  const description = newCard.querySelector('[data-field="ItemName"]');

  if (description) description.focus();
}


function refreshMaterialItemCards() {

  const container = document.getElementById('materialItemsContainer');

  if (!container) return;

  const cards = Array.from(
    container.querySelectorAll('.material-item-card')
  );

  cards.forEach(function (card, index) {

    const heading = card.querySelector('.material-item-heading');

    if (!heading) return;

    const title = heading.querySelector('h5');

    if (title) {
      title.textContent = 'Material ' + (index + 1);
    }

    // Remove an existing remove button before recreating it
    const oldButton = heading.querySelector('.remove-material-item');

    if (oldButton) oldButton.remove();

    const removeButton = document.createElement('button');

    removeButton.type = 'button';
    removeButton.className = 'remove-material-item';
    removeButton.textContent = 'Remove';
    removeButton.setAttribute(
      'aria-label',
      'Remove Material ' + (index + 1)
    );

    removeButton.disabled = cards.length === 1;

    heading.appendChild(removeButton);

  });
}


async function saveMaterialReceipt(event) {
  event.preventDefault();

  const form = document.getElementById('materialReceiptForm');
  const saveButton = document.getElementById('saveMaterialReceipt');
  const feedback = document.getElementById('materialReceiptFeedback');

  if (!form || MATERIAL_RECEIVING_STATE.saving) return;

  if (MATERIAL_RECEIVING_STATE.receiptId) {
  if (feedback) {
        feedback.textContent =
          'This receipt has already been saved. Receipt ID: ' +
          MATERIAL_RECEIVING_STATE.receiptId;
        feedback.className = 'receipt-feedback success';
      }
      return;
    }

  try {
    // Validate the form and collect all material rows.
    if (!form.reportValidity()) return;

    const items = getMaterialItemsFromForm();

    const receipt = {
      ReceiptDate: document.getElementById('materialReceivedDate').value,
      ReceivedBy: document.getElementById('materialReceivedBy').value.trim(),
      OriginType: document.getElementById('materialOriginType').value,
      Supplier: document.getElementById('materialSupplier').value.trim(),
      ShipFrom: document.getElementById('materialShipFrom').value.trim(),
      Sender: document.getElementById('materialSender').value.trim(),
      Carrier: document.getElementById('materialCarrier').value.trim(),
      TrackingNumber: document.getElementById('materialTracking').value.trim(),
      PONumber: document.getElementById('materialPO').value.trim(),
      InvoiceNumber: document.getElementById('materialInvoice').value.trim(),
      Project: document.getElementById('materialProject').value,
      ReceiptType: 'MATERIAL_RECEIVING',
      Status: 'RECEIVED',
      Condition: document.getElementById('materialReceivedCondition').value,
      OriginalText: document.getElementById('materialOriginalText').value.trim(),
      StorageLocation: document.getElementById('materialStorageLocation').value.trim(),
      Notes: document.getElementById('materialNotes').value.trim()
    };

    MATERIAL_RECEIVING_STATE.saving = true;

    if (saveButton) {
      saveButton.disabled = true;
      saveButton.textContent = 'Saving...';
    }

    if (feedback) {
      feedback.textContent = 'Saving receipt and materials...';
      feedback.className = 'receipt-feedback';
    }

    const response = await fetch(RECEIVING_CONFIG.API_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({
        method: 'POST',
        action: 'CREATE_RECEIPT_WITH_ITEMS',
        data: {
          receipt: receipt,
          items: items
        }
      })
    });

    const result = await response.json();

    if (!result.ok) {
      throw new Error(result.error || 'Could not save the receipt.');
    }

    const savedData = result.data;

    MATERIAL_RECEIVING_STATE.receiptId = savedData.ReceiptID;

    if (feedback) {
      feedback.textContent =
        'Receipt saved successfully. Receipt ID: ' +
        savedData.ReceiptID +
        ' | Materials saved: ' +
        savedData.ItemCount +
        '. Attachments have not been uploaded yet.';

      feedback.className = 'receipt-feedback success';
    }

    console.log('Material Receipt saved:', savedData);

  } catch (error) {
    console.error('Material Receipt save error:', error);

    if (feedback) {
      feedback.textContent = 'Error: ' + error.message;
      feedback.className = 'receipt-feedback error';
    }

  } finally {
    MATERIAL_RECEIVING_STATE.saving = false;

    if (saveButton) {
      saveButton.disabled = false;
      saveButton.textContent = 'Save Material Receipt';
    }
  }
}

function getMaterialItemsFromForm() {

  const container = document.getElementById('materialItemsContainer');

  if (!container) {
    throw new Error('Material items container not found.');
  }

  const cards = container.querySelectorAll('.material-item-card');

  const items = Array.from(cards).map(function (card) {

    const item = {};

    card.querySelectorAll('[data-field]').forEach(function (field) {

      const fieldName = field.dataset.field;

      item[fieldName] = field.value.trim();

    });

    item.Quantity = Number(item.Quantity);

    return item;

  });

  if (!items.length) {
    throw new Error('Add at least one material.');
  }

  items.forEach(function (item, index) {

    if (!item.ItemName) {
      throw new Error('Material ' + (index + 1) + ': description is required.');
    }

    if (!Number.isFinite(item.Quantity) || item.Quantity <= 0) {
      throw new Error('Material ' + (index + 1) + ': enter a valid quantity.');
    }

  });

  return items;
}

/* --------------------------------------------------
   FORMATO DE FECHA
-------------------------------------------------- */
function formatReceivingDate(value) {

  if (!value) return '';

  const date = value instanceof Date
    ? value
    : new Date(String(value).substring(0, 10) + 'T12:00:00');

  if (isNaN(date.getTime())) return String(value);

  return [
    String(date.getDate()).padStart(2, '0'),
    String(date.getMonth() + 1).padStart(2, '0'),
    date.getFullYear()
  ].join('/');
}

/* --------------------------------------------------
   INITIALIZATION
-------------------------------------------------- */
/********************************************************
 * ARTEMISA RECEIVING - MAIN INITIALIZATION
 ********************************************************/

function initializeReceiving() {

  // Prevent duplicate initialization
  if (window.RECEIVING_INITIALIZED) return;
  window.RECEIVING_INITIALIZED = true;


  /******************************************************
   * 1. HISTORICAL SEARCH ELEMENTS
   ******************************************************/

  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");
  const clearSearch = document.getElementById("clearSearch");
  const resetFilters = document.getElementById("resetFilters");
  const resultsContainer = document.getElementById("resultsContainer");

  if (!searchForm || !searchInput || !resultsContainer) {

    console.error("Receiving: required HTML elements are missing.");

    // Allow initialization again if the page is loaded later
    window.RECEIVING_INITIALIZED = false;

    return;
  }


  /******************************************************
   * 2. HISTORICAL SEARCH
   ******************************************************/

  searchForm.addEventListener("submit", function(event) {

    event.preventDefault();

    RECEIVING_STATE.offset = 0;

    searchHistoricalRecords();

  });


  searchInput.addEventListener("input", function() {

    const wrapper = document.querySelector(".search-input-wrap");

    if (wrapper) {
      wrapper.classList.toggle(
        "has-value",
        Boolean(searchInput.value)
      );
    }

  });


  if (clearSearch) {

    clearSearch.addEventListener("click", function() {

      searchInput.value = "";

      searchInput.focus();

      const wrapper = document.querySelector(".search-input-wrap");

      if (wrapper) {
        wrapper.classList.remove("has-value");
      }

    });

  }


  if (resetFilters) {

    resetFilters.addEventListener("click", resetSearchFilters);

  }


  /******************************************************
   * 3. MODULE NAVIGATION
   ******************************************************/

  document.querySelectorAll(".module-tab").forEach(function(tab) {

    tab.addEventListener("click", function() {

      if (tab.disabled) return;

      changeModule(tab.dataset.tab);

    });

  });


  /******************************************************
   * 4. OUTGOING MESSAGES MODULE
   ******************************************************/

  const outgoingForm = document.getElementById("outgoingMessageForm");
  const contactSearch = document.getElementById("contactSearchInput");
  const contactList = document.getElementById("contactList");
  const copyButton = document.getElementById("copyOutgoingMessage");


  if (outgoingForm) {

    outgoingForm.addEventListener("submit", saveOutgoingMessage);

  }


  if (contactSearch) {

    contactSearch.addEventListener("input", function() {

      renderOutgoingContacts(contactSearch.value);

    });

  }


  if (contactList) {

    contactList.addEventListener("change", function(event) {

      if (!event.target.matches(".outgoing-contact-checkbox")) return;

      const contactID = event.target.value;

      if (event.target.checked) {

        if (!OUTGOING_STATE.selectedContactIDs.includes(contactID)) {

          OUTGOING_STATE.selectedContactIDs.push(contactID);

        }

      } else {

        OUTGOING_STATE.selectedContactIDs =
          OUTGOING_STATE.selectedContactIDs.filter(function(id) {

            return id !== contactID;

          });

      }

      updateSelectedContactCount();

    });

  }


  if (copyButton) {

    copyButton.addEventListener("click", copyOutgoingMessage);

  }


  /******************************************************
   * 5. HISTORICAL SEARCH PAGINATION
   ******************************************************/

  const previousPage = document.getElementById("previousPage");
  const nextPage = document.getElementById("nextPage");


  if (previousPage) {

    previousPage.addEventListener("click", function() {

      if (RECEIVING_STATE.offset >= RECEIVING_CONFIG.PAGE_SIZE) {

        RECEIVING_STATE.offset -= RECEIVING_CONFIG.PAGE_SIZE;

        searchHistoricalRecords(true);

      }

    });

  }


  if (nextPage) {

    nextPage.addEventListener("click", function() {

      const nextOffset =
        RECEIVING_STATE.offset + RECEIVING_CONFIG.PAGE_SIZE;

      if (nextOffset < RECEIVING_STATE.totalMessages) {

        RECEIVING_STATE.offset = nextOffset;

        searchHistoricalRecords(true);

      }

    });

  }


  /******************************************************
   * 6. HISTORICAL MESSAGE INTERACTIONS
   ******************************************************/

  resultsContainer.addEventListener("click", function(event) {

    const link = event.target.closest("a");

    if (link) return;

    const card = event.target.closest("[data-message-index]");

    if (!card) return;

    const index = Number(card.dataset.messageIndex);

    const message = RECEIVING_STATE.results[index];

    if (message) {

      showMessageDetail(message);

    }

  });


  resultsContainer.addEventListener("keydown", function(event) {

    if (event.key !== "Enter" && event.key !== " ") return;

    const card = event.target.closest("[data-message-index]");

    if (!card) return;

    event.preventDefault();

    const message =
      RECEIVING_STATE.results[Number(card.dataset.messageIndex)];

    if (message) {

      showMessageDetail(message);

    }

  });


  /******************************************************
   * 7. RECEIVING INTERFACE
   ******************************************************/

  addReceivingStyles();

  updateSearchDescription();


  /******************************************************
   * 8. SYNCHRONIZATION STATUS
   ******************************************************/

  bindReceivingSyncButton();

  loadReceivingSyncStatus();


  /******************************************************
   * 9. MATERIAL RECEIVING MODULE
   ******************************************************/

  initializeMaterialReceivedDate();

  initializeMaterialItems();

  initializeMaterialFileSelection();

  const materialReceiptForm = document.getElementById('materialReceiptForm');
  
  if (materialReceiptForm && !materialReceiptForm.dataset.saveInitialized) {
    materialReceiptForm.addEventListener('submit', saveMaterialReceipt);
    materialReceiptForm.dataset.saveInitialized = 'true';
  }
  /******************************************************
   * 10. INITIALIZATION COMPLETE
   ******************************************************/

  console.info("Artemisa Receiving initialized.");

}



/* --------------------------------------------------
   MODULE NAVIGATION
-------------------------------------------------- */

function changeModule(moduleName) {
  const historyView = document.getElementById("historyView");
  const receiptsView = document.getElementById("receiptsView");
  const newMessageView = document.getElementById("newMessageView");

  if (!historyView || !receiptsView || !newMessageView) return;

  historyView.hidden = moduleName !== "history";
  receiptsView.hidden = moduleName !== "receipts";
  newMessageView.hidden = moduleName !== "newMessage";

  document.querySelectorAll(".module-tab").forEach(function(tab) {
    tab.classList.toggle(
      "active",
      tab.dataset.tab === moduleName
    );
  });

  if (moduleName === "newMessage") {
    loadOutgoingContacts();
  }

  bindReceivingSyncButton();

  if (moduleName === "history") {
    loadReceivingSyncStatus();
  }
}


/* --------------------------------------------------
   OUTGOING MESSAGES
-------------------------------------------------- */

async function loadOutgoingContacts() {
  if (OUTGOING_STATE.contactsLoaded) {
    renderOutgoingContacts();
    return;
  }

  const container = document.getElementById("contactList");
  if (!container) return;

  container.innerHTML =
    '<div class="contact-loading">Loading contacts...</div>';

  try {
    const params = new URLSearchParams({
      action: "GET_CONTACTS"
    });

    const response = await fetch(
      RECEIVING_CONFIG.API_URL + "?" + params.toString(),
      {
        method: "GET",
        redirect: "follow",
        cache: "no-store"
      }
    );

    if (!response.ok) {
      throw new Error("HTTP error " + response.status);
    }

    const payload = await response.json();

    if (!payload || payload.ok !== true) {
      throw new Error(
        payload && payload.error
          ? payload.error
          : "Unable to retrieve contacts."
      );
    }

    const data = payload.data;

    OUTGOING_STATE.contacts = Array.isArray(data)
      ? data
      : [];

    OUTGOING_STATE.contactsLoaded = true;

    renderOutgoingContacts();

  } catch (error) {
    console.error("Contact loading error:", error);

    container.innerHTML = `
      <div class="contact-error">
        Unable to load contacts. ${escapeHTML(error.message)}
      </div>
    `;
  }
}


function renderOutgoingContacts(searchTerm) {
  const container = document.getElementById("contactList");
  if (!container) return;

  const term = String(searchTerm || "").trim().toLowerCase();

  const contacts = OUTGOING_STATE.contacts.filter(function(contact) {
    const searchable = [
      contact.Name,
      contact.Department,
      contact.Phone,
      contact.Email
    ].join(" ").toLowerCase();

    return searchable.includes(term);
  });

  if (!contacts.length) {
    container.innerHTML = `
      <div class="contact-empty">
        No contacts found.
      </div>
    `;
    return;
  }

  container.innerHTML = contacts.map(function(contact) {
    const selected = OUTGOING_STATE.selectedContactIDs
      .includes(contact.ContactID);

    return `
      <label class="outgoing-contact">
        <input
          type="checkbox"
          class="outgoing-contact-checkbox"
          value="${escapeHTML(contact.ContactID)}"
          ${selected ? "checked" : ""}
        >

        <span class="contact-checkmark"></span>

        <span class="contact-details">
          <strong>${escapeHTML(contact.Name || "Unnamed contact")}</strong>
          <small>
            ${escapeHTML(contact.Department || "—")}
            ${contact.Phone
              ? " · " + escapeHTML(contact.Phone)
              : ""}
          </small>
        </span>
      </label>
    `;
  }).join("");
}


function updateSelectedContactCount() {
  const counter = document.getElementById("selectedContactCount");

  if (counter) {
    const count = OUTGOING_STATE.selectedContactIDs.length;
    counter.textContent = count + (count === 1 ? " selected" : " selected");
  }
}


async function uploadOutgoingMessageFile(messageId, file) {

  const base64 = await new Promise((resolve, reject) => {

    const reader = new FileReader();

    reader.onload = () => {
      const result = String(reader.result || '');
      resolve(result.split(',')[1] || '');
    };

    reader.onerror = () => {
      reject(new Error('Could not read ' + file.name));
    };

    reader.readAsDataURL(file);
  });

  const requestBody = {
    action: "UPLOAD_OUTGOING_MESSAGE_FILES",
    data: {
      MessageID: messageId,
      FileName: file.name,
      MimeType: file.type || "application/octet-stream",
      Base64: base64
    }
  };

  const response = await fetch(RECEIVING_CONFIG.API_URL, {
    method: "POST",
    redirect: "follow",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    throw new Error("HTTP error " + response.status);
  }

  const payload = await response.json();

  if (!payload || payload.ok !== true) {
    throw new Error(
      payload && payload.error
        ? payload.error
        : "Upload failed."
    );
  }

  return payload.data || {};
}


async function saveOutgoingMessage(event) {
  event.preventDefault();

  if (OUTGOING_STATE.saving) return;

  const sender = document.getElementById("outgoingSender").value.trim();
  const subject = document.getElementById("outgoingSubject").value.trim();
  const category = document.getElementById("outgoingCategory").value;
  const messageText =
    document.getElementById("outgoingMessageText").value;

  const attachmentInput =
    document.getElementById("outgoingAttachments");

  const files = attachmentInput
    ? Array.from(attachmentInput.files || [])
    : [];

  const MAX_FILE_SIZE = 8 * 1024 * 1024;
  const MAX_TOTAL_SIZE = 20 * 1024 * 1024;
  const MAX_FILES = 10;

  if (!sender) {
    showOutgoingFeedback("Enter the sender's name.", "error");
    return;
  }

  if (!OUTGOING_STATE.selectedContactIDs.length) {
    showOutgoingFeedback("Select at least one recipient.", "error");
    return;
  }

  if (!messageText.trim()) {
    showOutgoingFeedback("Write the message before saving.", "error");
    return;
  }

  if (files.length > MAX_FILES) {
    showOutgoingFeedback(
      "You can attach a maximum of 10 files.",
      "error"
    );
    return;
  }

  const oversizedFile = files.find(file => file.size > MAX_FILE_SIZE);

  if (oversizedFile) {
    showOutgoingFeedback(
      "File exceeds the 8 MB limit: " + oversizedFile.name,
      "error"
    );
    return;
  }

  const totalSize = files.reduce(
    (total, file) => total + file.size,
    0
  );

  if (totalSize > MAX_TOTAL_SIZE) {
    showOutgoingFeedback(
      "Total attachments cannot exceed 20 MB.",
      "error"
    );
    return;
  }

  const saveButton =
    document.getElementById("saveOutgoingMessage");

  OUTGOING_STATE.saving = true;

  if (saveButton) {
    saveButton.disabled = true;
    saveButton.textContent = "Saving...";
  }

  try {

    // STEP 1: Save the main message.
    const requestBody = {
      action: "CREATE_OUTGOING_MESSAGE",
      data: {
        ContactIDs: OUTGOING_STATE.selectedContactIDs,
        Sender: sender,
        Subject: subject,
        MessageText: messageText,
        Category: category,
        CreatedBy: sender
      }
    };

    const response = await fetch(RECEIVING_CONFIG.API_URL, {
      method: "POST",
      redirect: "follow",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error("HTTP error " + response.status);
    }

    const payload = await response.json();

    if (!payload || payload.ok !== true) {
      throw new Error(
        payload && payload.error
          ? payload.error
          : "The message could not be saved."
      );
    }

    const result = payload.data || {};

    if (result.Success === false || result.success === false) {
      throw new Error(
        result.Error || result.error || "Save failed."
      );
    }

    const messageId = result.MessageID || "";

    if (!messageId) {
      throw new Error(
        "The message was saved but no MessageID was returned. Attachments were not uploaded."
      );
    }

    OUTGOING_STATE.lastSavedMessage = {
      Subject: subject,
      MessageText: messageText,
      MessageID: messageId
    };

    const copyButton =
      document.getElementById("copyOutgoingMessage");

    if (copyButton) {
      copyButton.disabled = false;
    }

    // STEP 2: Upload attachments individually.
    const uploadedFiles = [];
    const failedFiles = [];

    for (const file of files) {

      try {

        const uploadResult =
          await uploadOutgoingMessageFile(messageId, file);

        uploadedFiles.push({
          name: file.name,
          result: uploadResult
        });

      } catch (uploadError) {

        console.error(
          "Attachment upload error:",
          file.name,
          uploadError
        );

        failedFiles.push({
          name: file.name,
          error: uploadError.message
        });
      }
    }

    // STEP 3: Report the final result.
    if (failedFiles.length === 0) {

      if (attachmentInput) {
        attachmentInput.value = "";
      }

      showOutgoingFeedback(
        "Message saved successfully. ID: " +
        messageId +
        " · Recipients: " +
        (result.RecipientCount || OUTGOING_STATE.selectedContactIDs.length) +
        " · Attachments uploaded: " +
        uploadedFiles.length,
        "success"
      );

    } else {

      showOutgoingFeedback(
        "Message saved successfully (ID: " +
        messageId +
        "), but " +
        failedFiles.length +
        " attachment(s) failed. Uploaded: " +
        uploadedFiles.length +
        ". Failed: " +
        failedFiles.map(file => file.name).join(", ") +
        ". Do not save the message again; it already exists.",
        "error"
      );
    }

  } catch (error) {

    console.error("Outgoing message save error:", error);

    showOutgoingFeedback(
      "Unable to save message: " + error.message,
      "error"
    );

  } finally {

    OUTGOING_STATE.saving = false;

    if (saveButton) {
      saveButton.disabled = false;
      saveButton.textContent = "Save Message";
    }
  }
}



async function copyOutgoingMessage() {
  const saved = OUTGOING_STATE.lastSavedMessage;

  if (!saved) {
    showOutgoingFeedback(
      "Save the message before copying it.",
      "error"
    );
    return;
  }

  const textToCopy = saved.MessageText;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(textToCopy);
    } else {
      const temporary = document.createElement("textarea");

      temporary.value = textToCopy;
      temporary.style.position = "fixed";
      temporary.style.opacity = "0";

      document.body.appendChild(temporary);
      temporary.select();

      const copied = document.execCommand("copy");
      temporary.remove();

      if (!copied) {
        throw new Error("Clipboard access is unavailable.");
      }
    }

    showOutgoingFeedback(
      "Message copied. You can now paste it into WhatsApp.",
      "success"
    );

  } catch (error) {
    console.error("Copy error:", error);

    showOutgoingFeedback(
      "Unable to copy automatically. Please select and copy the message manually.",
      "error"
    );
  }
}


function showOutgoingFeedback(message, type) {
  const feedback = document.getElementById("outgoingMessageFeedback");
  if (!feedback) return;

  feedback.hidden = false;
  feedback.className = "outgoing-feedback " + type;
  feedback.textContent = message;
}

/* --------------------------------------------------
   HISTORICAL SEARCH
-------------------------------------------------- */

async function searchHistoricalRecords(keepState) {
  const searchInput = document.getElementById("searchInput");

  const query = searchInput ? searchInput.value.trim() : "";
  const filters = getSearchFilters();

  RECEIVING_STATE.query = query;
  RECEIVING_STATE.filters = filters;

  updateSearchDescription();

  if (!RECEIVING_CONFIG.API_ENABLED || !RECEIVING_CONFIG.API_URL) {
    showApiError("The Receiving API is not configured.");
    return;
  }

  if (RECEIVING_STATE.loading) return;

  RECEIVING_STATE.loading = true;
  showLoadingState();

  try {
    const params = new URLSearchParams({
      action: "SEARCH_RECEIVING_HISTORY",
      query: query,
      limit: String(RECEIVING_CONFIG.PAGE_SIZE),
      offset: String(RECEIVING_STATE.offset),
      filters: JSON.stringify(filters)
    });

    const requestUrl =
      RECEIVING_CONFIG.API_URL + "?" + params.toString();

    const response = await fetch(requestUrl, {
      method: "GET",
      redirect: "follow",
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("HTTP error " + response.status);
    }

    const payload = await response.json();

    if (!payload || payload.ok !== true) {
      throw new Error(
        payload && payload.error
          ? payload.error
          : "The API returned an invalid response."
      );
    }

    // Apps Script response is nested:
    // payload.data.results

    const data = payload.data || {};

    if (data.ok === false) {
      throw new Error(data.error || "Historical search failed.");
    }

    RECEIVING_STATE.results = Array.isArray(data.results)
      ? data.results
      : [];
    
    
    RECEIVING_STATE.totalMessages =
      Number(data.totalMessages || 0);

    RECEIVING_STATE.totalFiles =
      Number(data.totalRelatedFiles || 0);

    renderSearchResults(data);

    console.info("Receiving search completed:", {
      query: query,
      totalMessages: RECEIVING_STATE.totalMessages,
      totalFiles: RECEIVING_STATE.totalFiles,
      returnedMessages: RECEIVING_STATE.results.length
    });

  } catch (error) {
    console.error("Receiving API error:", error);

    showApiError(
      "Unable to retrieve historical records. " +
      error.message +
      ". Check the API connection and browser console."
    );
 
  } finally {
    RECEIVING_STATE.loading = false;

    // Refresh synchronization status after a historical search.
    loadReceivingSyncStatus();
  }
}

function formatReceivingSyncDate(value, formattedValue) {
  if (formattedValue) return String(formattedValue);

  if (!value) return "No records found";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}


async function loadReceivingSyncStatus() {
  const receivedElement = document.getElementById("latestReceivedDate");
  const indexedElement = document.getElementById("latestIndexedDate");
  const feedbackElement = document.getElementById("syncStatusFeedback");
  const refreshButton = document.getElementById("refreshSyncStatus");

  if (!receivedElement || !indexedElement || !feedbackElement) {
    return;
  }

  if (!RECEIVING_CONFIG.API_ENABLED || !RECEIVING_CONFIG.API_URL) {
    feedbackElement.className = "sync-status-feedback is-error";
    feedbackElement.textContent = "The Receiving API is not configured.";
    return;
  }

  // Evita consultas simultáneas.
  if (RECEIVING_STATE.syncStatusLoading) return;

  RECEIVING_STATE.syncStatusLoading = true;

  if (refreshButton) {
    refreshButton.disabled = true;
    refreshButton.textContent = "Checking...";
  }

  feedbackElement.className = "sync-status-feedback";
  feedbackElement.textContent = "Checking database synchronization...";

  try {
    const params = new URLSearchParams({
      action: "GET_RECEIVING_SYNC_STATUS"
    });

    const requestUrl =
      RECEIVING_CONFIG.API_URL + "?" + params.toString();

    const response = await fetch(requestUrl, {
      method: "GET",
      redirect: "follow",
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("HTTP error " + response.status);
    }

    const payload = await response.json();

    if (!payload || payload.ok !== true) {
      throw new Error(
        payload && payload.error
          ? payload.error
          : "The API returned an invalid response."
      );
    }

    const data = payload.data || {};

    if (data.Success === false || data.success === false) {
      throw new Error(data.Error || data.error || "Unable to read synchronization status.");
    }

    const latestReceived =
      data.LatestReceived || data.latestReceived || null;

    const latestIndexed =
      data.LatestIndexed || data.latestIndexed || null;

    const receivedFormatted =
      data.LatestReceivedFormatted || data.latestReceivedFormatted || "";

    const indexedFormatted =
      data.LatestIndexedFormatted || data.latestIndexedFormatted || "";

    receivedElement.textContent = formatReceivingSyncDate(
      latestReceived,
      receivedFormatted
    );

    indexedElement.textContent = formatReceivingSyncDate(
      latestIndexed,
      indexedFormatted
    );

    // Preferimos el resultado calculado por Apps Script.
    // Si no viene, comparamos las fechas en el navegador.
    let hasPendingIndexing;

    if (typeof data.HasPendingIndexing === "boolean") {
      hasPendingIndexing = data.HasPendingIndexing;
    } else if (typeof data.hasPendingIndexing === "boolean") {
      hasPendingIndexing = data.hasPendingIndexing;
    } else {
      const receivedTime = latestReceived
        ? new Date(latestReceived).getTime()
        : NaN;

      const indexedTime = latestIndexed
        ? new Date(latestIndexed).getTime()
        : NaN;

      hasPendingIndexing =
        Number.isFinite(receivedTime) &&
        (!Number.isFinite(indexedTime) || receivedTime > indexedTime);
    }

    const hasReceived = Boolean(latestReceived || receivedFormatted);
    const hasIndexed = Boolean(latestIndexed || indexedFormatted);

    if (!hasReceived && !hasIndexed) {
      feedbackElement.className = "sync-status-feedback";
      feedbackElement.textContent =
        "No message records were found in the source or search index.";

    } else if (hasPendingIndexing || (hasReceived && !hasIndexed)) {
      feedbackElement.className = "sync-status-feedback is-warning";
      feedbackElement.textContent =
        "Attention: new messages have been received but may not yet be available in Historical Search.";

    } else {
      feedbackElement.className = "sync-status-feedback is-success";
      feedbackElement.textContent =
        "Synchronization is up to date. The latest received message is included in the historical search index.";
    }

    console.info("Receiving synchronization status:", data);

  } catch (error) {
    console.error("Receiving synchronization status error:", error);

    feedbackElement.className = "sync-status-feedback is-error";
    feedbackElement.textContent =
      "Unable to verify synchronization status. " + error.message;

  } finally {
    RECEIVING_STATE.syncStatusLoading = false;

    if (refreshButton) {
      refreshButton.disabled = false;
      refreshButton.textContent = "Refresh status";
    }
  }
}

function bindReceivingSyncButton() {
  const button = document.getElementById("refreshSyncStatus");

  if (!button || button.dataset.syncBound === "true") {
    return;
  }

  button.addEventListener("click", function(event) {
    event.preventDefault();

    console.log("Refresh sync status clicked.");

    loadReceivingSyncStatus();
  });

  button.dataset.syncBound = "true";

  console.log("Receiving sync button connected.");
}

function getSearchFilters() {
  return {
    dateFrom: document.getElementById("dateFrom")?.value || "",
    dateTo: document.getElementById("dateTo")?.value || "",
    mediaType: document.getElementById("mediaType")?.value || "",
    matchStatus: document.getElementById("matchStatus")?.value || "",
    fileType: document.getElementById("fileType")?.value || ""
  };
}


function updateSearchDescription() {
  const input = document.getElementById("searchInput");
  const description = document.getElementById("searchDescription");

  if (description) {
    description.textContent =
      input && input.value.trim()
        ? input.value.trim()
        : "All records";
  }
}


/* --------------------------------------------------
   RESULTS RENDERING
-------------------------------------------------- */

function renderSearchResults(data) {
  const container = document.getElementById("resultsContainer");
  if (!container) return;

  const messages = RECEIVING_STATE.results;

  document.getElementById("messageCount").textContent =
    RECEIVING_STATE.totalMessages.toLocaleString();

  document.getElementById("fileCount").textContent =
    RECEIVING_STATE.totalFiles.toLocaleString();

  document.getElementById("resultsCount").textContent =
    RECEIVING_STATE.totalMessages.toLocaleString() + " records";

  document.getElementById("resultsSubtitle").textContent =
    messages.length
      ? "Select a message to inspect its full content and associated files."
      : "No messages match your search criteria.";

  const systemMessage = document.getElementById("systemMessage");
  if (systemMessage) systemMessage.hidden = true;

  if (!messages.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⌕</div>
        <h3>No matching records</h3>
        <p>Try another keyword or adjust your search filters.</p>
      </div>
    `;

    updatePagination(data);
    return;
  }

  container.innerHTML = messages.map(function(message, index) {
    const files = Array.isArray(message.Files) ? message.Files : [];

    const thumbnails = files
      .filter(file => file.ThumbnailURL)
      .slice(0, 3)
      .map(function(file) {
        return `
          <a class="receiving-thumb-link"
             href="${escapeHTML(file.URL || file.ThumbnailURL)}"
             target="_blank"
             rel="noopener noreferrer"
             title="${escapeHTML(file.Name || "Open image")}">
            <img
              class="receiving-thumb"
              src="${escapeHTML(file.ThumbnailURL)}"
              alt="${escapeHTML(file.Name || "Associated image")}"
              loading="lazy"
              referrerpolicy="no-referrer"
            >
          </a>
        `;
      }).join("");

    const messageText = String(message.Message || "");
    const snippet = messageText.length > 300
      ? messageText.substring(0, 300) + "…"
      : messageText;

    const status = getMessageStatus(files);

    return `
      <article
        class="receiving-result-card"
        data-message-index="${index}"
        role="button"
        tabindex="0"
        aria-label="Open message ${escapeHTML(message.MessageID)}">

        <div class="receiving-result-main">
          <div class="receiving-result-top">
            <strong>${escapeHTML(message.MessageID || "Message")}</strong>
            <span class="receiving-status ${status.className}">
              ${escapeHTML(status.label)}
            </span>
          </div>

          <div class="receiving-result-meta">
            ${escapeHTML(message.Date || "")}
            ${message.Time ? " · " + escapeHTML(message.Time) : ""}
            ${message.Sender ? " · " + escapeHTML(message.Sender) : ""}
          </div>

          <div class="receiving-result-text">${escapeHTML(snippet)}</div>

          <div class="receiving-result-footer">
            <span>${escapeHTML(message.MediaType || "TEXT")}</span>
            <span>${files.length} associated file(s)</span>
            <span class="receiving-open-label">View details →</span>
          </div>
        </div>

        ${thumbnails ? `
          <div class="receiving-result-thumbnails">
            ${thumbnails}
          </div>
        ` : ""}

      </article>
    `;
  }).join("");

  updatePagination(data);
}


function getMessageStatus(files) {
  if (!files.length) {
    return { label: "NO FILES", className: "status-neutral" };
  }

  const statuses = files.map(file =>
    String(file.MatchStatus || "").toUpperCase()
  );

  if (statuses.includes("REVIEW")) {
    return { label: "REVIEW", className: "status-review" };
  }

  if (statuses.includes("CANDIDATE")) {
    return { label: "CANDIDATE", className: "status-candidate" };
  }

  if (statuses.every(status => status === "MATCHED")) {
    return { label: "MATCHED", className: "status-matched" };
  }

  return { label: statuses[0] || "UNCLASSIFIED", className: "status-neutral" };
}


/* --------------------------------------------------
   MESSAGE DETAIL
-------------------------------------------------- */

function showMessageDetail(message) {
  const files = Array.isArray(message.Files) ? message.Files : [];

  closeMessageDetail();

  const overlay = document.createElement("div");
  overlay.id = "receivingDetailOverlay";
  overlay.className = "receiving-detail-overlay";

  const fileHTML = files.length
    ? files.map(function(file) {
        const thumbnail = file.ThumbnailURL
          ? `
            <a href="${escapeHTML(file.URL || file.ThumbnailURL)}"
               target="_blank"
               rel="noopener noreferrer"
               class="receiving-detail-image-link">
              <img
                src="${escapeHTML(file.ThumbnailURL)}"
                alt="${escapeHTML(file.Name || "Receiving image")}"
                class="receiving-detail-image"
                loading="lazy"
                referrerpolicy="no-referrer"
              >
              <span>Open original image ↗</span>
            </a>
          `
          : `
            <div class="receiving-no-thumbnail">
              Preview unavailable
            </div>
          `;

        return `
          <div class="receiving-file-card">
            ${thumbnail}

            <div class="receiving-file-info">
              <strong>${escapeHTML(file.Name || "Unnamed file")}</strong>
              <span>Category: ${escapeHTML(file.FileCategory || "—")}</span>
              <span>Relation: ${escapeHTML(file.RelationType || "—")}</span>
              <span>Match method: ${escapeHTML(file.MatchMethod || "—")}</span>
              <span class="receiving-status ${getStatusClass(file.MatchStatus)}">
                ${escapeHTML(file.MatchStatus || "UNCLASSIFIED")}
              </span>
            </div>
          </div>
        `;
      }).join("")
    : `<p class="receiving-no-files">No files are associated with this message.</p>`;

  overlay.innerHTML = `
    <div class="receiving-detail-panel"
         role="dialog"
         aria-modal="true"
         aria-labelledby="receivingDetailTitle">

      <div class="receiving-detail-header">
        <div>
          <span class="receiving-detail-eyebrow">HISTORICAL MESSAGE</span>
          <h2 id="receivingDetailTitle">
            ${escapeHTML(message.MessageID || "Message detail")}
          </h2>
        </div>

        <button type="button"
                class="receiving-detail-close"
                aria-label="Close details">×</button>
      </div>

      <div class="receiving-detail-body">

        <div class="receiving-detail-metadata">
          <div>
            <span>Date</span>
            <strong>${escapeHTML(message.Date || "—")}</strong>
          </div>
          <div>
            <span>Time</span>
            <strong>${escapeHTML(message.Time || "—")}</strong>
          </div>
          <div>
            <span>Sender</span>
            <strong>${escapeHTML(message.Sender || "—")}</strong>
          </div>
          <div>
            <span>Media type</span>
            <strong>${escapeHTML(message.MediaType || "—")}</strong>
          </div>
        </div>

        <section class="receiving-detail-section">
          <h3>Full message</h3>
          <div class="receiving-full-message">${escapeHTML(message.Message || "")}</div>
        </section>

        <section class="receiving-detail-section">
          <h3>Associated files (${files.length})</h3>
          <p class="receiving-detail-help">
            Each file is displayed separately. REVIEW associations have not
            been approved or modified.
          </p>
          <div class="receiving-file-grid">
            ${fileHTML}
          </div>
        </section>

      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.querySelector(".receiving-detail-close")
    .addEventListener("click", closeMessageDetail);

  overlay.addEventListener("click", function(event) {
    if (event.target === overlay) closeMessageDetail();
  });

  document.addEventListener("keydown", handleDetailEscape);
}


function getStatusClass(status) {
  const value = String(status || "").toUpperCase();

  if (value === "REVIEW") return "status-review";
  if (value === "CANDIDATE") return "status-candidate";
  if (value === "MATCHED") return "status-matched";

  return "status-neutral";
}


function closeMessageDetail() {
  const overlay = document.getElementById("receivingDetailOverlay");

  if (overlay) overlay.remove();

  document.removeEventListener("keydown", handleDetailEscape);
}


function handleDetailEscape(event) {
  if (event.key === "Escape") closeMessageDetail();
}


/* --------------------------------------------------
   PAGINATION
-------------------------------------------------- */

function updatePagination(data) {
  const pagination = document.getElementById("pagination");
  const previous = document.getElementById("previousPage");
  const next = document.getElementById("nextPage");
  const indicator = document.getElementById("pageIndicator");

  if (!pagination) return;

  const total = RECEIVING_STATE.totalMessages;
  const currentPage =
    Math.floor(RECEIVING_STATE.offset / RECEIVING_CONFIG.PAGE_SIZE) + 1;

  const totalPages = Math.max(
    1,
    Math.ceil(total / RECEIVING_CONFIG.PAGE_SIZE)
  );

  pagination.hidden = total === 0;

  if (indicator) {
    indicator.textContent = `Page ${currentPage} of ${totalPages}`;
  }

  if (previous) {
    previous.disabled = RECEIVING_STATE.offset === 0;
  }

  if (next) {
    next.disabled = !data.hasMore &&
      RECEIVING_STATE.offset + RECEIVING_CONFIG.PAGE_SIZE >= total;
  }
}


/* --------------------------------------------------
   FILTER RESET
-------------------------------------------------- */

function resetSearchFilters() {

  // Limpiar cadena de búsqueda
  const searchInput = document.getElementById("searchInput");

  if (searchInput) {
    searchInput.value = "";
  }

  // Limpiar indicador visual del campo
  const searchWrapper = document.querySelector(".search-input-wrap");

  if (searchWrapper) {
    searchWrapper.classList.remove("has-value");
  }

  // Limpiar todos los filtros
  [
    "dateFrom",
    "dateTo",
    "mediaType",
    "matchStatus",
    "fileType"
  ].forEach(function(id) {

    const element = document.getElementById(id);

    if (element) {
      element.value = "";
    }

  });

  // Reiniciar paginación
  RECEIVING_STATE.offset = 0;

  // Actualizar indicador Current Search
  updateSearchDescription();

  // Ejecutar búsqueda sin restricciones
  searchHistoricalRecords();

}


/* --------------------------------------------------
   INTERFACE STATES
-------------------------------------------------- */

function showLoadingState() {
  const container = document.getElementById("resultsContainer");

  if (container) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="receiving-loader"></div>
        <h3>Searching historical records…</h3>
        <p>Connecting to the Artemisa Receiving database.</p>
      </div>
    `;
  }

  const message = document.getElementById("systemMessage");
  if (message) message.hidden = true;
}


function showApiError(errorText) {
  const message = document.getElementById("systemMessage");

  if (message) {
    message.hidden = false;

    const heading = message.querySelector("strong");
    const paragraph = message.querySelector("p");

    if (heading) heading.textContent = "Connection error";
    if (paragraph) paragraph.textContent = errorText;
  }

  const container = document.getElementById("resultsContainer");

  if (container) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">!</div>
        <h3>Unable to load records</h3>
        <p>${escapeHTML(errorText)}</p>
      </div>
    `;
  }

  const pagination = document.getElementById("pagination");
  if (pagination) pagination.hidden = true;
}



/* --------------------------------------------------
   STYLES FOR DYNAMIC DETAILS
-------------------------------------------------- */

function addReceivingStyles() {
  if (document.getElementById("receivingDynamicStyles")) return;

  const style = document.createElement("style");
  style.id = "receivingDynamicStyles";

  style.textContent = `
    .receiving-result-card {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 18px;
      padding: 18px;
      margin-bottom: 12px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      background: #fff;
      cursor: pointer;
      transition: border-color .2s, box-shadow .2s;
    }

    .receiving-result-card:hover,
    .receiving-result-card:focus {
      border-color: #8baed5;
      box-shadow: 0 4px 16px rgba(15, 40, 70, .08);
      outline: none;
    }

    .receiving-result-main {
      flex: 1;
      min-width: 0;
    }

    .receiving-result-top,
    .receiving-result-footer {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .receiving-result-meta {
      margin: 8px 0;
      color: #64748b;
      font-size: 12px;
    }

    .receiving-result-text {
      color: #334155;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      line-height: 1.55;
    }

    .receiving-result-footer {
      justify-content: flex-start;
      margin-top: 12px;
      color: #64748b;
      font-size: 12px;
      gap: 16px;
    }

    .receiving-open-label {
      margin-left: auto;
      color: #2563a6;
      font-weight: 600;
    }

    .receiving-result-thumbnails {
      display: flex;
      gap: 7px;
      flex-shrink: 0;
    }

    .receiving-thumb-link {
      display: block;
      width: 72px;
      height: 72px;
      overflow: hidden;
      border-radius: 8px;
      background: #f1f5f9;
    }

    .receiving-thumb {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .receiving-status {
      display: inline-block;
      padding: 4px 9px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: .04em;
    }

    .status-review {
      color: #92400e;
      background: #fef3c7;
    }

    .status-candidate {
      color: #1e40af;
      background: #dbeafe;
    }

    .status-matched {
      color: #166534;
      background: #dcfce7;
    }

    .status-neutral {
      color: #475569;
      background: #e2e8f0;
    }

    .receiving-detail-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      justify-content: flex-end;
      background: rgba(15, 23, 42, .55);
    }

    .receiving-detail-panel {
      width: min(760px, 100%);
      height: 100%;
      overflow-y: auto;
      background: #fff;
      box-shadow: -8px 0 30px rgba(0,0,0,.16);
    }

    .receiving-detail-header {
      position: sticky;
      top: 0;
      z-index: 2;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 22px 26px;
      border-bottom: 1px solid #e2e8f0;
      background: #fff;
    }

    .receiving-detail-eyebrow {
      color: #64748b;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: .12em;
    }

    .receiving-detail-header h2 {
      margin: 5px 0 0;
      color: #172b45;
      font-size: 21px;
    }

    .receiving-detail-close {
      width: 38px;
      height: 38px;
      border: 0;
      border-radius: 50%;
      background: #f1f5f9;
      color: #334155;
      font-size: 26px;
      cursor: pointer;
    }

    .receiving-detail-body {
      padding: 24px 26px 40px;
    }

    .receiving-detail-metadata {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
      padding: 17px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      background: #f8fafc;
    }

    .receiving-detail-metadata div {
      display: flex;
      flex-direction: column;
      gap: 5px;
      min-width: 0;
    }

    .receiving-detail-metadata span,
    .receiving-file-info span {
      color: #64748b;
      font-size: 12px;
    }

    .receiving-detail-metadata strong {
      color: #1e293b;
      overflow-wrap: anywhere;
    }

    .receiving-detail-section {
      margin-top: 26px;
    }

    .receiving-detail-section h3 {
      margin: 0 0 12px;
      color: #172b45;
      font-size: 16px;
    }

    .receiving-full-message {
      padding: 17px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      background: #fff;
      color: #334155;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      line-height: 1.65;
    }

    .receiving-detail-help {
      color: #64748b;
      font-size: 12px;
      line-height: 1.5;
    }

    .receiving-file-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 15px;
    }

    .receiving-file-card {
      min-width: 0;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      background: #fff;
    }

    .receiving-detail-image-link {
      display: block;
      color: #2563a6;
      font-size: 11px;
      text-decoration: none;
    }

    .receiving-detail-image {
      display: block;
      width: 100%;
      aspect-ratio: 4 / 3;
      object-fit: contain;
      background: #f1f5f9;
    }

    .receiving-detail-image-link span {
      display: block;
      padding: 8px 11px 0;
    }

    .receiving-file-info {
      display: flex;
      flex-direction: column;
      gap: 7px;
      padding: 12px;
      overflow-wrap: anywhere;
    }

    .receiving-file-info strong {
      color: #1e293b;
      font-size: 12px;
      line-height: 1.45;
    }

    .receiving-no-thumbnail {
      display: grid;
      place-items: center;
      min-height: 130px;
      background: #f1f5f9;
      color: #64748b;
      font-size: 12px;
    }

    .receiving-no-files {
      color: #64748b;
      font-size: 13px;
    }

    .receiving-loader {
      width: 28px;
      height: 28px;
      margin: 0 auto 12px;
      border: 3px solid #dbeafe;
      border-top-color: #2563a6;
      border-radius: 50%;
      animation: receiving-spin .8s linear infinite;
    }

    @keyframes receiving-spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 600px) {
      .receiving-result-card {
        flex-direction: column;
      }

      .receiving-result-thumbnails {
        flex-wrap: wrap;
      }

      .receiving-thumb-link {
        width: 65px;
        height: 65px;
      }

      .receiving-file-grid {
        grid-template-columns: 1fr;
      }

      .receiving-detail-header,
      .receiving-detail-body {
        padding-left: 17px;
        padding-right: 17px;
      }
    }
  `;

  document.head.appendChild(style);
}


/* --------------------------------------------------
   UTILITIES
-------------------------------------------------- */

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, function(character) {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[character];
  });
}
