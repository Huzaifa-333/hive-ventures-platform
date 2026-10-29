import { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:5000/api';


function App() {

    // Navigation functions
    // ========== STATE MANAGEMENT ==========
    // /state declarations for active section, user authentication, and UI states

const [activeSection, setActiveSection] = useState(() => {
  const saved = localStorage.getItem('activeSection');
  return saved && saved !== 'home' ? saved : 'home';
});
const [currentUser, setCurrentUser] = useState(null);
const [navOpen, setNavOpen] = useState(false); // Mobile nav open state
const [dropdownOpen, setDropdownOpen] = useState(false); // Dropdown open state for mobile
const basePath = process.env.PUBLIC_URL;   // Base path for assets


// Save scroll position before refresh
useEffect(() => {
  const handleBeforeUnload = () => {
    localStorage.setItem('scrollPosition', window.scrollY);
    localStorage.setItem('savedSection', activeSection);
  };
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [activeSection]);

// Restore scroll position after refresh
useEffect(() => {
  const savedScroll = localStorage.getItem('scrollPosition');
  const savedSection = localStorage.getItem('savedSection');
  
  if (savedSection === activeSection && savedScroll) {
    setTimeout(() => {
      window.scrollTo(0, parseInt(savedScroll));
      localStorage.removeItem('scrollPosition');
      localStorage.removeItem('savedSection');
    }, 100);
  }
}, [activeSection]);

//This removes the animation class when leaving and re-checks position when entering.
 const showSection = (sectionId) => {
  setActiveSection(sectionId);
  window.scrollTo(0, 0);
  // Trigger line animation for properties and dashboard
  if (sectionId === 'properties' || sectionId === 'dashboard') {
    // Wait longer for the section to render
    setTimeout(() => {
      const heading = document.querySelector(`#${sectionId} h2`);
      if (heading) {
        
        // Remove class first
        heading.classList.remove('heading-visible');
        // Force reflow
        void heading.offsetHeight;
        // Add class
        heading.classList.add('heading-visible');
                
        // Remove class after x seconds
        setTimeout(() => {
          heading.classList.remove('heading-visible');
        }, 300);
      } else {
        console.log('Heading not found for:', sectionId);
      }
    }, 300);
  }

  
  // Force reset heading animation
  setTimeout(() => {
    const propHeading = document.querySelector('#properties h2');
    const dashHeading = document.querySelector('#dashboard h2');
    
    if (propHeading) {
      propHeading.classList.remove('heading-visible');
    }
    if (dashHeading) {
      dashHeading.classList.remove('heading-visible');
    }
    
    // Re-trigger check after a moment
    setTimeout(() => {
      if (sectionId === 'properties' && propHeading) {
        const rect = propHeading.getBoundingClientRect();
        if (rect.top <= 150) {
          propHeading.classList.add('heading-visible');
        }
      }
      if (sectionId === 'dashboard' && dashHeading) {
        const rect = dashHeading.getBoundingClientRect();
        if (rect.top <= 150) {
          dashHeading.classList.add('heading-visible');
        }
      }
    }, 150);
  }, 50);
};

 const showDashboard = async () => {
  if (currentUser) {
    // Fetch fresh user data before showing dashboard
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: { 'Authorization': token }
        });
        const data = await response.json();
        if (data.user) {
          setCurrentUser(data.user);
        }
      } catch (err) {
        console.log('Error fetching user data');
      }
    }
    
    setActiveSection('dashboard');
    // Add underline animation for dashboard heading
    // Wait for dashboard to render
    setTimeout(() => {
      const heading = document.querySelector('#dashboard h2');
      if (heading) {
        // Clear any existing timeout
        if (window.dashboardTimeout) clearTimeout(window.dashboardTimeout);
        heading.classList.remove('heading-visible');
        void heading.offsetHeight;
        heading.classList.add('heading-visible');
        window.dashboardTimeout = setTimeout(() => {
          heading.classList.remove('heading-visible');
        }, 400);
      }
    }, 150);
  } else {
    setActiveSection('login');
  }
};

const logout = () => {
  setCurrentUser(null);            // Clear user state on logout
  setActiveSection('home');      // Redirect to home on logout
  localStorage.removeItem('token');  // Clear token on logout
};

// Show message helper function
const showMessage = (element, text, type) => {
  if (!element) return;
  element.textContent = text;
  element.className = `msg-area msg-${type}`;
};

useEffect(() => {

  
// ========== REGISTER FORM HANDLER ==========
const registerForm = document.getElementById('register-form');
if (registerForm && !registerForm.hasAttribute('data-listener')) {
  registerForm.setAttribute('data-listener', 'true');
  
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Disable button to prevent double submission/request
    const submitBtn = document.querySelector('#register-form .submit-btn');
    submitBtn.disabled = true;
    
    const username = document.getElementById('reg-username').value;
const password = document.getElementById('reg-password').value;
const email = document.getElementById('reg-email').value;
const age = document.getElementById('reg-age').value;
const role = document.getElementById('reg-role').value;
const gender = document.querySelector('input[name="gender"]:checked').value;
const msgArea = document.getElementById('register-msg');

// Password validation
const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/;
if (!passwordRegex.test(password)) {
  showMessage(msgArea, 'Password must have at least 6 chars, 1 number and 1 special character', 'error');
  submitBtn.disabled = false;
  return;
}

// Age validation
if (age && (parseInt(age) < 18 || parseInt(age) > 100)) {
  showMessage(msgArea, 'Age must be 18 or above', 'error');
  submitBtn.disabled = false;
  return;
}

    
    try {
      console.log('Sending register request...');
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role, email, age: parseInt(age), gender })
      });
      const data = await response.json();
      if (response.ok) {
  showMessage(msgArea, 'Registration successful! Please login.', 'success');
  // Clear form fields
  document.getElementById('reg-username').value = '';
  document.getElementById('reg-password').value = '';
  document.getElementById('reg-role').value = 'investor';
  setTimeout(() => showSection('login'), 1500);
}
      else {
        showMessage(msgArea, data.message || 'Registration failed', 'error');
      }
    } catch (error) {
      showMessage(msgArea, 'Server error. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });
}

// ========== LOGIN FORM HANDLER ==========
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const msgArea = document.getElementById('login-msg');
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
     if (response.ok) {
  localStorage.setItem('token', data.token);
  
  // Fetch full user profile
  const fullUserRes = await fetch(`${API_URL}/auth/me`, {
    headers: { 'Authorization': data.token }
  });
  const fullUserData = await fullUserRes.json();
  if (fullUserData.user) {
    setCurrentUser(fullUserData.user);
  } else {
    setCurrentUser(data.user);
  }
  
  showMessage(msgArea, 'Login successful!', 'success');
  document.getElementById('login-username').value = '';
  document.getElementById('login-password').value = '';
  setTimeout(() => setActiveSection('dashboard'), 1000);
}
       else {
        showMessage(msgArea, data.message || 'Login failed', 'error');
      }
    } catch (error) {
      showMessage(msgArea, 'Server error. Please try again.', 'error');
    }
  });
}

// /these two above code for register and login to connect frontend forms to backend API, handle responses, and update UI accordingly

{/* ======== PASSWORD RECOVERY HANDLER ========== */}
     
   const forgotLink = document.getElementById('forgotPasswordLink');
if (forgotLink) {
  forgotLink.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('recoveryModal').style.display = 'flex';
    document.getElementById('step1').style.display = 'block';
    document.getElementById('step2').style.display = 'none';
    document.getElementById('recovery-email').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
    document.getElementById('recovery-msg').className = 'msg-area';
  });
}

const sendResetBtn = document.getElementById('sendResetBtn');
if (sendResetBtn) {
  sendResetBtn.addEventListener('click', async () => {
    const email = document.getElementById('recovery-email').value;
    const msgArea = document.getElementById('recovery-msg');
    
    if (!email) {
      showMessage(msgArea, 'Please enter your email', 'error');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (response.ok) {
        showMessage(msgArea, 'Email verified! Enter new password.', 'success');
        document.getElementById('step1').style.display = 'none';
        document.getElementById('step2').style.display = 'block';
        window.resetUserId = data.userId;
      } else {
        showMessage(msgArea, data.message || 'Email not found', 'error');
      }
    } catch (error) {
      showMessage(msgArea, 'Server error', 'error');
    }
  });
}

const resetPasswordBtn = document.getElementById('resetPasswordBtn');
if (resetPasswordBtn) {
  resetPasswordBtn.addEventListener('click', async () => {
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const msgArea = document.getElementById('recovery-msg');
    
    if (!newPassword || !confirmPassword) {
      showMessage(msgArea, 'Please fill both password fields', 'error');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: window.resetUserId,
          newPassword,
          confirmPassword
        })
      });
      const data = await response.json();
      if (response.ok) {
        showMessage(msgArea, 'Password reset successful! Please login.', 'success');
        setTimeout(() => {
          document.getElementById('recoveryModal').style.display = 'none';
          showSection('login');
        }, 2000);
      } else {
        showMessage(msgArea, data.message || 'Reset failed', 'error');
      }
    } catch (error) {
      showMessage(msgArea, 'Server error', 'error');
    }
  });
}  

// Investment Modal Confirm Handler
const confirmInvestBtn = document.getElementById('confirmInvestBtn');
if (confirmInvestBtn && !confirmInvestBtn.hasAttribute('data-listener')) {
  confirmInvestBtn.setAttribute('data-listener', 'true');
  confirmInvestBtn.addEventListener('click', async () => {
    const amountInput = document.getElementById('investmentAmount');
    const amount = parseInt(amountInput.value);
    const msgArea = document.getElementById('investment-msg');
    const modal = document.getElementById('investmentModal');
    
    if (!amount || amount < 1000) {
      showMessage(msgArea, 'Minimum investment amount is $1000', 'error');
      return;
    }
    
    if (amount > window.currentInvestment.maxAmount) {
      showMessage(msgArea, `Maximum investment amount is $${window.currentInvestment.maxAmount.toLocaleString()}`, 'error');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/investments/invest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify({ 
          propertyId: window.currentInvestment.propertyId, 
          amount: amount 
        })
      });
      const data = await response.json();
      if (response.ok) {
  showMessage(msgArea, `Investment successful! Cheque No: ${data.investment.chequeNumber}. You can download it from Dashboard.`, 'success');
  setTimeout(() => {
    modal.style.display = 'none';
    window.location.reload();
  }, 2000);
}
      else {
        showMessage(msgArea, data.message || 'Investment failed', 'error');
      }
    } catch (error) {
      showMessage(msgArea, 'Server error', 'error');
    }
  });
}

