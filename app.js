const BATCH_SIZE = 25;
const SURPRISE_COUNT = 5;

const searchInput = document.getElementById("search");
const surpriseButton = document.getElementById("surprise");
const resultsList = document.getElementById("results");
const showMoreButton = document.getElementById("show-more");

let items = [];
let fuse = null;
let currentResults = [];
let shownCount = 0;

function render(list) {
  currentResults = list;
  shownCount = 0;
  resultsList.replaceChildren();
  showMore();
}

function showMore() {
  const next = currentResults.slice(shownCount, shownCount + BATCH_SIZE);
  const fragment = document.createDocumentFragment();

  for (const item of next) {
    const listItem = document.createElement("li");
    const link = document.createElement("a");
    link.href = item.link;
    link.textContent = item.title;
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
    listItem.append(link);
    fragment.append(listItem);
  }

  resultsList.append(fragment);
  shownCount += next.length;
  showMoreButton.hidden = shownCount >= currentResults.length;
}

function search() {
  if (!fuse) {
    return;
  }

  const query = searchInput.value.trim();
  const list = query
    ? fuse.search(query).map((result) => result.item)
    : items;

  render(list);
}

function pickRandom(list, count) {
  const pool = list.slice();
  const picks = Math.min(count, pool.length);

  // Partial Fisher-Yates: choose each position from the remaining items.
  for (let i = 0; i < picks; i += 1) {
    const j = i + Math.floor(Math.random() * (pool.length - i));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, picks);
}

searchInput.addEventListener("input", search);

surpriseButton.addEventListener("click", () => {
  searchInput.value = "";
  render(pickRandom(items, SURPRISE_COUNT));
});

showMoreButton.addEventListener("click", showMore);

async function loadItems() {
  try {
    const response = await fetch("items.json");
    if (!response.ok) {
      throw new Error(`Failed to load items.json: ${response.status}`);
    }

    items = await response.json();
    fuse = new Fuse(items, {
      keys: ["title", "categories"],
      threshold: 0.3,
      ignoreLocation: true,
    });

    search();
  } catch (error) {
    resultsList.textContent = "Could not load articles.";
    console.error(error);
  }
}

loadItems();
