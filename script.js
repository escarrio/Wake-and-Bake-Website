// ==========================================
// WAIT FOR DOM TO LOAD
// ==========================================
document.addEventListener('DOMContentLoaded', function() {

// ==========================================
// GLOBAL VARIABLES
// ==========================================
let cart = [];
let userEmail = localStorage.getItem('userEmail') || null;
const BUSINESS_EMAIL = 'wakeandbakerybusiness@gmail.com';

// ==========================================
// INITIALIZE APP
// ==========================================
function initializeApp() {
    loadCart();
    updateCartUI();
    updateSigninUI();
}

// ==========================================
// USER AUTHENTICATION
// ==========================================
const signinModal = document.getElementById('signinModal');
const signinBtn = document.getElementById('signinBtn');
const closeSignin = document.getElementById('closeSignin');
const signinForm = document.getElementById('signinForm');
const userInfo = document.getElementById('userInfo');
const signoutBtn = document.getElementById('signoutBtn');

signinBtn.addEventListener('click', () => {
    signinModal.classList.add('active');
    document.body.style.overflow = 'hidden';
});

closeSignin.addEventListener('click', () => {
    signinModal.classList.remove('active');
    document.body.style.overflow = 'auto';
});

signinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('userEmail').value;
    
    const existingUserCart = localStorage.getItem(`cart_${email}`);
    const currentGuestCart = localStorage.getItem('guest_cart');
    
    userEmail = email;
    localStorage.setItem('userEmail', email);
    
    if (existingUserCart) {
        cart = JSON.parse(existingUserCart);
    } else if (currentGuestCart && currentGuestCart !== '[]') {
        cart = JSON.parse(currentGuestCart);
        localStorage.setItem(`cart_${email}`, JSON.stringify(cart));
    }
    
    updateCartUI();
    showToast('Successfully signed in!');
    updateSigninUI();
    
    signinModal.classList.remove('active');
    document.body.style.overflow = 'auto';
});

signoutBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to sign out? Your cart will be saved for next time.')) {
        if (userEmail && cart.length > 0) {
            localStorage.setItem(`cart_${userEmail}`, JSON.stringify(cart));
        }
        
        const currentUserEmail = userEmail;
        userEmail = null;
        localStorage.removeItem('userEmail');
        cart = [];
        
        updateSigninUI();
        updateCartUI();
        showToast(`Signed out successfully. Your cart has been saved to ${currentUserEmail}`);
        signinModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

function updateSigninUI() {
    if (userEmail) {
        signinBtn.textContent = 'Account';
        document.getElementById('displayEmail').textContent = userEmail;
        signinForm.style.display = 'none';
        userInfo.style.display = 'block';
    } else {
        signinBtn.textContent = 'Sign In';
        signinForm.style.display = 'block';
        userInfo.style.display = 'none';
    }
}

// ==========================================
// CART MANAGEMENT
// ==========================================
function loadCart() {
    if (userEmail) {
        const savedCart = localStorage.getItem(`cart_${userEmail}`);
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
    } else {
        const guestCart = localStorage.getItem('guest_cart');
        if (guestCart) {
            cart = JSON.parse(guestCart);
        }
    }
}

function saveCart() {
    if (userEmail) {
        localStorage.setItem(`cart_${userEmail}`, JSON.stringify(cart));
    } else {
        localStorage.setItem('guest_cart', JSON.stringify(cart));
    }
}

function addToCart(product) {
    const existingIndex = cart.findIndex(item => 
        item.name === product.name && 
        item.size === product.size && 
        item.slices === product.slices
    );
    
    if (existingIndex !== -1) {
        cart[existingIndex].quantity += product.quantity;
    } else {
        cart.push(product);
    }
    
    saveCart();
    updateCartUI();
    
    const cartButton = document.getElementById('cartBtn');
    cartButton.style.animation = 'none';
    setTimeout(() => {
        cartButton.style.animation = 'cartBounce 0.5s ease';
    }, 10);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
}

function updateCartQuantity(index, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(index);
    } else {
        cart[index].quantity = newQuantity;
        saveCart();
        updateCartUI();
    }
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    renderCartItems();
}

