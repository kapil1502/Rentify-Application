async function likePost(propertyId) {
    try {
        const response = await fetch(`/buyer/like-post/${propertyId}`, { method: 'POST' });
        const data = await response.json();
        if (data.success) {
            document.getElementById(`like-count-${propertyId}`).textContent = `Likes: ${data.likes[0].likes_count}`;
        } else {
            alert('Failed to like the post');
        }
    } catch (error) {
        console.error('Error liking post:', error);
        alert('Error liking post');
    }
}

async function fetchSellerDetailsWithNotify(propertyId) {
    try {
        const response = await fetch(`/buyer/seller-details/${propertyId}`);
        const data = await response.json();

        if (data.success) {
            const modalBody = document.getElementById('modal-body-content');
            modalBody.innerHTML = `
                <p><strong>Name:</strong> ${data.seller.f_name} ${data.seller.l_name}</p><hr>
                <p><strong>Email:</strong> ${data.seller.email}</p><hr>
                <p><strong>Contact:</strong> ${data.seller.contact}</p><hr>
            `;
        } else {
            alert('Failed to fetch seller details');
        }
    } catch (error) {
        alert('Error fetching seller details');
    }
}

function displayPosts(sortedPosts) {

    const postsContainer = document.getElementById('posts-container-new');
    postsContainer.innerHTML = ''; // Clear current posts

    sortedPosts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';

        const imageContent = post.image 
            ? `<img src="data:image/jpeg;base64,${post.image} alt="Property Image" />` 
            : '<p>No image available</p>';

        postElement.innerHTML = `
            <h2>Property ID: ${post.property_id}</h2>
            <p><strong>Place:</strong> ${post.place}</p>
            <p><strong>Area:</strong> ${post.area} sq ft</p>
            <p><strong>Bedrooms:</strong> ${post.number_bedroom}</p>
            <p><strong>Bathrooms:</strong> ${post.number_bathroom}</p>
            <p><strong>Hospitals Nearby:</strong> ${post.number_hospital}</p>
            <p><strong>Colleges Nearby:</strong> ${post.number_college}</p>
            ${imageContent}
            <button onclick="showSellerDetails('${post.property_id}')" class="add-new-post">I am interested</button>
            <button onclick="likePost('${post.property_id}')" class="like-btn">👍 Like</button>
            <p id="like-count-${post.property_id}">Likes: ${post.likes_count}</p>
        `;

        postsContainer.appendChild(postElement);
    });
}


function sortPosts(posts) {
    const sortBy = document.getElementById('sort-options').value;
    let sortedPosts;

    switch (sortBy) {
        case 'likes':
            sortedPosts = posts.sort((a, b) => a.likes_count - b.likes_count);
            break;
        case 'area':
            sortedPosts = posts.sort((a, b) => a.area - b.area);
            break;
        case 'bedrooms':
            sortedPosts = posts.sort((a, b) => a.number_bedroom - b.number_bedroom);
            break;
        case 'bathrooms':
            sortedPosts = posts.sort((a, b) => a.number_bathroom - b.number_bathroom);
            break;
        case 'hospitals':
            sortedPosts = posts.sort((a, b) => a.number_hospital - b.number_hospital);
            break;
        case 'colleges':
            sortedPosts = posts.sort((a, b) => a.number_college - b.number_college);
            break;
        default:
            sortedPosts = posts;
    }

    displayPosts(sortedPosts);
}

function validateForm() {
    let isValid = true;

    // First Name validation
    const fName = document.getElementById('f_name').value;
    const fNameError = document.getElementById('f_nameError');
    if (fName.trim() === '') {
        fNameError.textContent = 'First Name is required.';
        isValid = false;
    } else {
        fNameError.textContent = '';
    }

    // Last Name validation
    const lName = document.getElementById('l_name').value;
    const lNameError = document.getElementById('l_nameError');
    if (lName.trim() === '') {
        lNameError.textContent = 'Last Name is required.';
        isValid = false;
    } else {
        lNameError.textContent = '';
    }

    // Email validation
    const email = document.getElementById('email').value;
    const emailError = document.getElementById('emailError');
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
        emailError.textContent = 'Please enter a valid email address.';
        isValid = false;
    } else {
        emailError.textContent = '';
    }

    // Contact number validation
    const contact = document.getElementById('contact').value;
    const contactError = document.getElementById('contactError');
    const contactPattern = /^\d{10}$/;
    if (!contactPattern.test(contact)) {
        contactError.textContent = 'Please enter a valid 10-digit contact number.';
        isValid = false;
    } else {
        contactError.textContent = '';
    }

    // Password validation
    const password = document.getElementById('password').value;
    const passwordError = document.getElementById('passwordError');
    if (password.length < 8) {
        passwordError.textContent = 'Password must be at least 8 characters long.';
        isValid = false;
    } else {
        passwordError.textContent = '';
    }

    // Confirm password validation
    const confirmPassword = document.getElementById('confirmPassword').value;
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    if (confirmPassword !== password) {
        confirmPasswordError.textContent = 'Passwords do not match.';
        isValid = false;
    } else {
        confirmPasswordError.textContent = '';
    }

    return isValid;
}