//  Property Modal Confirm Handler
const confirmAddPropertyBtn = document.getElementById('confirmAddPropertyBtn');
if (confirmAddPropertyBtn && !confirmAddPropertyBtn.hasAttribute('data-listener')) {
  confirmAddPropertyBtn.setAttribute('data-listener', 'true');
  confirmAddPropertyBtn.addEventListener('click', async () => {
    const title = document.getElementById('propertyTitle').value;
    const price = document.getElementById('propertyPrice').value;
    const city = document.getElementById('propertyCity').value;
    const msgArea = document.getElementById('property-msg');
    const modal = document.getElementById('addPropertyModal');
    
    if (!title || !price || !city) {
      showMessage(msgArea, 'Please fill all fields', 'error');
      return;
    }
    
    const defaultImage = '/assets/sampleproperty.avif';
    try {
      const response = await fetch(`${API_URL}/properties/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify({ 
          title, 
          price: parseInt(price), 
          status: 'Available', 
          totalShares: 100, 
          availableShares: 100,
          image: defaultImage,
          location: city,
          description: 'New property added by admin'
        })
      });
      if (response.ok) {
        showMessage(msgArea, 'Property added successfully!', 'success');
        setTimeout(() => {
          modal.style.display = 'none';
          window.location.reload();
        }, 1500);
      } else {
        showMessage(msgArea, 'Failed to add property', 'error');
      }
    } catch (error) {
      showMessage(msgArea, 'Server error', 'error');
    }
  });
}

// ========== CONTACT FORM HANDLER ==========
const contactForm = document.getElementById('contact-form');
if (contactForm && !contactForm.hasAttribute('data-listener')) {
  contactForm.setAttribute('data-listener', 'true');
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const msg = document.getElementById('contact-msg').value.trim();
    const msgArea = document.getElementById('contact-msg-area');

    try {
      const checkRes = await fetch(`${API_URL}/contact/check-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      });

      if (checkRes.ok) {
        const checkData = await checkRes.json();
        const responseText = checkData.adminResponse || 'No response yet — we will get back to you shortly.';
        const popup = document.getElementById('contact-response-popup');
        const popupMsg = document.getElementById('contact-response-text');
        if (popup && popupMsg) {
          popupMsg.textContent = responseText;
          popup.style.display = 'flex';
        }
        return;
      }

      const response = await fetch(`${API_URL}/contact/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message: msg })
      });
      const data = await response.json();
      if (response.ok) {
        showMessage(msgArea, 'Message sent! We will get back to you within 24 hours.', 'success');
        contactForm.reset();
      } else {
        showMessage(msgArea, data.message || 'Failed to send message', 'error');
      }
    } catch (error) {
      showMessage(msgArea, 'Server error. Please try again.', 'error');
    }
  });
}

  // ========== PROPERTIES RENDERING ==========

  // Only scroll to top if coming from a different page, not on refresh
if (!sessionStorage.getItem('justRefreshed')) {
  window.scrollTo(0, 0);
}
sessionStorage.setItem('justRefreshed', 'true');

// Function to fetch and render properties from backend API from mongodb 
 const renderProperties = async () => {
  try {
    const response = await fetch(`${API_URL}/properties`);
    const properties = await response.json();
    
    const container = document.getElementById('property-list');
    if (!container) return;
    container.innerHTML = '';
    
    properties.forEach(prop => {
      const card = document.createElement('div');
      card.className = 'card';
      let statusClass = '';
if (prop.status.toLowerCase() === 'available') {
  statusClass = 'available';
} else if (prop.status.toLowerCase() === 'under construction') {
  statusClass = 'underconstruction';
} else {
  statusClass = 'sold';
}
      const availableAmount = (prop.availableShares / prop.totalShares) * prop.price;
    const isAdmin = currentUser?.role === 'admin';
const investButton = !isAdmin ? `<button class="cta-btn" onclick="investInProperty('${prop._id}', '${prop.title}', ${prop.price}, ${prop.availableShares}, ${prop.totalShares})" style="width:100%; margin:0;">Invest Now →</button>` : '';

card.innerHTML = `
  <img src="${basePath + prop.image}" alt="${prop.title}" onerror="this.style.display='none'">
  <div class="card-body">
    <div style="display: flex; justify-content: space-between; align-items: center;">
  <h3>${prop.title}</h3>
 <button onclick="showPropertyDetails('${prop._id}', '${prop.title}', '${prop.location || 'Lahore'}', ${prop.price}, ${prop.availableShares}, ${prop.totalShares}, '${prop.status}', '${prop.image}', '${prop.description ||
   'Premium residential property with high investment potential.'}')" style="background: none; border: none; font-size: 0.9rem; cursor: pointer; color: #aaa; padding-left: 0.5rem;">ⓘ</button>
</div>
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
      <p class="card-price" style="margin:0;">rs.${prop.price.toLocaleString()}</p>
      <span style="font-size:0.78rem; color:var(--dark-grey); font-weight:400;">📍 ${prop.location || 'N/A'}</span>
    </div>
    <div class="investment-info">
      <span>Shares left: ${prop.availableShares} / ${prop.totalShares}</span>
      <span>Max investment: $${availableAmount.toLocaleString()}</span>
    </div>
    <span class="card-status ${statusClass}">${prop.status}</span>
    ${investButton}
  </div>
`;
      container.appendChild(card);
    });
  } catch (error) {
    console.log('Error loading properties:', error);
  }
};

// this bellow function is for handling the investment action update ui based on response
window.investInProperty = async (propertyId, propertyName, price, availableShares, totalShares) => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login first');
    showSection('login');
    return;
  }
  
  const sharePrice = price / totalShares;
  const maxAmount = availableShares * sharePrice;
  
  // Store property data in global for modal
  window.currentInvestment = { propertyId, propertyName, maxAmount };
  
  // Show modal
  const modal = document.getElementById('investmentModal');
  const title = document.getElementById('investmentModalTitle');
  const maxInfo = document.getElementById('maxAmountInfo');
  const amountInput = document.getElementById('investmentAmount');
  const msgArea = document.getElementById('investment-msg');
  
  title.innerText = `Invest in ${propertyName}`;
  maxInfo.innerText = `Maximum available: $${maxAmount.toLocaleString()} | Minimum: $1,000`;
  amountInput.value = '';
  msgArea.className = 'msg-area';
  modal.style.display = 'flex';
};


window.showPropertyDetails = (propertyId, title, location, price, sharesLeft, totalShares, status, image, description) => {
  const modal = document.getElementById('propertyDetailModal');
  const sharePrice = price / totalShares;
  const maxInvestment = sharesLeft * sharePrice;
  
  document.getElementById('detailTitle').innerText = title;
  document.getElementById('detailLocation').innerHTML = `📍 ${location}`;
  document.getElementById('detailPrice').innerHTML = `$${price.toLocaleString()}`;
  document.getElementById('detailMaxInvestment').innerHTML = `$${Math.round(maxInvestment).toLocaleString()}`;
  document.getElementById('detailShares').innerHTML = `${sharesLeft} / ${totalShares}`;
  document.getElementById('detailStatus').innerHTML = status;
  document.getElementById('detailDescription').innerText = description;
  modal.style.display = 'flex';
};


  // below function is for handling the withdrawal of investment action update ui based on response
  
 // Withdraw investment — forces full dashboard re-render after withdrawal
window.withdrawInvestment = async (investmentId) => {
  const token = localStorage.getItem('token');
  if (!token) return;
  
  if (!window.confirm('Are you sure you want to withdraw? Early withdrawal may return only your original investment.')) return;
  
  try {
    const response = await fetch(`${API_URL}/investments/withdraw/${investmentId}`, {
      method: 'POST',
      headers: { 'Authorization': token }
    });
    const data = await response.json();
    alert(data.message + (data.amount ? ` Amount: $${data.amount.toLocaleString()}` : ''));
    // Clear activeSection from localStorage so dashboard fully re-fetches on reload
    localStorage.removeItem('activeSection');
    localStorage.setItem('activeSection', 'dashboard');
    window.location.reload();
  } catch (error) {
    alert('Withdrawal failed');
  }
};

// Helper function to update dashboard totals without reload
const updateDashboardTotals = () => {
  const rows = document.querySelectorAll('#dashboard-content .dash-table tbody tr:not(.withdrawn-row)');
  let totalInvested = 0;
  let totalShare = 0;
  rows.forEach(row => {
    const amount = parseFloat(row.cells[1]?.innerText.replace('$', '').replace(/,/g, '')) || 0;
    const share = parseFloat(row.cells[2]?.innerText.replace('%', '')) || 0;
    totalInvested += amount;
    totalShare += share;
  });
  const totalInvestedEl = document.querySelector('#dashboard-content .dash-stats .dash-stat-card:first-child .dash-stat-num');
  const totalShareEl = document.querySelector('#dashboard-content .dash-stats .dash-stat-card:nth-child(2) .dash-stat-num');
  if (totalInvestedEl) totalInvestedEl.innerText = `$${totalInvested.toLocaleString()}`;
  if (totalShareEl) totalShareEl.innerText = totalShare.toFixed(1);
};

//admin and investor can delete investment record from dashboard, this  will handle delete action and update ui based on response
window.deleteInvestment = async (investmentId) => {
  const token = localStorage.getItem('token');
  if (!token) return;
  
  // First check if investment is active by checking row class
  const button = document.querySelector(`button[onclick="deleteInvestment('${investmentId}')"]`);
  const row = button.closest('tr');
  const isWithdrawn = row.classList.contains('withdrawn-row');
  
  if (!isWithdrawn) {
    alert('To delete an active investment, you must withdraw it first');
    return;
  }
  
  if (!window.confirm('Are you sure you want to delete this investment record?')) return;
  
  try {
    const response = await fetch(`${API_URL}/investments/${investmentId}`, {
      method: 'DELETE',
      headers: { 'Authorization': token }
    });
    const data = await response.json();
    alert(data.message);
    // Force full reload so admin dashboard re-fetches all tables with fresh data
    localStorage.removeItem('activeSection');
    localStorage.setItem('activeSection', 'dashboard');
    window.location.reload();
  } catch (error) {
    alert('Delete failed');
  }
};

// /admin functions
 window.editPropertyInline = (propertyId) => {
  const row = document.querySelector(`tr[data-id="${propertyId}"]`);
  const cells = row.querySelectorAll('td');

  // Read values from the span elements directly — avoids picking up hidden input text
  const oldTitle = row.querySelector('.prop-title')?.innerText || cells[0].innerText;
  const oldCity = row.querySelector('.prop-city')?.innerText || cells[1].innerText;
  const oldPrice = row.querySelector('.prop-price')?.innerText.replace('Rs','').replace(/,/g,'') || '0';
  const oldCurrentValue = row.querySelector('.prop-current-value')?.innerText.replace('$','').replace(/,/g,'') || oldPrice;
  const oldStatus = row.querySelector('.status-badge')?.innerText || 'Available';

  // Replace cells with inputs
  cells[0].innerHTML = `<input class="edit-input edit-title" value="${oldTitle}" style="width:100px">`;
  cells[1].innerHTML = `<input class="edit-input edit-city" value="${oldCity}" style="width:80px">`;
  cells[2].innerHTML = `<input class="edit-input edit-price" value="${oldPrice}" style="width:80px">`;
  cells[3].innerHTML = `<input class="edit-input edit-current-value" value="${oldCurrentValue}" style="width:80px">`;
  cells[4].innerHTML = `
    <select class="edit-status">
      <option value="Available" ${oldStatus === 'Available' ? 'selected' : ''}>Available</option>
      <option value="Under Construction" ${oldStatus === 'Under Construction' ? 'selected' : ''}>Under Construction</option>
      <option value="Sold" ${oldStatus === 'Sold' ? 'selected' : ''}>Sold</option>
    </select>
  `;

  // Action buttons cell — last column
  const actionCell = cells[cells.length - 1];
  actionCell.innerHTML = `
    <button class="edit-property-btn" onclick="savePropertyEditFromRow('${propertyId}')">Save</button>
    <button class="cancel-property-btn" onclick="cancelPropertyEditFromRow('${propertyId}', '${oldTitle}', '${oldCity}', '${oldPrice}', '${oldCurrentValue}', '${oldStatus}')">Cancel</button>
    <button class="delete-property-btn" onclick="deleteProperty('${propertyId}')">Delete</button>
  `;

  row.classList.add('editing');
};


 window.savePropertyEditFromRow = async (propertyId) => {
  const row = document.querySelector(`tr[data-id="${propertyId}"]`);

  const newTitle = row.querySelector('.edit-title')?.value;
  const newCity = row.querySelector('.edit-city')?.value;
  const newPrice = parseInt(row.querySelector('.edit-price')?.value) || 0;
  const newCurrentValue = parseInt(row.querySelector('.edit-current-value')?.value) || newPrice;
  const newStatus = row.querySelector('.edit-status')?.value || 'Available';

  console.log('=== SAVE DEBUG ===');
  console.log('currentValue being sent:', newCurrentValue);

  const payload = { 
    title: newTitle, 
    location: newCity, 
    price: newPrice,
    currentValue: newCurrentValue,
    status: newStatus 
  };

  try {
    const response = await fetch(`${API_URL}/properties/admin/${propertyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token')
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (response.ok) {
      window.location.reload(); // restore reload now that save is confirmed working
    } else {
      alert('Failed: ' + (data.message || 'Unknown error'));
    }

  } catch (error) {
    alert('Fetch error: ' + error.message);
  }
};

window.cancelPropertyEditFromRow = (propertyId, oldTitle, oldCity, oldPrice, oldCurrentValue, oldStatus) => {
  const row = document.querySelector(`tr[data-id="${propertyId}"]`);
  const cells = row.querySelectorAll('td');
  
  cells[0].innerHTML = oldTitle;
  cells[1].innerHTML = oldCity;
  cells[2].innerHTML = `$${parseInt(oldPrice).toLocaleString()}`;
  cells[3].innerHTML = `$${parseInt(oldCurrentValue).toLocaleString()}`;
  cells[4].innerHTML = `<span class="status-badge ${oldStatus === 'Under Construction' ? 'underconstruction' : oldStatus.toLowerCase()}">${oldStatus}</span>`;
  
  const actionCell = cells[cells.length - 1];
  actionCell.innerHTML = `
    <button class="edit-property-btn" onclick="editPropertyInline('${propertyId}')">Edit</button>
    <button class="delete-property-btn" onclick="deleteProperty('${propertyId}')">Delete</button>
  `;
  
  row.classList.remove('editing');
};

window.deleteProperty = (propertyId) => {
  if (window.confirm('Delete this property?')) {
    fetch(`${API_URL}/properties/admin/${propertyId}`, {
      method: 'DELETE',
      headers: { 'Authorization': localStorage.getItem('token') }
    }).then(() => window.location.reload());
  }
};

window.deleteInvestmentByAdmin = (investmentId) => {
 if (window.confirm('Delete this investment?')) {
    fetch(`${API_URL}/investments/admin/${investmentId}`, {
      method: 'DELETE',
      headers: { 'Authorization': localStorage.getItem('token') }
    }).then(() => window.location.reload());
  }
};

window.deleteUserByAdmin = (userId) => {
 if (window.confirm('Delete this user?')) {
    fetch(`${API_URL}/auth/user/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': localStorage.getItem('token') }
    }).then(() => window.location.reload());
  }
};

// Admin profile functions
window.toggleEditProfileAdmin = () => {
  document.getElementById('profile-view-admin').style.display = 'none';
  document.getElementById('profile-edit-admin').style.display = 'block';
};

window.cancelEditProfileAdmin = () => {
  document.getElementById('profile-view-admin').style.display = 'block';
  document.getElementById('profile-edit-admin').style.display = 'none';
};

window.saveProfileAdmin = async () => {
  const token = localStorage.getItem('token');
  const updatedData = {
    username: document.getElementById('edit-admin-username').value,
    email: document.getElementById('edit-admin-email').value
  };
  
  const response = await fetch(`${API_URL}/auth/update-profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': token },
    body: JSON.stringify(updatedData)
  });
  const data = await response.json();
  if (response.ok) {
    alert('Profile updated');
    window.location.reload();
  }
};

 window.showAddPropertyModal = () => {
  const modal = document.getElementById('addPropertyModal');
  const msgArea = document.getElementById('property-msg');
  if (msgArea) msgArea.className = 'msg-area';
  document.getElementById('propertyTitle').value = '';
  document.getElementById('propertyPrice').value = '';
  document.getElementById('propertyCity').value = '';
  modal.style.display = 'flex';
};

window.showChangePasswordModal = () => {
  document.getElementById('changePasswordModal').style.display = 'flex';
  document.getElementById('currentPassword').value = '';
  document.getElementById('newPassword').value = '';
  document.getElementById('confirmNewPassword').value = '';
  const msgArea = document.getElementById('password-msg');
  if (msgArea) msgArea.className = 'msg-area';
};

const confirmChangePasswordBtn = document.getElementById('confirmChangePasswordBtn');
if (confirmChangePasswordBtn && !confirmChangePasswordBtn.hasAttribute('data-listener')) {
  confirmChangePasswordBtn.setAttribute('data-listener', 'true');
  confirmChangePasswordBtn.addEventListener('click', async () => {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    const msgArea = document.getElementById('password-msg');
    const modal = document.getElementById('changePasswordModal');
    
    if (newPassword !== confirmPassword) {
      showMessage(msgArea, 'New passwords do not match', 'error');
      return;
    }
    
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      showMessage(msgArea, 'Password must have 6+ chars, 1 number, 1 special', 'error');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await response.json();
      if (response.ok) {
        showMessage(msgArea, 'Password changed successfully! Please login again.', 'success');
        setTimeout(() => {
          modal.style.display = 'none';
          logout();
        }, 2000);
      } else {
        showMessage(msgArea, data.message || 'Failed to change password', 'error');
      }
    } catch (error) {
      showMessage(msgArea, 'Server error', 'error');
    }
  });
}

// PDF generation function
window.downloadCheque = async (investmentId) => {
  const token = localStorage.getItem('token');
  if (!token) return;
  
  try {
    const response = await fetch(`${API_URL}/investments/${investmentId}`, {
      headers: { 'Authorization': token }
    });
    const inv = await response.json();
    
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    // Function to convert amount to words
    const numberToWords = (num) => {
      const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
      const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
      const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
      
      if (num === 0) return 'Zero';
      
      const getThousands = (n) => {
        if (n >= 1000) {
          return getThousands(Math.floor(n / 1000)) + ' Thousand ' + getHundreds(n % 1000);
        }
        return getHundreds(n);
      };
      
      const getHundreds = (n) => {
        if (n === 0) return '';
        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
        return ones[Math.floor(n / 100)] + ' Hundred ' + getHundreds(n % 100);
      };
      
      return getThousands(num).trim();
    };
    
    doc.setFontSize(22);
    doc.setTextColor(11, 36, 57);
    doc.text('HIVE VENTURES', 105, 25, { align: 'center' });
    doc.setFontSize(14);
    doc.setTextColor(39, 234, 156);
    doc.text('Investment Cheque', 105, 40, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Cheque No: CHQ-${inv._id.slice(-8)}`, 150, 55);
    doc.text(`Issue Date: ${new Date().toLocaleDateString()}`, 150, 62);
    
    // Center aligned payment info
    doc.setFontSize(12);
    doc.setTextColor(11, 36, 57);
    doc.text(`Pay to: ${inv.investorName}`, 105, 85, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Amount: $${inv.amount.toLocaleString()}`, 105, 100, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`(${numberToWords(inv.amount)} Dollars Only)`, 105, 112, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`For: Investment in ${inv.propertyName}`, 105, 135, { align: 'center' });
    doc.text(`Investment Date: ${new Date(inv.investmentDate).toLocaleDateString()}`, 105, 148, { align: 'center' });
    doc.text(`Share Percentage: ${inv.sharePercentage.toFixed(2)}%`, 105, 161, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('This is a system generated cheque for investment verification.', 105, 270, { align: 'center' });
    doc.text('Hive Construction Ventures - Building Trust, Creating Wealth.', 105, 278, { align: 'center' });
    
    doc.save(`Investment_Cheque_${inv.investorName}_${inv._id.slice(-6)}.pdf`);
  } catch (error) {
    alert('Failed to generate cheque');
  }
};

// /profile function
window.toggleEditProfile = () => {
  const viewDiv = document.getElementById('profile-view');
  const editDiv = document.getElementById('profile-edit');
  if (viewDiv && editDiv) {
    viewDiv.style.display = 'none';
    editDiv.style.display = 'block';
  }
};

window.cancelEditProfile = () => {
  const viewDiv = document.getElementById('profile-view');
  const editDiv = document.getElementById('profile-edit');
  if (viewDiv && editDiv) {
    viewDiv.style.display = 'block';
    editDiv.style.display = 'none';
  }
};

 window.saveProfile = async () => {
  const token = localStorage.getItem('token');
  if (!token) return;
  
  const updatedData = {
    username: document.getElementById('edit-username').value,
    email: document.getElementById('edit-email').value,
    gender: document.getElementById('edit-gender').value,
    age: parseInt(document.getElementById('edit-age').value)
  };
  
  try {
    const response = await fetch(`${API_URL}/auth/update-profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(updatedData)
    });
    const data = await response.json();
    if (response.ok) {
      alert('Profile updated successfully');
      // Update currentUser with full data from server
      setCurrentUser(prev => ({ ...prev, ...data.user }));
      window.cancelEditProfile();
      // Update displayed values
      document.getElementById('profile-username').innerText = data.user.username;
      document.getElementById('profile-email').innerText = data.user.email || 'Not set';
      document.getElementById('profile-gender').innerText = data.user.gender || 'Not set';
      document.getElementById('profile-age').innerText = data.user.age || 'Not set';
    } else {
      alert(data.message || 'Update failed');
    }
  } catch (error) {
    alert('Server error');
  }
};

window.updatePropertyStatus = async (propertyId, newStatus) => {
  try {
    await fetch(`${API_URL}/properties/admin/${propertyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token')
      },
      body: JSON.stringify({ status: newStatus })
    });
    window.location.reload();
  } catch (error) {
    alert('Failed to update status');
  }
};

window.sendAdminResponse = async (contactId) => {
  const input = document.getElementById(`response-input-${contactId}`);
  const responseText = input?.value.trim();
  if (!responseText) { alert('Please enter a response'); return; }

  try {
    const response = await fetch(`${API_URL}/contact/respond/${contactId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token')
      },
      body: JSON.stringify({ adminResponse: responseText })
    });
    if (response.ok) {
      alert('Response sent successfully');
      window.location.reload();
    }
  } catch (error) {
    alert('Failed to send response');
  }
};

window.deleteContactMessage = async (contactId) => {
  if (!window.confirm('Delete this contact message?')) return;
  
  try {
    const response = await fetch(`${API_URL}/contact/${contactId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
    if (response.ok) {
      alert('Message deleted');
      window.location.reload();
    } else {
      alert('Delete failed');
    }
  } catch (error) {
    alert('Server error');
  }
};


// ========== HERO VIDEO ==========
// Guards against AbortError by tracking play state and using proper async/await
const videos = [basePath + "/assets/homevideo1.mp4", basePath + "/assets/homevideo2.mp4"];
let currentVideo = 0;
const videoEl = document.getElementById('heroVideo');
const heroContent = document.getElementById('heroContent');
const words = document.querySelectorAll('.hero-word');

// Animate hero words one by one on load
const animateWords = () => {
  words.forEach((word, i) => {
    setTimeout(() => word.classList.add('show'), i * 180);
  });
};

// Safe play — ignores AbortError completely (no console log)
const safePlay = async (el) => {
  if (!el) return;
  try {
    await el.play();
  } catch (e) {
    // Completely ignore AbortError - it's normal during video switching
    if (e.name !== 'AbortError') {
      console.log('Video error:', e.message);
    }
  }
};

// Switch video — change src without pause
const switchVideo = (index) => {
  if (!videoEl) return;
  currentVideo = (index + videos.length) % videos.length;
  // Don't pause — just change src
  videoEl.src = videos[currentVideo];
  safePlay(videoEl);
};

if (videoEl) {
  // Only init video if on home section — prevents re-running on every section change
  if (activeSection === 'home') {
    videoEl.src = videos[0];
    videoEl.load();
    safePlay(videoEl);

    // Remove old ended listener before adding new one — prevents duplicate listeners
    videoEl.onended = null;
    videoEl.onended = () => switchVideo(currentVideo + 1);

    setTimeout(() => {
      if (heroContent) heroContent.classList.add('visible');
      animateWords();
    }, 800);
  }
}

// Arrow buttons — switch video manually
const prevBtn = document.getElementById('heroPrev');
const nextBtn = document.getElementById('heroNext');
if (prevBtn) prevBtn.onclick = () => switchVideo(currentVideo - 1);
if (nextBtn) nextBtn.onclick = () => switchVideo(currentVideo + 1);


// ========== SEARCH FUNCTIONALITY ==========
const searchData = [
  { keywords: ['home', 'hero', 'welcome', 'hive', 'invest'], section: 'home' },
  { keywords: ['about', 'company', 'trust', 'mission'], section: 'about' },
  { keywords: ['properties', 'property', 'lakeview', 'downtown', 'villa'], section: 'properties' },
  { keywords: ['login', 'sign in'], section: 'login' },
  { keywords: ['register', 'sign up'], section: 'register' },
  { keywords: ['dashboard', 'investor', 'admin'], section: 'dashboard' },
  { keywords: ['contact', 'enquiry', 'email'], section: 'contact' },
];

const performSearch = (query) => {
  if (!query) return;
  const q = query.trim().toLowerCase();
  let found = null;
  for (const item of searchData) {
    if (item.keywords.some(k => k.includes(q) || q.includes(k))) {
      found = item.section;
      break;
    }
  }
  if (found) {
    window.scrollTo(0, 0);
    if (found === 'dashboard') {
      showDashboard();
    } else {
      showSection(found);
    }
  } else {
    alert('No results found for: "' + query + '"');
  }
};

// Setup search handlers
const setupSearch = () => {
  const searchBtn = document.getElementById('navSearchBtn');
  const searchWrap = document.getElementById('navSearchWrap');
  const searchInput = document.getElementById('navSearchInput');
  
  if (!searchBtn || !searchWrap || !searchInput) return;
  
  // Remove old listeners to avoid duplicates
  const newSearchBtn = searchBtn.cloneNode(true);
  searchBtn.parentNode.replaceChild(newSearchBtn, searchBtn);
  
  newSearchBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (searchWrap.classList.contains('open')) {
      if (searchInput.value.trim()) {
        performSearch(searchInput.value);
        searchInput.value = '';
        searchWrap.classList.remove('open');
        setNavOpen(false);
      } else {
        searchWrap.classList.remove('open');
      }
    } else {
      searchWrap.classList.add('open');
      searchInput.focus();
    }
  });

  searchInput.removeEventListener('keydown', searchInput._listener);
  searchInput._listener = (e) => {
    if (e.key === 'Enter') {
      performSearch(searchInput.value);
      searchInput.value = '';
      searchWrap.classList.remove('open');
      setNavOpen(false);
    }
    if (e.key === 'Escape') {
      searchInput.value = '';
      searchWrap.classList.remove('open');
    }
  };
  searchInput.addEventListener('keydown', searchInput._listener);

  document.removeEventListener('click', document._searchClose);
  document._searchClose = (e) => {
    if (!searchWrap.contains(e.target)) {
      searchWrap.classList.remove('open');
    }
  };
  document.addEventListener('click', document._searchClose);
};

setupSearch();


  // ========== NAV SCROLL ==========
  const nav = document.querySelector('.sticky-nav');
  const handleScroll = () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', handleScroll);

  // ========== ABOUT SLIDESHOW ==========
  let aboutCurrentSlide = 0;
  const aboutSlides = document.querySelectorAll('.about-slide');
  const aboutDots = document.querySelectorAll('.about-dot');

  const goToAboutSlide = (index) => {
    if (!aboutSlides.length) return;
    aboutSlides[aboutCurrentSlide]?.classList.remove('active');
    aboutDots[aboutCurrentSlide]?.classList.remove('active');
    aboutCurrentSlide = (index + aboutSlides.length) % aboutSlides.length;
    aboutSlides[aboutCurrentSlide]?.classList.add('active');
    aboutDots[aboutCurrentSlide]?.classList.add('active');
  };

  const aboutPrev = document.getElementById('aboutPrev');
  const aboutNext = document.getElementById('aboutNext');
  if (aboutPrev) aboutPrev.addEventListener('click', () => goToAboutSlide(aboutCurrentSlide - 1));
  if (aboutNext) aboutNext.addEventListener('click', () => goToAboutSlide(aboutCurrentSlide + 1));
  aboutDots.forEach(dot => {
    dot.addEventListener('click', () => goToAboutSlide(parseInt(dot.dataset.slide)));
  });

  // ========== WELCOME SECTION ANIMATION ==========
  const welcomeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelector('.welcome-left img')?.classList.add('animate');
        document.querySelector('.welcome-right')?.classList.add('animate');
      }
    });
  }, { threshold: 0.2 });
  const welcomeSection = document.querySelector('.welcome-section');
  if (welcomeSection) welcomeObserver.observe(welcomeSection);

  // ========== WHAT WE DO ANIMATION ==========
  const wwdObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        wwdObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('[data-wwd]').forEach(block => {
    wwdObserver.observe(block);
  });

  // ========== HEADING LINE GROW ==========
  const wwdHeading = document.querySelector('.whatwedo-section .section-title');
  const headingObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('line-grow');
        setTimeout(() => entry.target.classList.remove('line-grow'), 800);
      }
    });
  }, { threshold: 0.3 });
  if (wwdHeading) headingObserver.observe(wwdHeading);