function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartSummary = document.getElementById('cartSummary');
    
    if (cart.length === 0) {
        cartItemsContainer.style.display = 'none';
        cartEmpty.style.display = 'block';
        cartSummary.style.display = 'none';
    } else {
        cartItemsContainer.style.display = 'block';
        cartEmpty.style.display = 'none';
        cartSummary.style.display = 'block';
        
        cartItemsContainer.innerHTML = '';
        let total = 0;
        
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    ${item.size ? `<p>Size: ${item.size}</p>` : ''}
                    ${item.slices ? `<p>Slices: ${item.slices}</p>` : ''}
                    <p class="cart-item-price">₱${item.price} each</p>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="qty-btn" onclick="updateCartQuantity(${index}, ${item.quantity - 1})">-</button>
                        <span class="qty-display">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateCartQuantity(${index}, ${item.quantity + 1})">+</button>
                    </div>
                    <p class="cart-item-total">₱${itemTotal}</p>
                    <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItem);
        });
        
        document.getElementById('cartTotal').textContent = `₱${total}`;
    }
}

window.updateCartQuantity = updateCartQuantity;
window.removeFromCart = removeFromCart;

// ==========================================
// CART MODAL
// ==========================================
const cartModal = document.getElementById('cartModal');
const cartBtn = document.getElementById('cartBtn');
const closeCart = document.getElementById('closeCart');

cartBtn.addEventListener('click', () => {
    cartModal.classList.add('active');
    document.body.style.overflow = 'hidden';
});

closeCart.addEventListener('click', () => {
    cartModal.classList.remove('active');
    document.body.style.overflow = 'auto';
});

// ==========================================
// CHECKOUT
// ==========================================
const checkoutBtn = document.getElementById('checkoutBtn');

checkoutBtn.addEventListener('click', async () => {
    if (!userEmail) {
        alert('Please sign in to proceed with checkout');
        cartModal.classList.remove('active');
        signinModal.classList.add('active');
        return;
    }
    
    if (cart.length === 0) {
        alert('Your cart is empty');
        return;
    }
    
    // Disable checkout button while processing
    checkoutBtn.textContent = 'Processing...';
    checkoutBtn.disabled = true;
    
    let orderSummary = `Order from: ${userEmail}\n\n`;
    let total = 0;
    let orderItemsHTML = '<ul style="list-style: none; padding: 0;">';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        // Plain text version for email
        orderSummary += `${item.name}\n`;
        if (item.size) orderSummary += `  Size: ${item.size}\n`;
        if (item.slices) orderSummary += `  Slices: ${item.slices}\n`;
        orderSummary += `  Quantity: ${item.quantity}\n`;
        orderSummary += `  Price: ₱${itemTotal}\n\n`;
        
        // HTML version for better email formatting
        orderItemsHTML += `<li style="margin-bottom: 15px; padding: 10px; background: #f5f5f5; border-radius: 5px;">
            <strong>${item.name}</strong><br>
            ${item.size ? `Size: ${item.size}<br>` : ''}
            ${item.slices ? `Slices: ${item.slices}<br>` : ''}
            Quantity: ${item.quantity}<br>
            Price: ₱${itemTotal}
        </li>`;
    });
    
    orderItemsHTML += '</ul>';
    orderSummary += `Total: ₱${total}`;
    
    // Send order email to business
    const formData = new FormData();
    formData.append('access_key', '1e75e30f-eb9a-440d-890f-839a04409a0b');
    formData.append('subject', `New Order from ${userEmail} - ₱${total}`);
    formData.append('from_name', 'Wake & Bake Order System');
    formData.append('email', userEmail);
    formData.append('message', orderSummary);
    formData.append('to_email', 'wakeandbakerybusiness@gmail.com');
    
    try {
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            console.log('Order placed:', orderSummary);
            alert(`Thank you for your order!\n\nOrder total: ₱${total}\n\nWe'll contact you at ${userEmail} to confirm your order.`);
            
            // Clear cart after successful order
            cart = [];
            saveCart();
            updateCartUI();
            
            cartModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        } else {
            throw new Error('Order submission failed');
        }
    } catch (error) {
        console.error('Checkout error:', error);
        alert('There was an error processing your order. Please try again or contact us directly.');
    } finally {
        checkoutBtn.textContent = 'Proceed to Checkout';
        checkoutBtn.disabled = false;
    }
});

// ==========================================
// NAVIGATION FUNCTIONALITY
// ==========================================

const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === current) {
            link.classList.add('active');
        }
    });
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// ==========================================
// SHOP MODAL FUNCTIONALITY
// ==========================================

