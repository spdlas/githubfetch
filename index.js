const API_URL = 'https://api.github.com/search/repositories?q=';
const input = document.getElementById('repo-input');
const autocompleteList = document.getElementById('autocomplete-list');
const repoList = document.getElementById('repo-list');

//Ограничения количества запросов к API
function debounce(func, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
}

// Запрос репозиториев
async function fetchRepositories(query) {
    if (!query) return [];
    try {
        const response = await fetch(`${API_URL}${encodeURIComponent(query)}&per_page=5`);
        if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
        const data = await response.json();
        return data.items || [];
    } catch (error) {
        console.error(error);
        return [];
    }
}

// втозаполнение
function renderAutocomplete(repos) {
    autocompleteList.innerHTML = '';
    if (repos.length === 0) return;

    repos.forEach(repo => {
        const li = document.createElement('li');
        li.textContent = repo.full_name;
        li.addEventListener('click', () => addRepoToList(repo));
        autocompleteList.appendChild(li);
    });
}

// Добавление репозитория в список
function addRepoToList(repo) {
    const repoItem = document.createElement('div');
    repoItem.classList.add('repo-item');
    repoItem.innerHTML = `
    <div class="repo-info">
      Name:${repo.name}<br>
      Owner: ${repo.owner.login}<br>
      Stars: ${repo.stargazers_count}
    </div>
    <button class="remove-btn"></button>
  `;

    const removeBtn = repoItem.querySelector('.remove-btn');
    removeBtn.addEventListener('click', () => repoItem.remove());

    repoList.appendChild(repoItem);

    // Очистка поля ввода и скрытие автозаполнения
    input.value = '';
    autocompleteList.innerHTML = '';
}

// Обработка изменений в поле ввода
const handleInputChange = debounce(async (event) => {
    const query = event.target.value.trim();
    if (!query) {
        autocompleteList.innerHTML = '';
        return;
    }
    const repos = await fetchRepositories(query);
    renderAutocomplete(repos);
}, 300);

// Привязка обработчика событий к полю ввода
input.addEventListener('input', handleInputChange);

// Скрытие списка автозаполнения при клике вне области
document.addEventListener('click', (event) => {
    if (!event.target.closest('#autocomplete-container')) {
        autocompleteList.innerHTML = '';
    }
});
