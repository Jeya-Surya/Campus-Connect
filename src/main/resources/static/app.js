const API_BASE = 'http://localhost:8080/api'; // adjust if backend host/port differ

// fetch all doubts
async function fetchDoubts() {
    const res = await fetch(`${API_BASE}/doubts`);
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
}

// helper to select single element
function el(sel) {
    return document.querySelector(sel);
}

// render doubts on the page
async function render() {
    const container = el('#doubts');
    container.innerHTML = 'Loading...';
    try {
        const doubts = await fetchDoubts();
        container.innerHTML = '';
        const tmpl = document.querySelector('#doubt-template');

        doubts.forEach(d => {
            const node = tmpl.content.cloneNode(true);

            node.querySelector('.doubt-title').textContent = d.title;
            node.querySelector('.doubt-meta').textContent = `${d.author || 'Anonymous'}`;
            node.querySelector('.doubt-desc').textContent = d.description;

            const answersDiv = node.querySelector('.answers');
            answersDiv.innerHTML = '';

            if (d.answers && d.answers.length) {
                d.answers.forEach(a => {
                    const p = document.createElement('p');
                    p.classList.add('answer-item');
                    p.textContent = `${a.author || 'Anon'}: ${a.text}`;
                    answersDiv.appendChild(p);
                });
            } //else {
                //answersDiv.innerHTML = '<small>No answers yet — be the first!</small>';
            //}

            const submitBtn = node.querySelector('.answer-submit');
            if (submitBtn) {
                submitBtn.addEventListener('click', async (evt) => {
                    evt.preventDefault();
                    const form = evt.target.closest('.answer-form');
                    const authorInput = form.querySelector('.answer-author');
                    const textInput = form.querySelector('.answer-text');

                    const author = authorInput.value.trim() || 'Anonymous';
                    const text = textInput.value.trim();
                    if (!text) return alert('Enter an answer');

                    await postAnswer(d.id, { author, text });

                    // Clear inputs
                    authorInput.value = '';
                    textInput.value = '';

                    // Append new answer to existing div
                    const p = document.createElement('p');
                    p.classList.add('answer-item');
                    p.textContent = `${author}: ${text}`;
                    answersDiv.appendChild(p);
                });
            }

            container.appendChild(node);
        });

    } catch (err) {
        container.innerHTML = 'Error loading doubts.';
        console.error(err);
    }
}

// post a new doubt
async function postDoubt(payload) {
    const res = await fetch(`${API_BASE}/doubts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Post failed');
    return res.json();
}

// post an answer to a specific doubt
async function postAnswer(doubtId, payload) {
    const res = await fetch(`${API_BASE}/doubts/${doubtId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Post answer failed');
    return res.json();
}

// on page load
window.addEventListener('DOMContentLoaded', () => {
    render();

    // post new doubt
    const postBtn = document.getElementById('postBtn');
    if (postBtn) {
        postBtn.addEventListener('click', async () => {
            const title = document.getElementById('title').value.trim();
            const description = document.getElementById('description').value.trim();
            const author = document.getElementById('author').value.trim() || 'Anonymous';

            if (!title || !description) {
                return alert('Provide title and description');
            }

            try {
                await postDoubt({ title, description, author });
                document.getElementById('title').value = '';
                document.getElementById('description').value = '';
                document.getElementById('author').value = '';
                await render();
            } catch (e) {
                console.error(e);
                alert('Failed to post doubt');
            }
        });
    }
});