const shopModal = document.getElementById('shopModal');
const shopButtons = document.querySelectorAll('.shop-btn, .shop-trigger');
const shopCloseModal = shopModal.querySelector('.close-modal');
const shopModalOverlay = shopModal.querySelector('.modal-overlay');

shopButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        shopModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});

function closeShopModal() {
    shopModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

shopCloseModal.addEventListener('click', closeShopModal);
shopModalOverlay.addEventListener('click', closeShopModal);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (shopModal.classList.contains('active')) closeShopModal();
        if (cartModal.classList.contains('active')) {
            cartModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
        if (signinModal.classList.contains('active')) {
            signinModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }
});

// ==========================================
// DYNAMIC PRICING
// ==========================================

// Size / Slices select changes → update displayed price
document.querySelectorAll('.size-select, .slices-select').forEach(select => {
    select.addEventListener('change', function() {
        const card = this.closest('.product-card');
        const priceEl = card.querySelector('.product-price');
        const priceMap = JSON.parse(this.getAttribute('data-price-map'));
        const newPrice = priceMap[this.value];
        priceEl.textContent = '₱' + newPrice;
        priceEl.setAttribute('data-base-price', newPrice);

        // Animate the price change
        priceEl.classList.remove('price-change');
        void priceEl.offsetWidth; // trigger reflow
        priceEl.classList.add('price-change');
    });
});

// Quantity input changes → update displayed price
document.querySelectorAll('.quantity-input').forEach(input => {
    input.addEventListener('input', function() {
        // Clamp value
        let val = parseInt(this.value) || 1;
        if (val < 1) val = 1;
        if (val > 20) val = 20;
        this.value = val;

        const card = this.closest('.product-card');
        const priceEl = card.querySelector('.product-price');
        const unitPrice = parseInt(this.getAttribute('data-unit-price'));
        const newPrice = unitPrice * val;
        priceEl.textContent = '₱' + newPrice;
        priceEl.setAttribute('data-base-price', newPrice);

        // Animate the price change
        priceEl.classList.remove('price-change');
        void priceEl.offsetWidth;
        priceEl.classList.add('price-change');
    });
});

// ==========================================
// ADD TO CART FUNCTIONALITY
// ==========================================

const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

addToCartButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        e.stopPropagation();
        
        const productCard = this.closest('.product-card');
        const productName = productCard.querySelector('.product-name').textContent;
        const productPrice = parseInt(productCard.querySelector('.product-price').getAttribute('data-base-price'));
        
        const sizeSelect = productCard.querySelector('.size-select');
        const slicesSelect = productCard.querySelector('.slices-select');
        const quantityInput = productCard.querySelector('.quantity-input');
        
        // For quantity-based items: price is already unitPrice * qty in displayed price
        // but we store unitPrice in cart and use qty in cart for actual quantity management.
        // So for pastries with quantity input, we add unitPrice as the cart price and qty as quantity.
        let cartPrice, cartQty;
        if (quantityInput) {
            cartPrice = parseInt(quantityInput.getAttribute('data-unit-price'));
            cartQty = parseInt(quantityInput.value) || 1;
        } else {
            cartPrice = productPrice;
            cartQty = 1;
        }

        const product = {
            name: productName,
            price: cartPrice,
            size: sizeSelect ? sizeSelect.value : null,
            slices: slicesSelect ? slicesSelect.value : null,
            quantity: cartQty
        };
        
        addToCart(product);
        
        // Visual feedback on button
        const originalText = this.textContent;
        this.textContent = '✓ Added!';
        this.style.background = '#5cb85c';
        
        setTimeout(() => {
            this.textContent = originalText;
            this.style.background = '';
        }, 1500);
        
        showToast(`${productName} added to cart!`);
    });
});