// ========== SIMPLE HEADING UNDERLINE ANIMATION ==========
const propertyHeading = document.querySelector('#properties h2');
const dashboardHeading = document.querySelector('#dashboard h2');

const activateHeading = () => {
  const activeSectionEl = document.querySelector('.page-section.active');
  if (activeSectionEl) {
    if (activeSectionEl.id === 'properties' && propertyHeading) {
      propertyHeading.classList.add('heading-visible');
    }
    if (activeSectionEl.id === 'dashboard' && dashboardHeading) {
      dashboardHeading.classList.add('heading-visible');
    }
  }
};

activateHeading();


  // ========== RENDER PROPERTIES WHEN ON PROPERTIES SECTION ==========
  if (activeSection === 'properties') {
    setTimeout(renderProperties, 100);
  }

 // ========== RENDER DASHBOARD WHEN ON DASHBOARD SECTION ==========
  if (activeSection === 'dashboard') {
  (async () => {
    const dashboardContent = document.getElementById('dashboard-content');
    if (dashboardContent && currentUser) {

      if (currentUser.role === 'admin') {
  // Fetch all investments for admin
  const token = localStorage.getItem('token');
  
  let allInvestments = [];
 let allProperties = [];
 let allUsers = [];
 let allContacts = [];
  
  try {
    const investmentsRes = await fetch(`${API_URL}/investments/all`, {
      headers: { 'Authorization': token }
    });
    allInvestments = await investmentsRes.json();
    
    
    const propertiesRes = await fetch(`${API_URL}/properties`);
    allProperties = await propertiesRes.json();
    
    const usersRes = await fetch(`${API_URL}/auth/users`, {
      headers: { 'Authorization': token }
    });
    allUsers = await usersRes.json();

    const contactsRes = await fetch(`${API_URL}/contact/all`, {
  headers: { 'Authorization': token }
});
allContacts = await contactsRes.json();

  } catch(e) {
    console.log('Error fetching data');
  }
  

// Total Invested — only active investments (withdrawn ones are returned)
const activeInvestments = Array.isArray(allInvestments) 
  ? allInvestments.filter(inv => inv.status !== 'withdrawn') 
  : [];
const totalInvested = activeInvestments.reduce((sum, inv) => sum + inv.amount, 0);

// Hive Profit — sum hiveShare from ALL investments including withdrawn
// hiveShare is negative when property is in loss — Hive bears that loss
const totalHiveProfit = Array.isArray(allInvestments) 
  ? allInvestments.reduce((sum, inv) => sum + (inv.hiveShare || 0), 0) 
  : 0;

// Table uses ALL investments to show full history
const investmentsWithShares = Array.isArray(allInvestments) ? allInvestments : [];
  
// Properties table HTML
  
let propertiesHtml = '<div class="dash-section"><div class="dash-section-header"><h4>Manage Properties</h4><button class="add-property-btn" onclick="showAddPropertyModal()">+ Add Property</button></div><table class="dash-table"><thead><tr><th>Title</th><th>City</th><th>Price</th><th>Current Value</th><th>Status</th><th>Shares Left</th><th>Actions</th></tr></thead><tbody>';
if (Array.isArray(allProperties) && allProperties.length > 0) {
  allProperties.forEach(prop => {
  propertiesHtml += `
  <tr data-id="${prop._id}">
    <td data-label="Title"><span class="prop-title">${prop.title}</span><input class="edit-title" style="display:none"></td>
    <td data-label="City"><span class="prop-city">${prop.location || 'Lahore'}</span><input class="edit-city" style="display:none"></td>
    <td data-label="Price"><span class="prop-price">$${prop.price.toLocaleString()}</span><input class="edit-price" style="display:none"></td>
   <td data-label="Current Value"><span class="prop-current-value">$${(prop.currentValue || prop.price).toLocaleString()}</span><input class="edit-current-value" style="display:none"></span></td>
    <td data-label="Status">
      <span class="status-badge ${prop.status === 'Under Construction' ? 'underconstruction' : prop.status.toLowerCase()}">${prop.status}</span>
      <select class="prop-status-edit" style="display:none">
        <option value="Available" ${prop.status === 'Available' ? 'selected' : ''}>Available</option>
        <option value="Under Construction" ${prop.status === 'Under Construction' ? 'selected' : ''}>Under Construction</option>
      </select>
    </td>
    <td data-label="Shares Left">${prop.availableShares}/${prop.totalShares}</td>
    <td data-label="Actions">
      <button class="edit-property-btn" onclick="editPropertyInline('${prop._id}')">Edit</button>
      <button class="delete-property-btn" onclick="deleteProperty('${prop._id}')">Delete</button>
    </td>
  </tr>
`;
});
} else {
  propertiesHtml += '<tr><td colspan="5">No properties found</td></tr>';
}
  propertiesHtml += '</tbody></table></div>';

  // Investments table HTML
  let investmentsHtml = '<div class="dash-section"><div class="dash-section-header"><h4>All Investments</h4></div><table class="dash-table"><thead><tr><th>Investor</th><th>Property</th><th>Amount</th><th>Investor Share (75%)</th><th>Hive Share (25%)</th><th>Date</th><th>Status</th><th>Action</th></tr></thead><tbody>';
if (investmentsWithShares.length > 0) {
  investmentsWithShares.forEach(inv => {
    investmentsHtml += `
      <tr>
        <td data-label="Investor">${inv.investorName}</td>
        <td data-label="Property">${inv.propertyName}</td>
        <td data-label="Amount">$${inv.amount.toLocaleString()}</td>
        <td data-label="Investor Share (75%)">$${(inv.investorShare || 0).toLocaleString()}</td>
        <td data-label="Hive Share (25%)">$${((inv.hiveShare || 0)).toLocaleString()}</td>      
          <td data-label="Date">${new Date(inv.investmentDate).toLocaleDateString()}</td>
          <td data-label="Status">
  <span class="status-badge ${inv.status === 'withdrawn' ? 'sold' : 'available'}">
    ${inv.status}
  </span>
</td>
        <td data-label="Action"><button class="delete-investment-btn" onclick="deleteInvestmentByAdmin('${inv._id}')">Delete</button></td>
      </tr>
    `;
  });
} else {
  investmentsHtml += '<tr><td colspan="7">No investments found</td></table>';
}
investmentsHtml += '</tbody></table></div>';

// Contact messages table HTML
let contactsHtml = '<div class="dash-section"><div class="dash-section-header"><h4>Contact Messages</h4></div>';
if (Array.isArray(allContacts) && allContacts.length > 0) {
  contactsHtml += '<table class="dash-table"><thead><tr><th>Name</th><th>Email</th><th>Message</th><th>Date</th><th>Status</th><th>Response</th><tr></thead><tbody>';
  allContacts.forEach(c => {
    contactsHtml += `
      <tr>
        <td data-label="Name">${c.name}</td>
        <td data-label="Email">${c.email}</td>
        <td data-label="Message" class="contact-message-cell">${c.message}</td>
        <td data-label="Date">${new Date(c.createdAt).toLocaleDateString()}</td>
        <td data-label="Status">
          <span class="status-badge ${c.adminResponse ? 'available' : 'underconstruction'}">
            ${c.adminResponse ? 'Responded' : 'Pending'}
          </span>
        <td data-label="Response" class="response-cell">
          <div style="display:flex;gap:0.4rem;flex-wrap:wrap;align-items:center;">
            ${c.adminResponse 
              ? `<span style="font-size:0.78rem;color:#555;flex:1;">${c.adminResponse}</span>`
              : `<input id="response-input-${c._id}" type="text" placeholder="Type response..." class="response-input" style="flex:1;" />
                 <button class="edit-property-btn" onclick="sendAdminResponse('${c._id}')">Send</button>`
            }
            <button class="delete-contact-btn" onclick="deleteContactMessage('${c._id}')">✖</button>
          </div>
        </td>
      </tr>
    `;
  });
  contactsHtml += '</tbody></table>';
} else {
  contactsHtml += '<p style="padding:1rem;color:var(--dark-grey);">No contact messages yet.</p>';
}
contactsHtml += '</div>';
  
  // Users table HTML
 let usersHtml = '<div class="dash-section"><div class="dash-section-header"><h4>Investors</h4></div><table class="dash-table"><thead><tr><th>Username</th><th>Email</th><th>Gender</th><th>Age</th><th>Status</th><th>Action</th></tr></thead><tbody>';
if (Array.isArray(allUsers) && allUsers.length > 0) {
  allUsers.forEach(user => {
    if (user.role === 'investor') {
     usersHtml += `
  <tr>
    <td data-label="Username">${user.username}</td>
    <td data-label="Email">${user.email || 'Not set'}</td>
    <td data-label="Gender">${user.gender || 'Not set'}</td>
    <td data-label="Age">${user.age || 'Not set'}</td>
    <td data-label="Status"><span class="status-badge ${user.status}">${user.status}</span></td>
    <td data-label="Action"><button class="delete-user-btn" onclick="deleteUserByAdmin('${user._id}')">Delete</button></td>
  </tr>
`;
    }
  });
} else {
  usersHtml += '<tr><td colspan="6">No investors found</td></tr>';
}
usersHtml += '</tbody></table></div>';
  
  // Profile section HTML
  const profileHtmlAdmin = `
    <div class="profile-section">
      <div class="profile-header">
        <h4>My Profile</h4>
        <button class="edit-profile-btn" onclick="toggleEditProfileAdmin()">Edit</button>
      </div>
      <div id="profile-view-admin" class="profile-view">
        <div class="profile-row"><span class="profile-label">Username:</span><span class="profile-value" id="admin-username">${currentUser.username}</span></div>
        <div class="profile-row"><span class="profile-label">Email:</span><span class="profile-value" id="admin-email">${currentUser.email || 'Not set'}</span></div>
        <div class="profile-row"><span class="profile-label">Role:</span><span class="profile-value">Admin</span></div>
      </div>
      <div id="profile-edit-admin" style="display: none;">
        <div class="profile-row"><span class="profile-label">Username:</span><input type="text" id="edit-admin-username" value="${currentUser.username}" /></div>
        <div class="profile-row"><span class="profile-label">Email:</span><input type="email" id="edit-admin-email" value="${currentUser.email || ''}" /></div>
        <div class="profile-buttons">
        <button class="change-password-btn" onclick="showChangePasswordModal()">Change Password</button>
          <button class="save-profile-btn" onclick="saveProfileAdmin()">Save</button>
          <button class="cancel-profile-btn" onclick="cancelEditProfileAdmin()">Cancel</button>
        </div>
      </div>
      </div>
    </div>
  `;
  
 dashboardContent.innerHTML = `
  <div class="dashboard-welcome">
    <div class="dash-avatar">${currentUser.username.charAt(0).toUpperCase()}</div>
    <div><h3>Welcome back, ${currentUser.username}</h3><span class="dash-role-badge admin">Admin</span></div>
  </div>
  <div class="dash-stats">
  <div class="dash-stat-card"><span class="dash-stat-num">${allProperties.length}</span><span class="dash-stat-label">Total Properties</span></div>
  <div class="dash-stat-card"><span class="dash-stat-num">$${totalInvested.toLocaleString()}</span><span class="dash-stat-label">Total Investments</span></div>
  <div class="dash-stat-card">
    <span class="dash-stat-num" style="color: ${totalHiveProfit < 0 ? '#e74c3c' : 'var(--dark-grey)'};">
      ${totalHiveProfit < 0 ? '-$' + Math.abs(totalHiveProfit).toLocaleString() : '$' + totalHiveProfit.toLocaleString()}
    </span>
    <span class="dash-stat-label">Hive Profit (25%)</span>
  </div>
</div>
  ${profileHtmlAdmin}
  ${propertiesHtml}
  ${usersHtml}
 ${investmentsHtml}
${contactsHtml}
`;
}

      
      else {
        // Fetch investments and display for investor
        const token = localStorage.getItem('token');
        if (token) {
          (async () => {
            try {
              const response = await fetch(`${API_URL}/investments/my-investments-details`, {
                headers: { 'Authorization': token }
              });
              const investments = await response.json();
             


              // Sort investments: active first, withdrawn last
investments.sort((a, b) => new Date(b.investmentDate) - new Date(a.investmentDate));
              
              let investmentsHtml = '<div class="dash-section"><h4>Your Investments</h4>';
              if (investments.length === 0) {
                investmentsHtml += '<p>No investments yet. <a href="#" onclick="showSection(\'properties\')">Invest now</a></p>';
              } else {
                investmentsHtml += `
                  <table class="dash-table">
                    <thead><tr><th>Property</th><th>Amount</th><th>Your Share</th><th>Current Value</th><th>Profit (75%)</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>
                `;

    investments.forEach(inv => {
  const rowClass = inv.status === 'withdrawn' ? 'withdrawn-row' : '';
  investmentsHtml += `
    <tr class="${rowClass}">
      <td data-label="Property">${inv.propertyName}</td>
      <td data-label="Amount">$${inv.amount.toLocaleString()}</td>
      <td data-label="Your Share">${inv.sharePercentage.toFixed(2)}%</td>
      <td data-label="Current Value">$${inv.currentValue?.toLocaleString() || inv.amount.toLocaleString()}</td>
      <td data-label="Profit (75%)">$${inv.investorShare?.toLocaleString() || '0'}</td>
      <td data-label="Status">
        <span class="status-badge ${inv.status === 'withdrawn' ? 'sold' : 'available'}">
          ${inv.status}
        </span>
      </td>
      <td data-label="Action">
  <button class="logout-btn" style="padding: 0.2rem 0.3rem; font-size: 0.7rem; margin: 0 0.2rem;" onclick="withdrawInvestment('${inv._id}')">Withdraw</button>
  <button class="logout-btn" style="padding: 0.2rem 0.3rem; font-size: 0.7rem; margin: 0 0.2rem;" onclick="downloadCheque('${inv._id}')">Cheque</button>
  <button class="dash-delete-btn" style="padding: 0.2rem 0.3rem; font-size: 0.7rem; margin: 0;" onclick="deleteInvestment('${inv._id}')">Delete</button>
</td>
    </tr>
  `;
});

                investmentsHtml += '</tbody></table>';
              }
              investmentsHtml += '</div>';
              
const activeInvestments = investments.filter(inv => inv.status !== 'withdrawn');

// Profile section HTML
const profileHtml = `
  <div class="profile-section">
    <div class="profile-header">
      <h4>My Profile</h4>
      <button class="edit-profile-btn" onclick="toggleEditProfile()">Edit</button>
    </div>
    <div id="profile-view" class="profile-view">
      <div class="profile-row"><span class="profile-label">Username:</span><span class="profile-value" id="profile-username">${currentUser.username}</span></div>
      <div class="profile-row"><span class="profile-label">Email:</span><span class="profile-value" id="profile-email">${currentUser?.email || 'Not set'}</span></div>
<div class="profile-row"><span class="profile-label">Gender:</span><span class="profile-value" id="profile-gender">${currentUser?.gender || 'Not set'}</span></div>
<div class="profile-row"><span class="profile-label">Age:</span><span class="profile-value" id="profile-age">${currentUser?.age || 'Not set'}</span></div>
    </div>
    <div id="profile-edit" style="display: none;">
      <div class="profile-row"><span class="profile-label">Username:</span><input type="text" id="edit-username" value="${currentUser.username}" /></div>
      <div class="profile-row"><span class="profile-label">Email:</span><input type="email" id="edit-email" value="${currentUser.email || ''}" /></div>
      <div class="profile-row"><span class="profile-label">Gender:</span>
        <select id="edit-gender">
          <option value="male" ${currentUser.gender === 'male' ? 'selected' : ''}>Male</option>
          <option value="female" ${currentUser.gender === 'female' ? 'selected' : ''}>Female</option>
          <option value="other" ${currentUser.gender === 'other' ? 'selected' : ''}>Other</option>
        </select>
      </div>
      <div class="profile-row"><span class="profile-label">Age:</span><input type="number" id="edit-age" value="${currentUser.age || ''}" min="18" max="100" /></div>
      <div class="profile-buttons">
      <button class="change-password-btn" onclick="showChangePasswordModal()">Change Password</button>
        <button class="save-profile-btn" onclick="saveProfile()">Save</button>
        <button class="cancel-profile-btn" onclick="cancelEditProfile()">Cancel</button>
      </div>
    </div>
  </div>
`;

 dashboardContent.innerHTML = `
  <div class="dashboard-welcome">
    <div class="dash-avatar">${currentUser.username.charAt(0).toUpperCase()}</div>
    <div><h3>Welcome back, ${currentUser.username}</h3><span class="dash-role-badge investor">Investor</span></div>
  </div>
  <div class="dash-stats">
    <div class="dash-stat-card"><span class="dash-stat-num">$${activeInvestments.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}</span><span class="dash-stat-label">Total Invested</span></div>
    <div class="dash-stat-card"><span class="dash-stat-num">${activeInvestments.reduce((sum, inv) => sum + (inv.sharePercentage || 0), 0).toFixed(1)}</span><span class="dash-stat-label">Total Share</span></div>
    <div class="dash-stat-card"><span class="dash-stat-num">${activeInvestments.length}</span><span class="dash-stat-label">Active Investments</span></div>
  </div>
  ${profileHtml}
  ${investmentsHtml}
  <div class="profit-sharing-section">
    <div class="profit-header">
      <h4>Profit Sharing</h4>
      <div class="total-profit">Total Profit (75%): <strong>$${activeInvestments.reduce((sum, inv) => sum + (inv.investorShare || 0), 0).toLocaleString()}</strong></div>
    </div>
    <p>Profit split 75% to investors, 25% to Hive. Returns shown above for each investment.</p>
  </div>
`;
            } catch (error) {
              console.log('Error fetching investments');
            }
          })();
        }
        
      }
      
    }
    })();
  }


  // Cleanup
  // Remove event listeners on unmount/exit to prevent memory leaks
