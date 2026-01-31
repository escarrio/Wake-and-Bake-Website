// ==========================================
// WAIT FOR DOM TO LOAD
// ==========================================
document.addEventListener('DOMContentLoaded', function() {

// ==========================================
// GLOBAL VARIABLES
// ==========================================
let cart = [];
let userEmail = localStorage.getItem('userEmail') || null;
const BUSINESS_EMAIL = 'info@wakeandbake.ph'; // Your business email

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
    
    // Check if user has existing cart data
    const existingUserCart = localStorage.getItem(`cart_${email}`);
    const currentGuestCart = localStorage.getItem('guest_cart');
    
    // Save user email
    userEmail = email;
    localStorage.setItem('userEmail', email);
    
    // If user has existing cart, load it. Otherwise, migrate guest cart to user account
    if (existingUserCart) {
        cart = JSON.parse(existingUserCart);
    } else if (currentGuestCart && currentGuestCart !== '[]') {
        // Migrate guest cart to user account
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
        // Save current cart to user's account before signing out
        if (userEmail && cart.length > 0) {
            localStorage.setItem(`cart_${userEmail}`, JSON.stringify(cart));
        }
        
        // Clear user session but keep cart data saved
        const currentUserEmail = userEmail;
        userEmail = null;
        localStorage.removeItem('userEmail');
        
        // Clear current cart display
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
    // Check if product already exists in cart
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
    
    // Add bounce animation to cart button
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

// Make functions global so they can be called from onclick attributes
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

checkoutBtn.addEventListener('click', () => {
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
    
    // Create order summary
    let orderSummary = `Order from: ${userEmail}\n\n`;
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        orderSummary += `${item.name}\n`;
        if (item.size) orderSummary += `  Size: ${item.size}\n`;
        if (item.slices) orderSummary += `  Slices: ${item.slices}\n`;
        orderSummary += `  Quantity: ${item.quantity}\n`;
        orderSummary += `  Price: ₱${itemTotal}\n\n`;
    });
    
    orderSummary += `Total: ₱${total}`;
    
    console.log('Order placed:', orderSummary);
    alert(`Thank you for your order!\n\nOrder total: ₱${total}\n\nWe'll contact you at ${userEmail} to confirm your order.`);
    
    // Clear cart after checkout
    cart = [];
    saveCart();
    updateCartUI();
    
    cartModal.classList.remove('active');
    document.body.style.overflow = 'auto';
});

// ==========================================
// NAVIGATION FUNCTIONALITY
// ==========================================

// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a nav link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Active navigation highlighting on scroll
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

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // Don't prevent default if it's just "#" (for shop triggers)
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

// Open modal
shopButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        shopModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});

// Close modal function
function closeShopModal() {
    shopModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Close modal on close button click
shopCloseModal.addEventListener('click', closeShopModal);

// Close modal on overlay click
shopModalOverlay.addEventListener('click', closeShopModal);

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (shopModal.classList.contains('active')) {
            closeShopModal();
        }
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
// ADD TO CART FUNCTIONALITY
// ==========================================

const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

addToCartButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        e.stopPropagation();
        
        const productCard = this.closest('.product-card');
        const productName = productCard.querySelector('.product-name').textContent;
        const productPriceText = productCard.querySelector('.product-price').textContent;
        const productPrice = parseInt(productPriceText.replace('₱', ''));
        
        // Get product options
        const sizeSelect = productCard.querySelector('.size-select');
        const slicesSelect = productCard.querySelector('.slices-select');
        const quantityInput = productCard.querySelector('.quantity-input');
        
        const product = {
            name: productName,
            price: productPrice,
            size: sizeSelect ? sizeSelect.value : null,
            slices: slicesSelect ? slicesSelect.value : null,
            quantity: quantityInput ? parseInt(quantityInput.value) : 1
        };
        
        addToCart(product);
        
        // Visual feedback
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
        
        // First, hide all cards quickly
        productCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.8) translateY(20px)';
        });
        
        // Then show matching cards with staggered animation
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
// CONTACT FORM HANDLING
// ==========================================

const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const message = document.getElementById('contactMessage').value;
    
    if (name && email && message) {
        // Create mailto link with all information
        const subject = encodeURIComponent(`Contact Form Message from ${name}`);
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
        const mailtoLink = `mailto:${BUSINESS_EMAIL}?subject=${subject}&body=${body}`;
        
        // Open email client
        window.location.href = mailtoLink;
        
        // Show success message
        showToast('Opening your email client...');
        
        // Reset form
        contactForm.reset();
    } else {
        alert('Please fill in all fields.');
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