// Toast notification function
function showToast(message) {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Add toast styles dynamically
const toastStyle = document.createElement('style');
toastStyle.textContent = `
    .toast-container {
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    
    .toast {
        background: var(--color-dark);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        transform: translateX(400px);
        opacity: 0;
        transition: all 0.3s ease;
        font-weight: 500;
        min-width: 200px;
    }
    
    .toast.show {
        transform: translateX(0);
        opacity: 1;
    }
    
    @media (max-width: 768px) {
        .toast-container {
            right: 10px;
            left: 10px;
            top: 90px;
        }
        
        .toast {
            min-width: auto;
        }
    }
`;
document.head.appendChild(toastStyle);

// ==========================================
// PRODUCT FILTERING
// ==========================================

const categoryButtons = document.querySelectorAll('.category-btn');
const productCards = document.querySelectorAll('.product-card');

categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        const selectedCategory = button.getAttribute('data-category');
        
        productCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.8) translateY(20px)';
        });
        
        setTimeout(() => {
            let visibleIndex = 0;
            productCards.forEach((card) => {
                const cardCategory = card.getAttribute('data-category');
                
                if (selectedCategory === 'all' || cardCategory === selectedCategory) {
                    setTimeout(() => {
                        card.classList.remove('hidden');
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1) translateY(0)';
                        card.style.transition = 'all 0.5s ease';
                    }, visibleIndex * 100);
                    visibleIndex++;
                } else {
                    card.classList.add('hidden');
                }
            });
        }, 200);
    });
});

// ==========================================
// LOGO ANIMATION ON CLICK
// ==========================================

const logoContainer = document.querySelector('.logo-container');

logoContainer.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ==========================================
// CONTACT FORM — Web3Forms
// ==========================================

const contactForm = document.getElementById('contactForm');
const submitBtn = contactForm.querySelector('.submit-btn');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const message = document.getElementById('contactMessage').value;
    
    if (!name || !email || !message) {
        showToast('Please fill in all fields.');
        return;
    }

    // Disable button while sending
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    // Prepare form data for Web3Forms
    const formData = new FormData();
    formData.append('access_key', 'a8c86d6e-8f9a-4b7d-9e3c-5a7b8c9d0e1f'); // Replace with your actual Web3Forms access key
    formData.append('name', name);
    formData.append('email', email);
    formData.append('message', message);
    formData.append('subject', 'New Contact Form Submission - Wake & Bake');
    formData.append('from_name', 'Wake & Bake Website');
    formData.append('to_email', 'wakeandbakerybusiness@gmail.com');

    try {
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            showToast('Message sent successfully! We will get back to you soon.');
            contactForm.reset();
        } else {
            throw new Error('Form submission failed');
        }
    } catch (error) {
        showToast('Failed to send. Please try again.');
        console.error('Form submission error:', error);
    } finally {
        submitBtn.textContent = 'Send Message';
        submitBtn.disabled = false;
    }
});

// ==========================================
// SCROLL ANIMATIONS
// ==========================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.about-content, .feature, .info-block').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ==========================================
// NAVBAR BACKGROUND ON SCROLL
// ==========================================

const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = '#FFFFFF';
        navbar.style.backdropFilter = 'none';
    }
});

// ==========================================
// PRODUCT CARD HOVER EFFECT
// ==========================================

productCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// ==========================================
// PREVENT MODAL SCROLL PROPAGATION
// ==========================================

const modalContent = document.querySelector('.modal-content');

modalContent.addEventListener('wheel', (e) => {
    const scrollTop = modalContent.scrollTop;
    const scrollHeight = modalContent.scrollHeight;
    const height = modalContent.clientHeight;
    const wheelDelta = e.deltaY;
    const isDeltaPositive = wheelDelta > 0;

    if (isDeltaPositive && wheelDelta > scrollHeight - height - scrollTop) {
        modalContent.scrollTop = scrollHeight;
        e.preventDefault();
    } else if (!isDeltaPositive && -wheelDelta > scrollTop) {
        modalContent.scrollTop = 0;
        e.preventDefault();
    }
});

// ==========================================
// BUTTON RIPPLE EFFECT
// ==========================================

function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    ripple.style.width = ripple.style.height = `${diameter}px`;
    ripple.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    ripple.style.top = `${event.clientY - button.offsetTop - radius}px`;
    ripple.classList.add('ripple');

    const existingRipple = button.querySelector('.ripple');
    if (existingRipple) {
        existingRipple.remove();
    }

    button.appendChild(ripple);
}

document.querySelectorAll('button, .cta-btn').forEach(button => {
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.addEventListener('click', createRipple);
});

const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ==========================================
// PAGE LOAD ANIMATION
// ==========================================

window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// ==========================================
// CONSOLE MESSAGE
// ==========================================

console.log('%c🍞 Welcome to Wake & Bake! 🥐', 'font-size: 20px; color: #A67446; font-weight: bold;');
console.log('%cFreshly baked with love ❤️', 'font-size: 14px; color: #6B4E3D;');

// ==========================================
// INITIALIZE ON LOAD
// ==========================================
initializeApp();

}); // End of DOMContentLoaded