return () => {
  window.removeEventListener('scroll', handleScroll);
  document.removeEventListener('click', document._searchClose);
};


}, [activeSection, currentUser, basePath]); 
// Re-run effect when activeSection or currentUser changes
// /above code is inside useEffect to handle all DOM manipulations and event listeners 
// above code is dependency-aware to re-run when activeSection or currentUser changes, ensuring dynamic content updates


// Fix mobile dropdown closing when clicking outside
useEffect(() => {
  const handleClickOutside = (event) => {
    if (window.innerWidth <= 768) {
      if (!event.target.closest('.dropdown')) {
        setDropdownOpen(false);
      }
    }
  };
  
  document.addEventListener('click', handleClickOutside);
  return () => document.removeEventListener('click', handleClickOutside);
}, []);


// Save active section to localStorage when it changes
useEffect(() => {
  localStorage.setItem('activeSection', activeSection);
}, [activeSection]);

 // Load user from token on page load
useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Fetch full user data from backend
      fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': token }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) setCurrentUser(data.user);
        })
        .catch(() => setCurrentUser({ username: payload.username, role: payload.role }));
    } catch(e) {
      console.log('Invalid token');
    }
  }
}, []);

// Clear form fields when leaving login/register pages
useEffect(() => {
  if (activeSection !== 'login') {
    const loginUsername = document.getElementById('login-username');
    const loginPassword = document.getElementById('login-password');
    const loginMsg = document.getElementById('login-msg');
    if (loginUsername) loginUsername.value = '';
    if (loginPassword) loginPassword.value = '';
    if (loginMsg) loginMsg.className = 'msg-area';
  }
  
  if (activeSection !== 'register') {
    const regUsername = document.getElementById('reg-username');
    const regPassword = document.getElementById('reg-password');
    const regEmail = document.getElementById('reg-email');
    const regAge = document.getElementById('reg-age');
    const regMsg = document.getElementById('register-msg');
    if (regUsername) regUsername.value = '';
    if (regPassword) regPassword.value = '';
    if (regEmail) regEmail.value = '';
    if (regAge) regAge.value = '';
    if (regMsg) regMsg.className = 'msg-area';
    // Reset gender radio to default
    const maleRadio = document.querySelector('input[name="gender"][value="male"]');
    if (maleRadio) maleRadio.checked = true;
  }
}, [activeSection]);

  return (
    <>
    <header className="sticky-nav">
  <a href="#" onClick={() => { 
  const main = document.getElementById('main-content');
  main.style.opacity = '0';
  if (activeSection === 'home') {
    const words = document.querySelectorAll('.hero-word');
    const heroContent = document.getElementById('heroContent');
    words.forEach(word => word.classList.remove('show'));
    heroContent?.classList.remove('visible');
    setTimeout(() => {
      words.forEach((word, i) => {
        setTimeout(() => word.classList.add('show'), i * 180);
      });
      heroContent?.classList.add('visible');
    }, 50);
  }
  setActiveSection('home'); 
  window.scrollTo(0, 0);
  setTimeout(() => { main.style.opacity = '1'; }, 150);
}} className="logo">
  <span className="hive">HIVE</span><span className="ventures">Ventures</span>
</a>

  <div className={`hamburger ${navOpen ? 'active' : ''}`} onClick={() => setNavOpen(!navOpen)}>
  <span></span>
  <span></span>
  <span></span>
</div>

  <nav className={navOpen ? 'active' : ''}>
  <ul className="nav-links">

       <li><a href="#" onClick={() => { 
  const main = document.getElementById('main-content');
  main.style.opacity = '0';
  if (activeSection === 'home') {
    const words = document.querySelectorAll('.hero-word');
    const heroContent = document.getElementById('heroContent');
    words.forEach(word => word.classList.remove('show'));
    heroContent?.classList.remove('visible');
    setTimeout(() => {
      words.forEach((word, i) => {
        setTimeout(() => word.classList.add('show'), i * 180);
      });
      heroContent?.classList.add('visible');
    }, 50);
  }
  setActiveSection('home'); 
  setNavOpen(false); 
  window.scrollTo(0, 0);
  setTimeout(() => { main.style.opacity = '1'; }, 150);
}}>Home</a></li>   

{/* showSection already calls setActiveSection inside it,plus adds animation
it's safe to replace all setActiveSection with showSection.for properties and dashboard */}
    <li><a href="#" onClick={() => { setActiveSection('about'); setNavOpen(false); }}>About Us</a></li>
    <li><a href="#" onClick={() => { showSection('properties'); setNavOpen(false); }}>Properties</a></li>

<li className="dropdown">
  <button 
    className="dropbtn" 
    onMouseEnter={() => window.innerWidth > 768 && setDropdownOpen(true)}
    onMouseLeave={() => window.innerWidth > 768 && setDropdownOpen(false)}
    onClick={() => window.innerWidth <= 768 && setDropdownOpen(!dropdownOpen)}
  >
    My account <span className="arrow">ˇ</span>
  </button>
  {dropdownOpen && (
    <div 
      className="dropdown-content" 
      style={{ display: 'block' }}
      onMouseEnter={() => window.innerWidth > 768 && setDropdownOpen(true)}
      onMouseLeave={() => window.innerWidth > 768 && setDropdownOpen(false)}
    >
      <a href="#" onClick={() => { setActiveSection('login'); setNavOpen(false); setDropdownOpen(false); }}>Login</a>
      <a href="#" onClick={() => { setActiveSection('register'); setNavOpen(false); setDropdownOpen(false); }}>Register</a>
    </div>
  )} 
</li>

    <li><a href="#" onClick={() => { showDashboard(); setNavOpen(false); }}>Dashboard</a></li>
    <li><a href="#" onClick={() => { setActiveSection('contact'); setNavOpen(false); }}>Contact</a></li>
    <li className="nav-search-li">
      <div className="nav-search-wrap" id="navSearchWrap">
        <input type="text" id="navSearchInput" className="nav-search-input" placeholder="Search..." />
        <button className="nav-search-icon" id="navSearchBtn">&#8981;</button>
      </div>
    </li>
  </ul>
</nav>

</header>

      <main id="main-content">
      
        
<section id="home" className={activeSection === 'home' ? 'page-section active' : 'page-section'}>


  <div className="hero-video-wrap">
    <video className="hero-video" id="heroVideo" autoPlay muted playsInline>
      <source src={basePath + "/assets/homevideo1.mp4"} type="video/mp4" />
    </video>
    <div className="hero-video-overlay"></div>
         
  <div className="hero-content" id="heroContent">
    <p className="hero-pre">Welcome to Hive Construction Ventures</p>
    <h1 className="hero-heading">
      <span className="hero-word hero-word--1">Invest</span>
      <span className="hero-word hero-word--2">in</span>
      <span className="hero-word hero-word--3">High&#8209;Quality</span><br/>
      <span className="hero-word hero-word--4">Residential</span>
      <span className="hero-word hero-word--accent">Homes.</span>
    </h1>
    <p className="hero-sub">Secure &nbsp;·&nbsp; Profitable &nbsp;·&nbsp; Transparent</p>
    <button className="cta-btn" onClick={() => { showSection('properties'); window.scrollTo(0, 0); }}>View Properties</button>
  </div>


    <button className="hero-arrow hero-arrow--left" id="heroPrev" aria-label="Previous">&#8592;</button>
    <button className="hero-arrow hero-arrow--right" id="heroNext" aria-label="Next">&#8594;</button>


  </div>

  
  <div className="welcome-section">
    <div className="welcome-left">
      <img src={basePath + "/assets/welcome.jpg"} alt="Company Image" />
    </div>
    <div className="welcome-right">
      <h2>Welcome to <span className="welcome-accent">Hive Ventures</span></h2>
      <h4 className="moving-tagline">Building Trust. Creating Wealth.</h4>
      <p>At Hive Construction Ventures, we deliver premium residential projects built on transparency, integrity, and long-term value. Our investor-first approach combines modern engineering with smart market insights — ensuring every project is secure, profitable, and built to last.</p>
      <button className="cta-btn" id="ourStoryBtn" onClick={() => { showSection('about'); window.scrollTo(0, 0); }}>Our Story</button>
    </div>
  </div>

  <hr className="hr-line" />

  <div className="whatwedo-section">
    <h2 className="section-title">What We Do</h2>

    <div className="wwd-block wwd-block--left" data-wwd>
      <div className="wwd-image">
        <img src={basePath + "/assets/img1.png"} alt="Residential Construction" />
      </div>
      <div className="wwd-text">
        <span className="wwd-tag">Service 01</span>
        <h3>Residential Construction</h3>
        <p>We specialize in building high-quality residential homes designed for comfort, durability, and long-term value. Our expert engineering team ensures every project meets modern architectural and safety standards.</p>
      </div>
    </div>

    <div className="wwd-block wwd-block--right" data-wwd>
      <div className="wwd-image">
        <img src={basePath + "/assets/Investmentadv.jpg"} alt="Investment Advisory" />
      </div>
      <div className="wwd-text">
        <span className="wwd-tag">Service 02</span>
        <h3>Investment Advisory</h3>
        <p>Our investment advisory services guide clients toward secure and profitable real estate opportunities. We provide transparent profit-sharing models and guaranteed capital protection for investor confidence.</p>
      </div>
    </div>

    <div className="wwd-block wwd-block--left" data-wwd>
      <div className="wwd-image">
        <img src={basePath + "/assets/prortymang22.png"} alt="Property Management" />
      </div>
      <div className="wwd-text">
        <span className="wwd-tag">Service 03</span>
        <h3>Property Management</h3>
        <p>Hive ensures smooth property operations including maintenance, tenant management, and asset monitoring. We maximize property value while reducing risk for our investors.</p>
      </div>
    </div>
  </div>

</section>


<section id="about" className={activeSection === 'about' ? 'page-section about-section active' : 'page-section about-section'}>

  <div className="about-dots">
    <span className="about-dot active" data-slide="0"></span>
    <span className="about-dot" data-slide="1"></span>
    <span className="about-dot" data-slide="2"></span>
  </div>

  <button className="about-arrow about-arrow--left" id="aboutPrev">&#8592;</button>
  <button className="about-arrow about-arrow--right" id="aboutNext">&#8594;</button>

  <div className="about-slide active" style={{ backgroundImage: `url('${basePath}/assets/aboutx3.avif')` }}>
    <div className="about-overlay">
      <div className="about-slide-content about-style--story">
        <p className="about-pre">Who We Are</p>
        <h2>Built on Trust.<br/><span className="about-accent">Driven by Value.</span></h2>
        <p>Hive Construction Ventures is committed to delivering premium residential projects with modern architecture and long-term investment value. We combine engineering excellence, market research, and professional property management to ensure sustainable growth.</p>
      </div>
    </div>
  </div>

  <div className="about-slide" style={{ backgroundImage: `url('${basePath}/assets/aboutx7.jpg')` }}>
    <div className="about-overlay">
      <div className="about-slide-content about-style--blocks">
        <p className="about-pre">Our Expertise</p>
        <div className="about-blocks">
          <div className="about-block">
            <span className="about-block-num">01</span>
            <h3>Engineering</h3>
            <p>Modern construction methods, safety-first design, and precision project delivery.</p>
          </div>
          <div className="about-block">
            <span className="about-block-num">02</span>
            <h3>Investment</h3>
            <p>Transparent profit-sharing models and guaranteed capital protection for all investors.</p>
          </div>
          <div className="about-block">
            <span className="about-block-num">03</span>
            <h3>Management</h3>
            <p>End-to-end property operations that protect and grow your real estate assets.</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div className="about-slide" style={{ backgroundImage: `url('${basePath}/assets/aboutx4.jpg')` }}>
    <div className="about-overlay">
      <div className="about-slide-content about-style--gallery">
        <p className="about-pre">Our Work</p>
        <h2>Machinery &amp; On-Site Excellence</h2>
        <div className="about-gallery">
          <div className="about-gallery-item">
            <img src={basePath + "/assets/aboutx5.jpg"} alt="Machinery" />
            <span>Heavy Equipment</span>
          </div>
          <div className="about-gallery-item">
            <img src={basePath + "/assets/aboutx8.jpg"} alt="Site work" />
            <span>Site Operations</span>
          </div>
          <div className="about-gallery-item">
            <img src={basePath + "/assets/aboutx12.jpg"} alt="Construction" />
            <span>Foundation Work</span>
          </div>
        </div>
        <p className="about-gallery-caption">Our teams operate state-of-the-art machinery to deliver every project on time and to the highest standard.</p>
      </div>
    </div>
  </div>

</section>
      <section id="properties" className={activeSection === 'properties' ? 'page-section active' : 'page-section'}>
        <h2>Available Properties</h2>
        <div className="property-grid" id="property-list"></div>
      </section>

    {/* Login and Register sections are rendered but only one is active at a time based on state */}
    
    <section id="login" className={activeSection === 'login' ? 'page-section auth-section active' : 'page-section auth-section'}>
  <div className="form-container">
    <h2>Login</h2>
    <div id="login-msg" className="msg-area"></div>
    <form id="login-form">
      <div className="input-group">
        <label htmlFor="login-username">Username</label>
        <input type="text" id="login-username" required />
      </div>
      <div className="input-group">
        <label htmlFor="login-password">Password</label>
        <input type="password" id="login-password" required />
      </div>
      <button type="submit" className="submit-btn">Login</button>
    </form>
    <div className="form-links">
      <a href="#" id="forgotPasswordLink">Forgot password?</a>
      <span className="form-footer">Not a member? <a href="#" onClick={() => showSection('register')}>Sign up</a></span>
    </div>
  </div>
</section>

   {/* Password Recovery Modal */}
<div id="recoveryModal" className="modal" style={{ display: 'none' }}>
  <div className="modal-content">
    <span className="modal-close" onClick={() => document.getElementById('recoveryModal').style.display = 'none'}>&times;</span>
    <h3>Reset Password</h3>
    <div id="recovery-msg" className="msg-area"></div>
    <div id="step1">
      <div className="input-group">
        <label>Recovery Email</label>
        <input type="email" id="recovery-email" placeholder="Enter your registered email" required />
      </div>
      <button className="submit-btn" id="sendResetBtn">Send Reset Link</button>
    </div>
    <div id="step2" style={{ display: 'none' }}>
      <div className="input-group">
        <label>New Password</label>
        <input type="password" id="new-password" placeholder="Must have 6+ chars, 1 number, 1 special" required />
      </div>
      <div className="input-group">
        <label>Confirm New Password</label>
        <input type="password" id="confirm-password" placeholder="Confirm new password" required />
      </div>
      <button className="submit-btn" id="resetPasswordBtn">Reset Password</button>
    </div>
  </div>
</div>

{/* Investment Modal */}
<div id="investmentModal" className="modal" style={{ display: 'none' }}>
  <div className="modal-content">
    <span className="modal-close" onClick={() => document.getElementById('investmentModal').style.display = 'none'}>&times;</span>
    <h3 id="investmentModalTitle">Enter Investment Amount</h3>
    <div id="investment-msg" className="msg-area"></div>
    <div className="input-group">
      <label>Amount (USD)</label>
      <input type="number" id="investmentAmount" min="1000" step="1000" placeholder="Minimum: $1000" />
    </div>
    <p id="maxAmountInfo" style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}></p>
    <button className="submit-btn" id="confirmInvestBtn">Confirm Investment</button>
  </div>
</div>



<div id="propertyDetailModal" className="property-detail-modal">
  <div className="property-detail-content">
    <span className="property-detail-close" onClick={() => document.getElementById('propertyDetailModal').style.display = 'none'}>&times;</span>
    <h3 id="detailTitle" className="property-detail-title"></h3>
    <p id="detailLocation" className="property-detail-location"></p>
    <hr className="property-detail-divider" />
    <div className="property-detail-row">
      <span className="property-detail-label">Price</span>
      <strong id="detailPrice" className="property-detail-value"></strong>
    </div>
    <div className="property-detail-row">
      <span className="property-detail-label">Minimum Investment</span>
      <strong className="property-detail-value">$1,000</strong>
    </div>
    <div className="property-detail-row">
      <span className="property-detail-label">Maximum Investment</span>
      <strong id="detailMaxInvestment" className="property-detail-value"></strong>
    </div>
    <div className="property-detail-row">
      <span className="property-detail-label">Shares Available</span>
      <strong id="detailShares" className="property-detail-value"></strong>
    </div>
    <div className="property-detail-row">
      <span className="property-detail-label">Status</span>
      <strong id="detailStatus" className="property-detail-value"></strong>
    </div>
    <hr className="property-detail-divider" />
    <div className="property-detail-row">
      <span className="property-detail-label">Early Withdrawal</span>
      <strong className="property-detail-value">Original amount only</strong>
    </div>
    <div className="property-detail-row">
      <span className="property-detail-label">After 1 Year</span>
      <strong className="property-detail-value">Original + 75% profit</strong>
    </div>
    <div className="property-detail-row">
      <span className="property-detail-label">Loss Protection</span>
      <strong className="property-detail-value">Hive bears loss</strong>
    </div>
    <hr className="property-detail-divider" />
    <p id="detailDescription" className="property-detail-description"></p>
    <p className="property-detail-note">📌 Profit split: 75% investor / 25% Hive</p>
  </div>
</div>


{/* Terms & Conditions Modal */}
<div id="termsModal" className="terms-modal">
  <div className="terms-content">
    <span className="terms-close" onClick={() => document.getElementById('termsModal').style.display = 'none'}>&times;</span>
    <h3 className="terms-title">Terms & Conditions</h3>
    <p className="terms-date">Last updated: 2026</p>
    <h4 className="terms-subtitle">Investment Risk</h4>
    <p className="terms-text">All investments carry risk. Hive Construction Ventures guarantees original investment protection as per profit-sharing agreement.</p>
    <h4 className="terms-subtitle">Profit Sharing</h4>
    <p className="terms-text">Profit is distributed 75% to investors, 25% to Hive Construction Ventures.</p>
    <h4 className="terms-subtitle">Withdrawal Policy</h4>
    <p className="terms-text">Withdrawal before one year returns only original investment. After one year, profit is included.</p>
    <h4 className="terms-subtitle">Data Privacy</h4>
    <p className="terms-text">Your personal data is protected and not shared with third parties.</p>
  </div>
</div>

{/* Privacy Policy Modal */}
<div id="privacyModal" className="terms-modal">
  <div className="terms-content">
    <span className="terms-close" onClick={() => document.getElementById('privacyModal').style.display = 'none'}>&times;</span>
    <h3 className="terms-title">Privacy Policy</h3>
    <p className="terms-date">Last updated: 2026</p>
    <h4 className="terms-subtitle">Information We Collect</h4>
    <p className="terms-text">We collect name, email, contact information, and investment details to provide our services.</p>
    <h4 className="terms-subtitle">How We Use Information</h4>
    <p className="terms-text">To process investments, communicate updates, and comply with legal requirements.</p>
    <h4 className="terms-subtitle">Data Security</h4>
    <p className="terms-text">Your data is encrypted and stored securely. We do not sell your personal information.</p>
    <h4 className="terms-subtitle">Your Rights</h4>
    <p className="terms-text">You may request deletion of your account and personal data at any time.</p>
  </div>
</div>


{/* Add Property Modal */}
<div id="addPropertyModal" className="modal" style={{ display: 'none' }}>
  <div className="modal-content">
    <span className="modal-close" onClick={() => document.getElementById('addPropertyModal').style.display = 'none'}>&times;</span>
    <h3>Add New Property</h3>
    <div id="property-msg" className="msg-area"></div>
    <div className="input-group">
      <label>Title</label>
      <input type="text" id="propertyTitle" placeholder="Property title" required />
    </div>
    <div className="input-group">
      <label>Price ($)</label>
      <input type="number" id="propertyPrice" placeholder="Price in USD" required />
    </div>
    <div className="input-group">
      <label>City/Location</label>
      <input type="text" id="propertyCity" placeholder="City name" required />
    </div>
    <button className="submit-btn" id="confirmAddPropertyBtn">Add Property</button>
  </div>
</div>

{/* Change Password Modal */}
<div id="changePasswordModal" className="modal" style={{ display: 'none' }}>
  <div className="modal-content">
    <span className="modal-close" onClick={() => document.getElementById('changePasswordModal').style.display = 'none'}>&times;</span>
    <h3>Change Password</h3>
    <div id="password-msg" className="msg-area"></div>
    <div className="input-group">
      <label>Current Password</label>
      <input type="password" id="currentPassword" required />
    </div>
    <div className="input-group">
      <label>New Password</label>
      <input type="password" id="newPassword" placeholder="6+ chars, 1 number, 1 special" required />
    </div>
    <div className="input-group">
      <label>Confirm New Password</label>
      <input type="password" id="confirmNewPassword" required />
    </div>
    <button className="submit-btn" id="confirmChangePasswordBtn">Update Password</button>
  </div>
</div>


<section id="register" className={activeSection === 'register' ? 'page-section auth-section active' : 'page-section auth-section'}>
  <div className="form-container  register-container"> 
    <h2>Create Account</h2>
    <p className="form-subtitle">Join Hive Ventures to start investing</p>
    <div id="register-msg" className="msg-area"></div>
    <form id="register-form">
      <div className="form-row">
        <div className="input-group">
          <label htmlFor="reg-username">Username</label>
          <input type="text" id="reg-username" required placeholder="No special characters" />
        </div>
        <div className="input-group">
          <label htmlFor="reg-email">Email</label>
          <input type="email" id="reg-email" required placeholder="your@email.com" />
        </div>
      </div>
      
      <div className="form-row">
        <div className="input-group">
          <label htmlFor="reg-password">Password</label>
          <input type="password" id="reg-password" required placeholder="6+ chars, 1 number, 1 special" />
        </div>
        <div className="input-group">
          <label htmlFor="reg-age">Age</label>
          <input type="number" id="reg-age" min="18" max="100" placeholder="18" />
        </div>
      </div>
      
      <div className="form-row">
        <div className="input-group">
          <label>Gender</label>
          <div className="radio-group">
            <label><input type="radio" name="gender" value="male" defaultChecked /> Male</label>
            <label><input type="radio" name="gender" value="female" /> Female</label>
            <label><input type="radio" name="gender" value="other" /> Other</label>
          </div>
        </div>
        <div className="input-group">
          <label htmlFor="reg-role">Role</label>
          <select id="reg-role">
            <option value="investor">Investor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
      
      <button type="submit" className="submit-btn register-btn">Register</button>
    </form>
    <p className="form-footer">
      Already registered? <a href="#" onClick={() => showSection('login')}>Login</a>
    </p>
  </div>
</section>



      <section id="dashboard" className={activeSection === 'dashboard' ? 'page-section dashboard-section active' : 'page-section dashboard-section'}>
        <h2>Dashboard</h2>
        <div className="dashboard-controls">
          <button className="logout-btn" onClick={() => logout()}>Logout</button>
        </div>
        <div id="dashboard-content"></div>
      </section>

         

      
      
      <section id="contact" className={activeSection === 'contact' ? 'page-section active' : 'page-section'}>
        <div className="contact-wrapper">
          
          <div className="contact-text">
            <h2>Submit an Enquiry</h2>
            <p>Have questions? We'd love to hear from you.</p>
          </div>
      
          <div className="contact-form-wrapper">
            <div className="form-container">
              <p className="contact-pre">Get In Touch</p>
              <h2>Contact Us</h2>
              <p className="contact-sub">We'll get back to you within 24 hours.</p>
              
              <form id="contact-form">
                <div className="input-group">
                  <label htmlFor="contact-name">Full Name</label>
                  <input type="text" id="contact-name" placeholder="Enter your full name" required />
                </div>
                <div className="input-group">
                  <label htmlFor  ="contact-email">Email</label>
                  <input type="email" id="contact-email" placeholder="you@email.com" required />
                </div>
                <div className="input-group">
                  <label htmlFor="contact-msg">Message</label>
                  <textarea id="contact-msg" rows="3" placeholder="Your message..." required></textarea>
                </div>
                <div id="contact-msg-area" className="msg-area"></div>
                <button type="submit" className="submit-btn">Send Message</button>
              </form>
            </div>
          </div>
      
        </div>
      </section>

      {/* Contact response popup */}
<div id="contact-response-popup" className="contact-popup">
  <div className="contact-popup-content">
    <span className="contact-popup-close" onClick={() => document.getElementById('contact-response-popup').style.display = 'none'}>&times;</span>
    <p className="contact-popup-pre">Response from Hive Ventures</p>
    <p style={{ fontSize: '0.85rem', color: '#555', marginBottom: '1.2rem', lineHeight: '1.6' }}>
      Thank you for reaching out to Hive Construction Ventures. We truly value your interest.
    </p>
    <div className="contact-popup-message">
      <p id="contact-response-text" style={{ fontSize: '0.9rem', color: 'var(--primary-color)', margin: 0, lineHeight: '1.7' }}></p>
    </div>
  </div>
</div>

 </main>


 <footer className="site-footer">
  <div className="footer-inner">
    <div className="footer-col footer-col--brand">
      <span className="footer-logo"><span className="hive">HIVE</span><span className="ventures">Ventures</span></span>
      <p>Premium residential projects built on transparency, integrity, and long-term investment value.</p>
      <div className="footer-socials">
        <a href="#" aria-label="LinkedIn">in</a>
        <a href="#" aria-label="Twitter">𝕏</a>
        <a href="#" aria-label="Instagram">ig</a>
        <a href="#" aria-label="Facebook">fb</a>
      </div>
    </div>
    <div className="footer-middle-row">
      <div className="footer-col">
        <h4>Explore</h4>
        <ul>
          <li><a href="#" onClick={() => showSection('home')}>Home</a></li>
          <li><a href="#" onClick={() => showSection('about')}>About Us</a></li>
          <li><a href="#" onClick={() => showSection('properties')}>Properties</a></li>
          <li><a href="#" onClick={() => showSection('contact')}>Contact</a></li>
          <li><a href="#" onClick={() => showDashboard()}>Dashboard</a></li>
        </ul>
      </div>
      <div className="footer-col footer-col--cta">
        <h4>Get In Touch</h4>
        <p>Ready to invest or have questions about our projects?</p>
        <button className="cta-btn" onClick={() => { showSection('contact'); window.scrollTo(0, 0); }}>Contact Us</button>
        <p className="footer-contact-info">📍 Lahore, Pakistan</p>
        <p className="footer-contact-info">✉ info@hiveventures.com</p>
      </div>
    </div>
  </div>
  <div className="footer-bottom">
    <p>&copy; 2026 Hive Construction Ventures. All rights reserved.</p>
    <p><a href="#" onClick={() => document.getElementById('termsModal').style.display = 'flex'}>Terms &amp; Conditions</a>
     &nbsp;|&nbsp; <a href="#" onClick={() => document.getElementById('privacyModal').style.display = 'flex'}>Privacy Policy</a> &nbsp;|&nbsp; <a href="http://localhost:3001/info" target="_blank" rel="noopener noreferrer">Made by F25PROJECT9AEDE</a></p>
  </div>
</footer>

    </>
  );
}

export default App;